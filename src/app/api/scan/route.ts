export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { fetchNewThreads } from '@/lib/reddit'
import { scoreOpportunity, generateReply } from '@/lib/anthropic'
import { SAFETY } from '@/types'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const products = await prisma.product.findMany({
    where: { userId: user.id, isActive: true },
    include: { subreddits: { where: { isActive: true, isBlacklisted: false } } },
  })

  if (!products.length) {
    return NextResponse.json({ message: 'No active products to scan', totalCreated: 0 })
  }

  let totalCreated = 0

  for (const product of products) {
    const profile = {
      url: product.url,
      name: product.name,
      description: product.description,
      targetAudience: product.targetAudience,
      keyBenefits: product.keyBenefits as string[],
      competitors: product.competitors as string[],
      summary: product.summary,
    }

    for (const subreddit of product.subreddits) {
      let threads
      try {
        threads = await fetchNewThreads(subreddit.name, 25)
      } catch (err: any) {
        console.error(`Scan skipped r/${subreddit.name}: ${err.message}`)
        continue
      }

      const cutoffTime = new Date()
      cutoffTime.setHours(cutoffTime.getHours() - SAFETY.MAX_THREAD_AGE_HOURS)

      for (const thread of threads) {
        const threadDate = new Date(thread.created_utc * 1000)
        if (threadDate < cutoffTime) continue

        if (thread.author === '[deleted]' || thread.author === 'AutoModerator') continue
        if (thread.title === '[deleted]' || thread.title === '[removed]') continue
        if (thread.selftext === '[deleted]' || thread.selftext === '[removed]') continue
        if (thread.score < -3) continue

        const existing = await prisma.opportunity.findUnique({ where: { redditPostId: thread.id } })
        if (existing) continue

        let scoring
        try {
          scoring = await scoreOpportunity(
            { title: thread.title, body: thread.selftext, topComments: thread.comments },
            profile
          )
        } catch { continue }

        if (scoring.intentScore < 30) continue

        const opportunity = await prisma.opportunity.create({
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

        try {
          const replyResult = await generateReply(
            { title: thread.title, body: thread.selftext, subreddit: subreddit.name },
            profile,
            scoring.painType,
            scoring.shouldPitch
          )
          await prisma.reply.create({
            data: {
              opportunityId: opportunity.id,
              text: replyResult.text,
              toneUsed: replyResult.toneUsed,
              whyThisWorks: replyResult.whyThisWorks,
              version: 1,
              isActive: true,
            }
          })
        } catch { /* non-fatal */ }

        totalCreated++
      }

      await prisma.subreddit.update({
        where: { id: subreddit.id },
        data: { lastScannedAt: new Date() },
      })
    }
  }

  return NextResponse.json({ message: 'Scan complete', totalCreated })
}
