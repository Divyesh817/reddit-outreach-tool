export const dynamic = 'force-dynamic'
export const maxDuration = 300

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { scoreOpportunity } from '@/lib/anthropic'
import type { ProductProfile } from '@/types'

const LOOKBACK_DAYS = 21
const SCORE_THRESHOLD = 40
const BATCH_SIZE = 100

async function concurrent<T>(items: T[], fn: (item: T) => Promise<any>, limit = 5) {
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

async function fetchFromPullpush(subreddit: string, after: number, before: number) {
  const url = `https://api.pullpush.io/reddit/search/submission/?subreddit=${encodeURIComponent(subreddit)}&sort=desc&size=${BATCH_SIZE}&after=${after}&before=${before}`
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) return []
  const data = await res.json()
  return (data?.data ?? []).filter((p: any) => p.title && p.id).map((p: any) => ({
    id: String(p.id),
    title: p.title,
    selftext: p.selftext ?? '',
    author: p.author ?? '[deleted]',
    score: p.score ?? 1,
    num_comments: p.num_comments ?? 0,
    created_utc: p.created_utc ?? Math.floor(Date.now() / 1000),
    permalink: p.permalink ?? `/r/${subreddit}/comments/${p.id}/`,
    comments: [],
  }))
}

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = Math.floor(Date.now() / 1000)
  const after = now - LOOKBACK_DAYS * 24 * 60 * 60

  const products = await prisma.product.findMany({
    where: { userId: user.id, isActive: true },
    include: {
      subreddits: { where: { isActive: true, isBlacklisted: false } },
    },
  })

  if (!products.length) return NextResponse.json({ error: 'No active products' }, { status: 400 })

  let totalCreated = 0
  let totalScored = 0

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
      const name = subreddit.name.replace(/^\/?r\//i, '')
      const threads = await fetchFromPullpush(name, after, now)
      if (!threads.length) continue

      // Deduplicate against existing
      const existingIds = new Set(
        (await prisma.opportunity.findMany({
          where: { redditPostId: { in: threads.map(t => t.id) }, product: { userId: user.id } },
          select: { redditPostId: true },
        })).map(o => o.redditPostId)
      )

      const toScore = threads.filter(t =>
        !existingIds.has(t.id) &&
        t.author !== '[deleted]' && t.author !== 'AutoModerator' &&
        t.title !== '[deleted]' && t.title !== '[removed]'
      )

      if (!toScore.length) continue
      totalScored += toScore.length

      const results = await concurrent(toScore, async (thread) => {
        const scoring = await scoreOpportunity(
          { title: thread.title, body: thread.selftext, topComments: [] },
          profile
        )
        return { thread, scoring }
      }, 5)

      for (const r of results) {
        if (r.status !== 'fulfilled') continue
        const { thread, scoring } = r.value
        if (scoring.intentScore < SCORE_THRESHOLD) continue
        try {
          await prisma.opportunity.create({
            data: {
              productId: product.id,
              subredditId: subreddit.id,
              redditPostId: thread.id,
              redditPostUrl: `https://reddit.com${thread.permalink}`,
              redditPostTitle: thread.title,
              redditPostBody: thread.selftext || null,
              topComments: [],
              redditAuthor: thread.author,
              redditScore: thread.score,
              redditCommentCount: thread.num_comments,
              redditPostedAt: new Date(thread.created_utc * 1000),
              intentScore: scoring.intentScore,
              painType: scoring.painType,
              shouldPitch: scoring.shouldPitch,
              scoringReasoning: scoring.reasoning,
              status: 'QUEUED',
            }
          })
          totalCreated++
        } catch { continue }
      }
    }
  }

  return NextResponse.json({ totalCreated, totalScored, lookbackDays: LOOKBACK_DAYS, threshold: SCORE_THRESHOLD })
}
