// src/lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk'
import type { ProductProfile, ScoringResult, ReplyResult, PainType } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function parseJSON(text: string) {
  // Strip markdown code fences and any leading/trailing prose
  let clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  // Extract first JSON object or array if Claude added extra text around it
  const objMatch = clean.match(/\{[\s\S]*\}/)
  const arrMatch = clean.match(/\[[\s\S]*\]/)
  if (objMatch && (!arrMatch || objMatch.index! <= arrMatch.index!)) clean = objMatch[0]
  else if (arrMatch) clean = arrMatch[0]
  return JSON.parse(clean)
}

// ─── Product Scraper ──────────────────────────────────────────────────────────

export async function scrapeProductProfile(url: string, html: string): Promise<ProductProfile> {
  const prompt = `You are analysing a SaaS product. Extract a structured product profile.

URL: ${url}

${html.trim() ? `PAGE HTML (truncated):\n${html.slice(0, 8000)}` : `(Page HTML unavailable — infer product details from the URL and domain name.)`}

Return ONLY valid JSON, no markdown, no explanation:
{
  "name": "product name",
  "description": "1-2 sentence description of what it does",
  "targetAudience": "who this is for (be specific)",
  "keyBenefits": ["benefit 1", "benefit 2", "benefit 3"],
  "competitors": ["competitor names mentioned on page or implied"],
  "summary": "3-4 sentence summary optimised for Reddit reply generation — include audience, pain solved, key differentiator"
}

If HTML is unavailable, make your best inference from the URL and domain name. Always return a complete JSON object with all 6 fields populated.`

  let parsed: any = null

  // Try twice — Claude occasionally wraps in prose on first attempt
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      parsed = parseJSON(text)
      break
    } catch {
      if (attempt === 1) throw new Error('Failed to parse product profile from AI response')
    }
  }

  // Guarantee every field is present and non-null — DB columns are NOT NULL
  const domain = (() => { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } })()
  return {
    url,
    name:           String(parsed?.name           || domain),
    description:    String(parsed?.description    || `A product at ${domain}`),
    targetAudience: String(parsed?.targetAudience || 'Business owners and professionals'),
    keyBenefits:    Array.isArray(parsed?.keyBenefits)  ? parsed.keyBenefits.map(String).filter(Boolean)  : [],
    competitors:    Array.isArray(parsed?.competitors)  ? parsed.competitors.map(String).filter(Boolean)   : [],
    summary:        String(parsed?.summary || parsed?.description || `A product at ${domain}`),
  }
}

// ─── Subreddit Discovery ──────────────────────────────────────────────────────

export async function discoverSubreddits(product: ProductProfile): Promise<Array<{
  name: string
  fitScore: number
  fitReason: string
}>> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `You are a Reddit marketing expert. Suggest the best subreddits to find high-intent leads for this product.

PRODUCT SUMMARY:
${product.summary}

TARGET AUDIENCE: ${product.targetAudience}
COMPETITORS: ${product.competitors.join(', ')}

Rules:
- Only suggest subreddits where the target audience actually hangs out
- Include subreddits where competitor complaints are likely
- Exclude subreddits with strict no-self-promotion rules (r/startups, r/entrepreneur have strict rules — include but flag)
- Score fit 0–100 based on audience match

Return ONLY valid JSON array, no markdown:
[
  { "name": "SaaS", "fitScore": 92, "fitReason": "Founders actively discuss tools here" },
  ...
]

Return 8–12 subreddits.`
    }]
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
    const parsed = parseJSON(text)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((s: any) => s?.name)
      .map((s: any) => ({
        name: String(s.name).replace(/^\/?r\//i, '').trim(),
        fitScore: Math.min(100, Math.max(0, Number(s.fitScore) || 70)),
        fitReason: String(s.fitReason || ''),
      }))
  } catch { return [] }
}

// ─── Intent Scoring ───────────────────────────────────────────────────────────

export async function scoreOpportunity(
  thread: { title: string; body: string; topComments: string[] },
  product: ProductProfile
): Promise<ScoringResult> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `You are analysing a Reddit thread for buying intent relevant to a specific product.

PRODUCT SUMMARY:
${product.summary}

THREAD TITLE: ${thread.title}
THREAD BODY: ${thread.body || '(no body)'}
TOP COMMENTS: ${thread.topComments.slice(0, 3).join('\n---\n')}

Classify this thread:

PAIN TYPES:
- competitor_frustration: mentions a competitor (${product.competitors.join(', ')}) negatively
- switching_intent: actively looking to switch tools right now
- active_tool_search: asking for tool recommendations
- roi_frustration: using tools but getting no results / ROI
- workflow_pain: struggling with the core problem the product solves

Return ONLY valid JSON, no markdown:
{
  "intentScore": 0-100,
  "painType": "one of the 5 pain types",
  "shouldPitch": true/false,
  "reasoning": "1-2 sentences explaining the score and classification"
}

shouldPitch = false if: thread is just venting with no solution-seeking, thread is hostile to marketing, or pitching would get downvoted.`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseJSON(text) as ScoringResult
}

// ─── Batch Intent Scoring (Haiku — 1 call for up to 15 threads) ──────────────

export async function batchScoreOpportunities(
  threads: { id: string; title: string; body: string }[],
  product: ProductProfile
): Promise<ScoringResult[]> {
  if (!threads.length) return []

  const threadList = threads.map((t, i) =>
    `[${i}] ID:${t.id}\nTITLE: ${t.title}\nBODY: ${t.body?.slice(0, 300) || '(no body)'}`
  ).join('\n\n')

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are scoring Reddit threads for buying intent relevant to a specific product.

PRODUCT SUMMARY:
${product.summary}
COMPETITORS: ${product.competitors.join(', ') || 'none'}

PAIN TYPES:
- competitor_frustration: mentions a competitor negatively
- switching_intent: actively looking to switch tools right now
- active_tool_search: asking for tool recommendations
- roi_frustration: using tools but getting no results or ROI
- workflow_pain: struggling with the core problem the product solves

THREADS TO SCORE:
${threadList}

Return ONLY a valid JSON array with one entry per thread, in the same order:
[
  {"id":"<thread id>","intentScore":0-100,"painType":"one of the 5 types","shouldPitch":true,"reasoning":"1 sentence"},
  ...
]

shouldPitch = false only if the thread is hostile to marketing or pitching would get downvoted.
Return exactly ${threads.length} entries. No markdown, no explanation.`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
  try {
    const results = parseJSON(text) as ScoringResult[]
    // Ensure every thread gets a result, fill missing with score 0
    return threads.map((t, i) => results[i] ?? { intentScore: 0, painType: 'workflow_pain', shouldPitch: false, reasoning: '' })
  } catch {
    return threads.map(() => ({ intentScore: 0, painType: 'workflow_pain' as PainType, shouldPitch: false, reasoning: '' }))
  }
}

// ─── Reply Generation ─────────────────────────────────────────────────────────

export async function generateReply(
  thread: { title: string; body: string; subreddit: string },
  product: ProductProfile,
  painType: PainType,
  shouldPitch: boolean,
  // Override: when the user explicitly toggles the pitch on/off in the UI
  includePitchOverride?: boolean
): Promise<ReplyResult> {
  const pitch = includePitchOverride !== undefined ? includePitchOverride : shouldPitch

  const toneInstructions: Record<PainType, string> = {
    competitor_frustration: 'Acknowledge their frustration with the competitor first. Be empathetic. Only mention the product after validating their pain. Never trash the competitor directly.',
    switching_intent: 'Be direct and helpful. They are ready to switch — give them a clear, confident recommendation with a soft CTA. No fluff.',
    active_tool_search: 'Give a helpful comparison-style reply. Mention 1-2 other options first, then recommend the product as the best fit for their specific situation.',
    roi_frustration: 'Validate their frustration — "I had the same issue." Then explain what actually worked. Position the product as the solution you found.',
    workflow_pain: 'Empathise with the workflow struggle. Explain how the product solves this specific pain point. Keep it conversational.',
  }

  const pitchInstruction = pitch
    ? `You MUST naturally mention the product at the end using a Reddit markdown link, like: "Here's what I use — [${product.name}](${product.url})". Make it feel like a personal recommendation, not an ad. Lead with the helpful reply first.`
    : 'Do NOT mention the product or any URL. Write a purely helpful, empathetic reply that builds goodwill. No pitch at all.'

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are writing a Reddit reply on behalf of a founder. Write it as a real human would type it — casual, direct, no AI tells.

PRODUCT: ${product.name}
PRODUCT URL: ${product.url}
PRODUCT SUMMARY: ${product.summary}

SUBREDDIT: r/${thread.subreddit}
THREAD TITLE: ${thread.title}
THREAD BODY: ${thread.body || '(no body)'}

PAIN TYPE: ${painType}
TONE: ${toneInstructions[painType]}
PITCH RULE: ${pitchInstruction}

REPLY RULES (follow all):
- 50–100 words. Cut anything that doesn't add value
- Use contractions (don't, it's, you're, I've, can't)
- Never start with "I" — vary the opening each time
- Never use: "certainly", "absolutely", "I understand", "great question", "I hope this helps", "feel free to", "essentially", "ultimately"
- No bullet points unless the thread is a list-style question
- 1–2 short paragraphs max
- Match the tone of r/${thread.subreddit} — casual or professional as appropriate
- Sound like a peer, not a marketer
- Add one small natural touch if it fits: an em dash, "tbh", "honestly", "ngl"
- If including product link, use Reddit markdown: [Product Name](url)

Return ONLY valid JSON, no markdown:
{
  "text": "the reply — ready to post, no editing needed",
  "toneUsed": "brief description e.g. empathetic peer, direct advisor",
  "whyThisWorks": "1 sentence on why this resonates with this specific person"
}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseJSON(text) as ReplyResult
}

// ─── Comment Reply Generator ─────────────────────────────────────────────────

export async function generateCommentReply(
  thread: { title: string; subreddit: string },
  comment: { author: string; body: string },
  product: ProductProfile,
  shouldPitch: boolean
): Promise<{ text: string; whyThisWorks: string }> {
  const pitchInstruction = shouldPitch
    ? `You MAY naturally mention the product at the end if it genuinely fits: "[${product.name}](${product.url})". Only include it if the comment creates an opening — do not force it.`
    : 'Do NOT mention the product or any URL. Write a purely helpful, empathetic reply that adds value.'

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `You are writing a Reddit comment reply on behalf of a founder. Sound like a real human in a conversation — not a marketer.

PRODUCT: ${product.name}
PRODUCT SUMMARY: ${product.summary}

SUBREDDIT: r/${thread.subreddit}
THREAD TITLE: ${thread.title}

COMMENT TO REPLY TO (by u/${comment.author}):
"${comment.body}"

PITCH RULE: ${pitchInstruction}

RULES:
- Directly address what u/${comment.author} said — don't ignore their specific point
- 40–80 words, conversational, ready to post
- Use contractions (don't, it's, can't, I've)
- Never start with "Great point", "Absolutely", "Certainly", or sycophantic openers
- Never start with "I" — vary the opening
- Sound like a peer, not a brand
- Match the tone of r/${thread.subreddit}

Return ONLY valid JSON, no markdown:
{
  "text": "the reply text",
  "whyThisWorks": "1 sentence on why this reply works for this specific comment"
}`
    }]
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseJSON(raw) as { text: string; whyThisWorks: string }
}

// ─── Keyword Suggestions ─────────────────────────────────────────────────────

export async function generateKeywordSuggestions(product: ProductProfile): Promise<string[]> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `You are a Reddit marketing expert. Generate buying-intent keyword phrases that people type on Reddit when they are actively looking for a solution like this product.

PRODUCT: ${product.name}
AUDIENCE: ${product.targetAudience}
COMPETITORS: ${product.competitors.join(', ') || 'none mentioned'}
PROBLEM SOLVED: ${product.description}

Return ONLY valid JSON array of 10–14 short phrases (2–5 words each), no markdown:
["phrase one", "phrase two", ...]

Rules:
- Phrases should match real Reddit language — casual, not corporate
- Mix switching intent ("alternative to", "switching from"), tool search ("best tool for", "anyone using"), frustration ("tired of", "sick of")
- Include competitor-specific phrases if competitors are named
- No single words, no generic jargon`
    }]
  })
  const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
  try { return parseJSON(text) } catch { return [] }
}

// ─── Warmup Comment Generation ────────────────────────────────────────────────

// ─── GEO Analysis ────────────────────────────────────────────────────────────

export interface GeoAnalysis {
  geoScore: number
  summary: string
  dimensions: Record<string, { score: number; label: string; insight: string }>
  redditStrategy: { subreddit: string; reason: string; action: string }[]
  contentIdeas: { title: string; subreddit: string; type: string; why: string }[]
  competitorComparison: { name: string; estimatedGeoScore: number; gap: string }[]
  quickWins: string[]
}

export async function runGeoAnalysis(product: {
  name: string; url: string; description: string;
  targetAudience: string; keyBenefits: unknown; competitors: unknown;
}): Promise<GeoAnalysis> {
  const keyBenefits = Array.isArray(product.keyBenefits) ? (product.keyBenefits as string[]).join(', ') : String(product.keyBenefits ?? '')
  const competitors = Array.isArray(product.competitors) ? (product.competitors as string[]).join(', ') : String(product.competitors ?? '')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1800,
    messages: [{
      role: 'user',
      content: `You are a Generative Engine Optimization (GEO) expert. Analyze how well this product is positioned to appear in AI-generated answers (ChatGPT, Claude, Gemini, Perplexity).

PRODUCT NAME: ${product.name}
PRODUCT URL: ${product.url}
DESCRIPTION: ${product.description ?? ''}
TARGET AUDIENCE: ${product.targetAudience ?? ''}
KEY BENEFITS: ${keyBenefits || 'not specified'}
COMPETITORS: ${competitors || 'none listed'}

Analyze across 5 dimensions. Return ONLY valid JSON with NO markdown code fences:
{
  "geoScore": 42,
  "summary": "two sentence assessment here",
  "dimensions": {
    "aiVisibility": { "score": 40, "label": "AI Visibility", "insight": "one sentence" },
    "contentDepth": { "score": 35, "label": "Content Depth", "insight": "one sentence" },
    "communityPresence": { "score": 50, "label": "Community Presence", "insight": "one sentence" },
    "competitorGap": { "score": 45, "label": "Competitor Gap", "insight": "one sentence" },
    "intentAlignment": { "score": 60, "label": "Intent Alignment", "insight": "one sentence" }
  },
  "redditStrategy": [
    { "subreddit": "subredditname", "reason": "why this community helps GEO", "action": "specific angle to use" }
  ],
  "contentIdeas": [
    { "title": "post title", "subreddit": "subredditname", "type": "post", "why": "why this improves AI visibility" }
  ],
  "competitorComparison": [
    { "name": "competitor", "estimatedGeoScore": 60, "gap": "what they do better or worse" }
  ],
  "quickWins": ["action 1", "action 2", "action 3"]
}

Rules: redditStrategy 3-5 items, contentIdeas 3-4 items, competitorComparison 2-3 items. Output raw JSON only, absolutely no markdown.`
    }]
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  return JSON.parse(cleaned) as GeoAnalysis
}

export async function generateWarmupComment(
  thread: { title: string; body: string; subreddit: string }
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Write a short, genuinely helpful Reddit comment for this thread. 

SUBREDDIT: r/${thread.subreddit}
THREAD: ${thread.title}
BODY: ${thread.body?.slice(0, 500) || ''}

Rules:
- No product mentions, no URLs, no self-promotion whatsoever
- Sound like a knowledgeable community member
- 1-3 sentences max
- Be actually useful

Return ONLY the comment text, nothing else.`
    }]
  })

  return response.content[0].type === 'text' ? response.content[0].text.trim() : ''
}
