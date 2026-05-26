// src/types/index.ts

// ─── Enums (mirror Prisma) ────────────────────────────────────────────────────

export type Plan = 'FREE' | 'STARTER' | 'GROWTH'

export type PainType =
  | 'competitor_frustration'
  | 'switching_intent'
  | 'active_tool_search'
  | 'roi_frustration'
  | 'workflow_pain'

export type OpportunityStatus =
  | 'QUEUED'
  | 'APPROVED'
  | 'POSTED'
  | 'SKIPPED'
  | 'NO_PITCH'
  | 'FAILED'
  | 'EXPIRED'

export type WarmupStatus = 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED'

// ─── Pain Type Metadata ───────────────────────────────────────────────────────

export const PAIN_TYPE_LABELS: Record<PainType, string> = {
  competitor_frustration: 'Competitor frustration',
  switching_intent: '🔥 Ready to switch',
  active_tool_search: 'Looking for a tool',
  roi_frustration: 'ROI frustration',
  workflow_pain: 'Workflow pain',
}

export const PAIN_TYPE_DESCRIPTIONS: Record<PainType, string> = {
  competitor_frustration: 'Mentions a competitor negatively — high conversion potential',
  switching_intent: 'Actively looking to switch tools — your highest priority lead',
  active_tool_search: 'Asking for recommendations — comparison-stage buyer',
  roi_frustration: 'Using something but getting no results — emotionally ready',
  workflow_pain: 'Struggling with the core problem your product solves',
}

// ─── Plan Limits ──────────────────────────────────────────────────────────────

export const PLAN_LIMITS: Record<Plan, {
  products: number
  opportunitiesPerMonth: number
  repliesPerMonth: number
  price: number
  // Scan config
  scansPerDay: number
  threadsPerSubreddit: number
  lookbackHours: number
  subredditsPerProduct: number
}> = {
  FREE: {
    products: 1,
    opportunitiesPerMonth: 100,
    repliesPerMonth: 20,
    price: 0,
    scansPerDay: 2,
    threadsPerSubreddit: 25,
    lookbackHours: 48,
    subredditsPerProduct: 5,
  },
  STARTER: {
    products: 3,
    opportunitiesPerMonth: 500,
    repliesPerMonth: 150,
    price: 9,
    scansPerDay: 10,
    threadsPerSubreddit: 50,
    lookbackHours: 72,
    subredditsPerProduct: 15,
  },
  GROWTH: {
    products: 5,
    opportunitiesPerMonth: 2000,
    repliesPerMonth: 500,
    price: 19,
    scansPerDay: 9999,
    threadsPerSubreddit: 100,
    lookbackHours: 168,
    subredditsPerProduct: 30,
  },
}

// ─── Safety Constants ─────────────────────────────────────────────────────────

export const SAFETY = {
  MAX_PROMO_REPLIES_PER_DAY: 5,
  MIN_DAYS_BETWEEN_SAME_SUBREDDIT_URL: 7,
  PROMO_TO_NORMAL_RATIO: 3,        // 1 promo per 3 normal comments
  WARMUP_DAYS: 7,
  WARMUP_COMMENTS_PER_DAY: 3,
  MAX_THREAD_AGE_HOURS: 48,        // don't reply to threads older than this
  AUTO_BLACKLIST_REMOVAL_RATE: 0.3, // blacklist subreddit if removal rate > 30%
} as const

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductProfile {
  url: string
  name: string
  description: string
  targetAudience: string
  keyBenefits: string[]
  competitors: string[]
  summary: string
}

// ─── Opportunity ──────────────────────────────────────────────────────────────

export interface OpportunityWithDetails {
  id: string
  redditPostId: string
  redditPostUrl: string
  redditPostTitle: string
  redditPostBody: string | null
  redditAuthor: string
  redditScore: number
  redditPostedAt: Date
  intentScore: number
  painType: PainType
  shouldPitch: boolean
  scoringReasoning: string | null
  status: OpportunityStatus
  subreddit: { name: string }
  replies: Array<{
    id: string
    text: string
    toneUsed: string | null
    whyThisWorks: string | null
    version: number
    isActive: boolean
  }>
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface ScoringResult {
  intentScore: number
  painType: PainType
  shouldPitch: boolean
  reasoning: string
}

// ─── Reply Generation ─────────────────────────────────────────────────────────

export interface ReplyResult {
  text: string
  toneUsed: string
  whyThisWorks: string
}

// ─── Account Health ───────────────────────────────────────────────────────────

export interface HealthCheckResult {
  isShadowbanned: boolean
  karma: number
  accountAgeDays: number
  healthScore: number
  healthReason: string
}
