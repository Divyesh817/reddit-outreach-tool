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
      content: `You are analysing a SaaS product landing page. Extract a structured product profile.

URL: ${url}

PAGE HTML (truncated):
${html.slice(0, 8000)}

Return ONLY valid JSON, no markdown, no explanation:
{
  "name": "product name",
  "description": "1-2 sentence description of what it does",
  "targetAudience": "who this is for (be specific)",
  "keyBenefits": ["benefit 1", "benefit 2", "benefit 3"],
  "competitors": ["competitor names mentioned on page or implied"],
  "summary": "3-4 sentence summary optimised for Reddit reply generation — include audience, pain solved, key differentiator"
}`
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
  shouldPitch: boolean
): Promise<ReplyResult> {
  const toneInstructions: Record<PainType, string> = {
    competitor_frustration: 'Acknowledge their frustration with the competitor first. Be empathetic. Only mention the product after validating their pain. Never trash the competitor directly.',
    switching_intent: 'Be direct and helpful. They are ready to switch — give them a clear, confident recommendation with a soft CTA. No fluff.',
    active_tool_search: 'Give a helpful comparison-style reply. Mention 1-2 other options first, then recommend the product as the best fit for their specific situation.',
    roi_frustration: 'Validate their frustration — "I had the same issue." Then explain what actually worked. Position the product as the solution you found.',
    workflow_pain: 'Empathise with the workflow struggle. Explain how the product solves this specific pain point. Keep it conversational.',
  }

  const pitchInstruction = shouldPitch
    ? 'You MAY mention the product URL naturally at the end if it fits.'
    : 'Do NOT mention the product or any URL. Write a purely helpful, empathetic reply that builds goodwill. No pitch.'

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `You are writing a Reddit reply on behalf of a founder. The reply must sound like a real human, not a marketer.

PRODUCT: ${product.name}
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
- Max 120 words unless a longer reply would genuinely help
- Match the casual/professional tone of r/${thread.subreddit}
- Sound like a peer, not a marketer
- Vary the opening — never start with "I've been in your exact situation"

Return ONLY valid JSON, no markdown:
{
  "text": "the full reply text",
  "toneUsed": "brief description of tone e.g. empathetic peer, direct advisor",
  "whyThisWorks": "1 sentence explaining why this reply will resonate with this specific person"
}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text) as ReplyResult
}

// ─── Warmup Comment Generation ────────────────────────────────────────────────

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
