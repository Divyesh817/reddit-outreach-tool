export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { fetchNewThreads, fetchHotThreads, fetchTopThreads, fetchRecentCommentThreads } from '@/lib/reddit'
import { scoreOpportunity, generateReply } from '@/lib/anthropic'
import { PLAN_LIMITS } from '@/types'
import type { ProductProfile, Plan } from '@/types'
import type { RedditThread } from '@/lib/reddit'

const HIGH_INTENT_PATTERNS = [
  'looking for', 'recommend', 'alternative to', 'switch', 'switching from',
  'frustrated', 'sick of', 'tired of', 'help me find', 'need a tool',
  'suggestions', 'comparison', 'similar to', 'instead of', 'leaving',
  'anyone using', 'does anyone', 'best tool', 'best app', 'best way',
  'anyone tried', 'what do you use', 'which tool', 'how do you',
  'replace', 'better than', 'vs ', ' vs', 'advice', 'worth it',
  'workflow', 'automate', 'struggling', 'issue with', 'problem with',
  'can\'t stand', 'hate', 'disappointed', 'not working', 'alternatives',
]

function passesIntentPreFilter(thread: RedditThread, product: ProductProfile): boolean {
  const text = `${thread.title} ${thread.selftext}`.toLowerCase()
  if (product.competitors.some(c => c && text.includes(c.toLowerCase()))) return true
  return HIGH_INTENT_PATTERNS.some(p => text.includes(p))
}

// Runs at most `limit` promises simultaneously — faster than serial batches
async function concurrent<T>(
  items: T[],
  fn: (item: T) => Promise<any>,
  limit = 5
): Promise<PromiseSettledResult<any>[]> {
  const results: PromiseSettledResult<any>[] = new Array(items.length)
  let idx = 0
  async function worker() {
    while (idx < items.length) {
      const i = idx++
      try { results[i] = { status: 'fulfilled', value: await fn(items[i]) } }
      catch (e) { results[i] = { status: 'rejected', reason: e } }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { plan: true } })
  const plan = (dbUser?.plan ?? 'FREE') as Plan
  const limits = PLAN_LIMITS[plan]

  // Enforce daily scan cap
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const scansToday = await prisma.opportunity.count({
    where: {
      product: { userId: user.id },
      createdAt: { gte: todayStart },
    },
  })
  // Use a rough heuristic: if we created >= scansPerDay × 5 opps today, we've scanned enough
  // Real scan-count tracking would need a separate table; this is a pragmatic proxy
  if (limits.scansPerDay !== 9999 && scansToday >= limits.scansPerDay * 5) {
    return NextResponse.json({
      error: `Daily scan limit reached for ${plan} plan (${limits.scansPerDay} scans/day)`,
      limitReached: true,
    }, { status: 429 })
  }

  // Enforce monthly opportunity cap
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const oppsThisMonth = await prisma.opportunity.count({
    where: { product: { userId: user.id }, createdAt: { gte: monthStart } },
  })
  if (oppsThisMonth >= limits.opportunitiesPerMonth) {
    return NextResponse.json({
      error: `Monthly opportunity limit reached (${limits.opportunitiesPerMonth} for ${plan} plan)`,
      limitReached: true,
    }, { status: 429 })
  }

  const remainingOpps = limits.opportunitiesPerMonth - oppsThisMonth

  const products = await prisma.product.findMany({
    where: { userId: user.id, isActive: true },
    include: {
      subreddits: {
        where: { isActive: true, isBlacklisted: false },
        take: limits.subredditsPerProduct,
      },
    },
  })

  if (!products.length) {
    return NextResponse.json({ message: 'No active products to scan', totalCreated: 0 })
  }

  let totalCreated = 0
  let totalScanned = 0
  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - limits.lookbackHours)

  // Per-scan cap: don't exceed remaining monthly budget in one go
  const perScanCap = Math.min(remainingOpps, limits.threadsPerSubreddit)

  for (const product of products) {
    const profile: ProductProfile = {
      url: product.url,
      name: product.name,
      description: product.description,
      targetAudience: product.targetAudience,
      keyBenefits: product.keyBenefits as string[],
      competitors: product.competitors as string[],
      summary: product.summary,
    }

    for (const subreddit of product.subreddits) {
      // Fetch listings in parallel — skip per-post comment fetches (saves 50+ extra requests)
      // Comments are only needed for AI scoring; title+body is sufficient for pre-filtering
      const fetchLimit = Math.min(15, Math.ceil(limits.threadsPerSubreddit / 2))
      const [newRes, hotRes, topRes] = await Promise.allSettled([
        fetchNewThreads(subreddit.name, fetchLimit, true),
        fetchHotThreads(subreddit.name, fetchLimit, true),
        fetchTopThreads(subreddit.name, fetchLimit, limits.lookbackHours >= 168 ? 'week' : 'day', true),
      ])

      let threads: RedditThread[] = []
      if (newRes.status === 'fulfilled') threads.push(...newRes.value)
      if (hotRes.status === 'fulfilled') threads.push(...hotRes.value)
      if (topRes.status === 'fulfilled') threads.push(...topRes.value)

      // De-duplicate by post id
      const seen = new Set<string>()
      threads = threads.filter(t => {
        if (seen.has(t.id)) return false
        seen.add(t.id)
        return true
      })

      // Filter by lookback window and quality
      const fresh = threads.filter(thread => {
        const threadDate = new Date(thread.created_utc * 1000)
        if (threadDate < cutoffTime) return false
        if (thread.author === '[deleted]' || thread.author === 'AutoModerator') return false
        if (thread.title === '[deleted]' || thread.title === '[removed]') return false
        if (thread.score < -3) return false
        return true
      })

      // Pre-filter with keyword signals
      const candidates = fresh.filter(t => passesIntentPreFilter(t, profile))
      totalScanned += candidates.length

      // Skip threads already in DB
      const existingIds = new Set(
        (await prisma.opportunity.findMany({
          where: { redditPostId: { in: candidates.map(t => t.id) } },
          select: { redditPostId: true },
        })).map(o => o.redditPostId)
      )

      // Hard cap at 8 new threads per scan to keep latency bounded
      const toScore = candidates
        .filter(t => !existingIds.has(t.id))
        .slice(0, Math.min(8, perScanCap))

      // Score all candidates in parallel (5 concurrent) — much faster than serial batches
      const scoringResults = await concurrent(
        toScore,
        async (thread) => {
          const scoring = await scoreOpportunity(
            { title: thread.title, body: thread.selftext, topComments: thread.comments },
            profile
          )
          return { thread, scoring }
        },
        5
      )

      // Persist passing opportunities
      const passingOpps: { thread: RedditThread; scoring: any; opportunityId: string }[] = []
      for (const result of scoringResults) {
        if (result.status !== 'fulfilled') continue
        const { thread, scoring } = result.value
        if (scoring.intentScore < 25) continue
        const threadDate = new Date(thread.created_utc * 1000)
        try {
          const opp = await prisma.opportunity.create({
            data: {
              productId: product.id,
              subredditId: subreddit.id,
              redditPostId: thread.id,
              redditPostUrl: thread.url,
              redditPostTitle: thread.title,
              redditPostBody: thread.selftext || null,
              redditAuthor: thread.author,
              redditScore: thread.score,
              redditCommentCount: thread.num_comments,
              redditPostedAt: threadDate,
              intentScore: scoring.intentScore,
              painType: scoring.painType,
              shouldPitch: scoring.shouldPitch,
              scoringReasoning: scoring.reasoning,
              status: 'QUEUED',
            }
          })
          if (scoring.intentScore >= 45) {
            passingOpps.push({ thread, scoring, opportunityId: opp.id })
          }
          totalCreated++
        } catch { continue }
        if (totalCreated >= perScanCap) break
      }

      // Generate replies in parallel for high-intent threads
      await concurrent(
        passingOpps,
        async ({ thread, scoring, opportunityId }) => {
          const replyResult = await generateReply(
            { title: thread.title, body: thread.selftext, subreddit: subreddit.name },
            profile,
            scoring.painType,
            scoring.shouldPitch
          )
          await prisma.reply.create({
            data: {
              opportunityId,
              text: replyResult.text,
              toneUsed: replyResult.toneUsed,
              whyThisWorks: replyResult.whyThisWorks,
              version: 1,
              isActive: true,
            }
          })
        },
        3
      )

      await prisma.subreddit.update({
        where: { id: subreddit.id },
        data: { lastScannedAt: new Date() },
      })

      if (totalCreated >= perScanCap) break
    }

    if (totalCreated >= perScanCap) break
  }

  return NextResponse.json({
    message: 'Scan complete',
    totalCreated,
    totalScanned,
    plan,
    limits: {
      opportunitiesPerMonth: limits.opportunitiesPerMonth,
      usedThisMonth: oppsThisMonth + totalCreated,
    },
  })
}
