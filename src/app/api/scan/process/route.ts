export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { batchScoreOpportunities } from '@/lib/anthropic'
import { PLAN_LIMITS } from '@/types'
import type { ProductProfile, Plan } from '@/types'

const HIGH_INTENT_PATTERNS = [
  'looking for', 'recommend', 'alternative to', 'switch', 'switching from',
  'frustrated', 'sick of', 'tired of', 'help me find', 'need a tool',
  'suggestions', 'comparison', 'similar to', 'instead of', 'leaving',
  'anyone using', 'does anyone', 'best tool', 'best app', 'best way',
  'anyone tried', 'what do you use', 'which tool', 'how do you',
  'replace', 'better than', 'vs ', ' vs', 'advice', 'worth it',
  'workflow', 'automate', 'struggling', 'issue with', 'problem with',
  "can't stand", 'hate', 'disappointed', 'not working', 'alternatives',
]

// Adaptive thresholds — matches the inngest.ts cron logic exactly
const MIN_INTENT_SCORE = 65
const MIN_INTENT_SCORE_WITH_SIGNAL = 55

interface RawThread {
  id: string
  title: string
  selftext: string
  author: string
  score: number
  num_comments: number
  created_utc: number
  permalink: string
  comments?: string[]
}

function passesIntentPreFilter(thread: RawThread, profile: ProductProfile): boolean {
  const text = `${thread.title} ${thread.selftext}`.toLowerCase()
  if (profile.competitors.some(c => c && text.includes(c.toLowerCase()))) return true
  const productKeywords = (profile.keywords ?? []).map(k => k.toLowerCase())
  const allPatterns = [...HIGH_INTENT_PATTERNS, ...productKeywords]
  return allPatterns.some(p => text.includes(p))
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const subredditsData: { subredditId: string; productId: string; threads: RawThread[] }[] = body.subredditsData ?? []

  if (!subredditsData.length) {
    return NextResponse.json({ totalCreated: 0, totalScanned: 0 })
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { plan: true } })
  const plan = (dbUser?.plan ?? 'FREE') as Plan
  const limits = PLAN_LIMITS[plan]

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const oppsThisMonth = await prisma.opportunity.count({
    where: { product: { userId: user.id }, createdAt: { gte: monthStart } },
  })
  if (oppsThisMonth >= limits.opportunitiesPerMonth) {
    return NextResponse.json({ error: 'Monthly limit reached', limitReached: true }, { status: 429 })
  }

  const remainingOpps = limits.opportunitiesPerMonth - oppsThisMonth
  const perScanCap = Math.min(remainingOpps, 6)

  const lookbackHours = Math.max(limits.lookbackHours, 48)
  const cutoffTime = new Date(Date.now() - lookbackHours * 60 * 60 * 1000)

  let totalCreated = 0
  let totalScanned = 0
  let intentScoreSum = 0

  for (const { subredditId, productId, threads: rawThreads } of subredditsData) {
    if (totalCreated >= perScanCap) break

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { url: true, name: true, description: true, targetAudience: true, keyBenefits: true, competitors: true, summary: true, keywords: true },
    })
    if (!product) continue

    const profile: ProductProfile = {
      url: product.url,
      name: product.name,
      description: product.description,
      targetAudience: product.targetAudience,
      keyBenefits: product.keyBenefits as string[],
      competitors: product.competitors as string[],
      summary: product.summary,
      keywords: product.keywords as string[],
    }

    const fresh = rawThreads.filter(t => {
      const d = new Date(t.created_utc * 1000)
      if (d < cutoffTime) return false
      if (t.author === '[deleted]' || t.author === 'AutoModerator') return false
      if (t.title === '[deleted]' || t.title === '[removed]') return false
      if (t.score < -3) return false
      return true
    })

    const candidates = fresh.filter(t => passesIntentPreFilter(t, profile))
    totalScanned += candidates.length

    const existingIds = new Set(
      (await prisma.opportunity.findMany({
        where: { redditPostId: { in: candidates.map(t => t.id) }, product: { userId: user.id } },
        select: { redditPostId: true },
      })).map(o => o.redditPostId)
    )

    const toScore = candidates.filter(t => !existingIds.has(t.id)).slice(0, 15)
    if (!toScore.length) {
      await prisma.subreddit.update({ where: { id: subredditId }, data: { lastScannedAt: new Date() } })
      continue
    }

    const scores = await batchScoreOpportunities(
      toScore.map(t => ({ id: t.id, title: t.title, body: t.selftext, comments: t.comments })),
      profile
    )

    for (let i = 0; i < toScore.length; i++) {
      const thread = toScore[i]
      const scoring = scores[i]
      if (!scoring) continue

      const threadText = `${thread.title} ${thread.selftext}`.toLowerCase()
      const hasDirectSignal =
        (scoring.matchedKeywords?.length ?? 0) > 0 ||
        profile.competitors.some(c => c && threadText.includes(c.toLowerCase()))

      const effectiveMin = hasDirectSignal ? MIN_INTENT_SCORE_WITH_SIGNAL : MIN_INTENT_SCORE
      const isKarmaLead = scoring.intentScore >= 50 && !scoring.shouldPitch

      if (scoring.intentScore < effectiveMin && !isKarmaLead) continue

      try {
        await prisma.opportunity.create({
          data: {
            productId,
            subredditId,
            redditPostId: thread.id,
            redditPostUrl: `https://reddit.com${thread.permalink}`,
            redditPostTitle: thread.title,
            redditPostBody: thread.selftext || null,
            topComments: thread.comments ?? [],
            redditAuthor: thread.author,
            redditScore: thread.score,
            redditCommentCount: thread.num_comments,
            redditPostedAt: new Date(thread.created_utc * 1000),
            intentScore: scoring.intentScore,
            painType: scoring.painType,
            shouldPitch: scoring.shouldPitch,
            scoringReasoning: scoring.reasoning,
            matchedKeywords: scoring.matchedKeywords ?? [],
            status: isKarmaLead ? 'NO_PITCH' : 'QUEUED',
          }
        })
        intentScoreSum += scoring.intentScore
        totalCreated++
      } catch { continue }
      if (totalCreated >= perScanCap) break
    }

    await prisma.subreddit.update({ where: { id: subredditId }, data: { lastScannedAt: new Date() } })
  }

  const avgIntentScore = totalCreated > 0 ? Math.round(intentScoreSum / totalCreated) : 0

  return NextResponse.json({ totalCreated, totalScanned, plan, avgIntentScore, subredditsScanned: subredditsData.length })
}
