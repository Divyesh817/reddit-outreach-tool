// Default AI prompts — mirrors the prompts in lib/anthropic.ts
// These are displayed/editable in the admin panel.
// When a DB override exists, anthropic.ts should prefer it.

export interface PromptDefault {
  key: string
  name: string
  content: string
}

export const DEFAULT_AI_PROMPTS: PromptDefault[] = [
  {
    key: 'product-scraper',
    name: 'Product Scraper',
    content: `You are analysing a SaaS product. Extract a structured product profile.

URL: {{url}}

{{html}}

Return ONLY valid JSON, no markdown, no explanation:
{
  "name": "product name",
  "description": "1-2 sentence description of what it does",
  "targetAudience": "who this is for (be specific)",
  "keyBenefits": ["benefit 1", "benefit 2", "benefit 3"],
  "competitors": ["competitor names mentioned on page or implied"],
  "summary": "3-4 sentence summary optimised for Reddit reply generation — include audience, pain solved, key differentiator"
}

If HTML is unavailable, make your best inference from the URL and domain name. Always return a complete JSON object.`,
  },
  {
    key: 'subreddit-discovery',
    name: 'Subreddit Discovery',
    content: `You are a Reddit marketing expert. Suggest the best subreddits to find high-intent leads for this product.

PRODUCT SUMMARY:
{{summary}}

TARGET AUDIENCE: {{targetAudience}}
COMPETITORS: {{competitors}}

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

Return 8–12 subreddits.`,
  },
  {
    key: 'intent-scoring',
    name: 'Intent Scoring',
    content: `You are analysing a Reddit thread for buying intent relevant to a specific product.

PRODUCT SUMMARY:
{{summary}}

THREAD TITLE: {{title}}
THREAD BODY: {{body}}
TOP COMMENTS: {{topComments}}

Classify this thread:

PAIN TYPES:
- competitor_frustration: mentions a competitor ({{competitors}}) negatively
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

shouldPitch = false if: thread is just venting with no solution-seeking, thread is hostile to marketing, or pitching would get downvoted.`,
  },
  {
    key: 'reply-generation',
    name: 'Reply Generation (Post)',
    content: `You are writing a Reddit reply on behalf of a founder. The reply must sound like a real human, not a marketer.

PRODUCT: {{productName}}
PRODUCT URL: {{productUrl}}
PRODUCT SUMMARY: {{summary}}

SUBREDDIT: r/{{subreddit}}
THREAD TITLE: {{title}}
THREAD BODY: {{body}}

PAIN TYPE: {{painType}}
TONE INSTRUCTION: {{toneInstruction}}
PITCH RULE: {{pitchInstruction}}

STRICT RULES:
- Never start with the product name
- Never use phrases like "I'd recommend", "You should check out", "As a [job title]"
- Never use bullet points unless the thread specifically warrants a list
- Max 140 words unless a longer reply would genuinely help
- Match the casual/professional tone of r/{{subreddit}}
- Sound like a peer, not a marketer
- Vary the opening — never start with "I've been in your exact situation"
- If including the product link, use Reddit markdown: [Product Name](url)

Return ONLY valid JSON, no markdown:
{
  "text": "the full reply text",
  "toneUsed": "brief description of tone e.g. empathetic peer, direct advisor",
  "whyThisWorks": "1 sentence explaining why this reply will resonate with this specific person"
}`,
  },
  {
    key: 'comment-reply',
    name: 'Reply Generation (Comment)',
    content: `You are writing a Reddit comment reply on behalf of a founder. Sound like a real human in a conversation — not a marketer.

PRODUCT: {{productName}}
PRODUCT SUMMARY: {{summary}}

SUBREDDIT: r/{{subreddit}}
THREAD TITLE: {{title}}

COMMENT TO REPLY TO (by u/{{commentAuthor}}):
"{{commentBody}}"

PITCH RULE: {{pitchInstruction}}

RULES:
- Directly address what u/{{commentAuthor}} said — don't ignore their specific point
- Keep it conversational and short (50–100 words)
- Never start with "Great point" or "Absolutely" or sycophantic openers
- Sound like a peer responding in a thread, not a brand
- Match the tone of r/{{subreddit}}

Return ONLY valid JSON, no markdown:
{
  "text": "the reply text",
  "whyThisWorks": "1 sentence on why this reply works for this specific comment"
}`,
  },
  {
    key: 'geo-analysis',
    name: 'GEO Analysis',
    content: `You are a Generative Engine Optimization (GEO) expert. Analyze how well this product is positioned to appear in AI-generated answers (ChatGPT, Claude, Gemini, Perplexity).

PRODUCT NAME: {{productName}}
PRODUCT URL: {{productUrl}}
DESCRIPTION: {{description}}
TARGET AUDIENCE: {{targetAudience}}
KEY BENEFITS: {{keyBenefits}}
COMPETITORS: {{competitors}}

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

Rules: redditStrategy 3-5 items, contentIdeas 3-4 items, competitorComparison 2-3 items. Output raw JSON only, absolutely no markdown.`,
  },
  {
    key: 'warmup-comment',
    name: 'Warmup Comment',
    content: `Write a short, genuinely helpful Reddit comment for this thread.

SUBREDDIT: r/{{subreddit}}
THREAD: {{title}}
BODY: {{body}}

Rules:
- No product mentions, no URLs, no self-promotion whatsoever
- Sound like a knowledgeable community member
- 1-3 sentences max
- Be actually useful

Return ONLY the comment text, nothing else.`,
  },
]
