// src/lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk'
import type { ProductProfile, ScoringResult, ReplyResult, PainType } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Product Scraper ──────────────────────────────────────────────────────────

export async function scrapeProductProfile(url: string, html: string): Promise<ProductProfile> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `You are analysing a SaaS product. Extract a structured product profile.

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

If HTML is unavailable, make your best inference from the URL and domain name. Always return a complete JSON object.`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text) as ProductProfile
}

// ─── Subreddit Discovery ──────────────────────────────────────────────────────

export async function discoverSubreddits(product: ProductProfile): Promise<Array<{
  name: string
  fitScore: number
  fitReason: string
}>> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
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

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
  return JSON.parse(text)
}

// ─── Intent Scoring ───────────────────────────────────────────────────────────

export async function scoreOpportunity(
  thread: { title: string; body: string; topComments: string[] },
  product: ProductProfile
): Promise<ScoringResult> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
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
  return JSON.parse(text) as ScoringResult
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
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are writing a Reddit reply on behalf of a founder. The reply must sound like a real human, not a marketer.

PRODUCT: ${product.name}
PRODUCT URL: ${product.url}
PRODUCT SUMMARY: ${product.summary}

SUBREDDIT: r/${thread.subreddit}
THREAD TITLE: ${thread.title}
THREAD BODY: ${thread.body || '(no body)'}

PAIN TYPE: ${painType}
TONE INSTRUCTION: ${toneInstructions[painType]}
PITCH RULE: ${pitchInstruction}

STRICT RULES:
- Never start with the product name
- Never use phrases like "I'd recommend", "You should check out", "As a [job title]"
- Never use bullet points unless the thread specifically warrants a list
- Max 140 words unless a longer reply would genuinely help
- Match the casual/professional tone of r/${thread.subreddit}
- Sound like a peer, not a marketer
- Vary the opening — never start with "I've been in your exact situation"
- If including the product link, use Reddit markdown: [Product Name](url)

Return ONLY valid JSON, no markdown:
{
  "text": "the full reply text",
  "toneUsed": "brief description of tone e.g. empathetic peer, direct advisor",
  "whyThisWorks": "1 sentence explaining why this reply will resonate with this specific person"
}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const result = JSON.parse(text) as ReplyResult
  result.text = await humaniseReply(result.text, thread.subreddit)
  return result
}

// ─── Humanising Filter ───────────────────────────────────────────────────────

async function humaniseReply(text: string, subreddit: string): Promise<string> {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `You are editing a Reddit reply to make it sound like a real person typed it quickly, not an AI.

SUBREDDIT: r/${subreddit}
ORIGINAL REPLY:
${text}

EDITING RULES:
- Target 50–90 words. Cut ruthlessly — remove any sentence that doesn't add real value
- Use contractions everywhere (don't, it's, you're, can't, I've)
- Remove: "certainly", "absolutely", "I understand", "great question", "I hope this helps", "feel free to", "I would suggest", "it's worth noting", "essentially", "ultimately"
- No bullet points or numbered lists unless the original had them for a structural reason
- No multi-paragraph walls of text — 1-2 short paragraphs max
- Keep any product links exactly as they are ([Name](url) format)
- If the reply starts with "I", rewrite the opening so it doesn't
- Add one small natural imperfection if appropriate (a casual phrase, an em dash, a "tbh", "honestly", "ngl") — but only if it fits
- Do NOT change the core message, advice, or any facts

Return ONLY the edited reply text. No explanation, no JSON, just the reply.`
      }]
    })
    const edited = response.content[0].type === 'text' ? response.content[0].text.trim() : text
    return edited || text
  } catch {
    return text
  }
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
    model: 'claude-sonnet-4-20250514',
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
- Keep it conversational and short (50–100 words)
- Never start with "Great point" or "Absolutely" or sycophantic openers
- Sound like a peer responding in a thread, not a brand
- Match the tone of r/${thread.subreddit}

Return ONLY valid JSON, no markdown:
{
  "text": "the reply text",
  "whyThisWorks": "1 sentence on why this reply works for this specific comment"
}`
    }]
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  const result = JSON.parse(raw) as { text: string; whyThisWorks: string }
  result.text = await humaniseReply(result.text, thread.subreddit)
  return result
}

// ─── Keyword Suggestions ─────────────────────────────────────────────────────

export async function generateKeywordSuggestions(product: ProductProfile): Promise<string[]> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
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
  try { return JSON.parse(text) } catch { return [] }
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
    model: 'claude-sonnet-4-20250514',
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
    model: 'claude-sonnet-4-20250514',
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
