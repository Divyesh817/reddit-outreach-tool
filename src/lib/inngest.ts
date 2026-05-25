// src/lib/inngest.ts
import { Inngest } from 'inngest'
import { prisma } from '@/lib/prisma'
import { fetchNewThreads, checkDailyPostingLimit, checkSubredditCooldown,
         checkShadowban, checkCommentVisible, fetchSubredditRules,
         fetchAccountKarma, postReply } from '@/lib/reddit'
import { scoreOpportunity, generateReply, generateWarmupComment } from '@/lib/anthropic'
import { SAFETY } from '@/types'

export const inngest = new Inngest({ id: 'reddit-outreach-tool' })

// ─── Shared: scan one subreddit for one product ───────────────────────────────

async function scanSubredditForProduct(
  product: {
    id: string; url: string; name: string; description: string
    targetAudience: string; keyBenefits: string[]; competitors: string[]; summary: string
  },
  subreddit: { id: string; name: string }
) {
  let threads
  try {
    threads = await fetchNewThreads(subreddit.name, 25)
  } catch (err: any) {
    // Subreddit might be private or banned — skip silently
    console.error(`Scan skipped r/${subreddit.name}: ${err.message}`)
    return 0
  }

  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - SAFETY.MAX_THREAD_AGE_HOURS)

  const profile = {
    url: product.url, name: product.name, description: product.description,
    targetAudience: product.targetAudience, keyBenefits: product.keyBenefits,
    competitors: product.competitors, summary: product.summary,
  }

  let created = 0

  for (const thread of threads) {
    const threadDate = new Date(thread.created_utc * 1000)
    if (threadDate < cutoffTime) continue

    // Quality filter — skip deleted, removed, or heavily-downvoted content
    if (thread.author === '[deleted]' || thread.author === 'AutoModerator') continue
    if (thread.title === '[deleted]' || thread.title === '[removed]') continue
    if (thread.selftext === '[deleted]' || thread.selftext === '[removed]') continue
    if (thread.score < -3) continue

    // Skip if already seen
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

    // Pre-generate reply so user sees it immediately in inbox
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
    } catch { /* non-fatal — user can regenerate */ }

    created++
  }

  await prisma.subreddit.update({
    where: { id: subreddit.id },
    data: { lastScannedAt: new Date() },
  })

  return created
}

// ─── Job 1: Scan subreddits for new threads ───────────────────────────────────
// Uses public Reddit JSON API — no user OAuth, no account, zero ban risk.

export const scanSubreddits = inngest.createFunction(
  { id: 'scan-subreddits', concurrency: { limit: 5 } },
  { cron: '*/30 * * * *' },
  async ({ step }) => {
    const activeProducts = await step.run('fetch-products', async () => {
      return prisma.product.findMany({
        where: { isActive: true },
        include: {
          subreddits: { where: { isActive: true, isBlacklisted: false } },
        }
      })
    })

    let totalCreated = 0

    for (const product of activeProducts) {
      for (const subreddit of product.subreddits) {
        const created = await step.run(`scan-${product.id}-${subreddit.name}`, () =>
          scanSubredditForProduct(product, subreddit)
        )
        totalCreated += created
      }
    }

    return { totalCreated }
  }
)

// ─── Job 2: Post approved replies ─────────────────────────────────────────────

export const postApprovedReplies = inngest.createFunction(
  { id: 'post-approved-replies', concurrency: { limit: 3 } },
  { event: 'opportunity/approved' },
  async ({ event, step }) => {
    const { opportunityId, userId } = event.data

    const opportunity = await step.run('fetch-opportunity', async () => {
      return prisma.opportunity.findUnique({
        where: { id: opportunityId },
        include: {
          replies: { where: { isActive: true } },
          product: true,
          subreddit: true,
        }
      })
    })

    if (!opportunity || !opportunity.replies[0]) return

    const user = await step.run('fetch-user', async () => {
      return prisma.user.findUnique({ where: { id: userId } })
    })

    if (!user?.redditAccessToken || !user?.redditRefreshToken) return

    // Safety checks
    const { canPost } = await step.run('check-daily-limit', async () => {
      return checkDailyPostingLimit(userId)
    })
    if (!canPost) return { skipped: 'daily limit reached' }

    const isSafe = await step.run('check-subreddit-cooldown', async () => {
      return checkSubredditCooldown(userId, opportunity.subreddit.name, opportunity.product.url)
    })
    if (!isSafe) return { skipped: 'subreddit cooldown active' }

    // Random delay 5–45 minutes to mimic human behaviour
    const delayMs = (Math.floor(Math.random() * 40) + 5) * 60 * 1000
    await step.sleep('human-delay', delayMs)

    // Post the reply
    const result = await step.run('post-reply', async () => {
      return postReply(
        opportunity.redditPostId,
        opportunity.replies[0].text,
        user.redditAccessToken!,
        user.redditRefreshToken!
      )
    })

    await step.run('save-posted-reply', async () => {
      await prisma.postedReply.create({
        data: {
          opportunityId: opportunity.id,
          redditCommentId: result.commentId,
          redditCommentUrl: result.commentUrl,
          postedAt: new Date(),
          postedAsUsername: user.redditUsername!,
        }
      })

      await prisma.opportunity.update({
        where: { id: opportunity.id },
        data: { status: 'POSTED' }
      })
    })

    // Check visibility after 10 minutes
    await step.sleep('visibility-check-delay', 10 * 60 * 1000)
    await step.run('check-visibility', async () => {
      const isVisible = await checkCommentVisible(result.commentUrl)
      if (!isVisible) {
        await prisma.postedReply.update({
          where: { redditCommentId: result.commentId },
          data: { isVisible: false }
        })
        // Alert: update account health
        await prisma.accountHealth.upsert({
          where: { userId },
          update: { isShadowbanned: true, shadowbannedAt: new Date() },
          create: { userId, isShadowbanned: true, shadowbannedAt: new Date() }
        })
      }
    })
  }
)

// ─── Job 3: Daily warmup comments ─────────────────────────────────────────────

export const dailyWarmup = inngest.createFunction(
  { id: 'daily-warmup' },
  { cron: '0 9 * * *' }, // 9am daily
  async ({ step }) => {
    const warmupSessions = await step.run('fetch-sessions', async () => {
      return prisma.warmupSession.findMany({
        where: { status: 'IN_PROGRESS' },
        include: {
          user: {
            include: {
              products: {
                include: {
                  subreddits: { where: { isActive: true }, take: 5 }
                },
                take: 1
              }
            }
          }
        }
      })
    })

    for (const session of warmupSessions) {
      if (!session.user.redditAccessToken || !session.user.redditRefreshToken) continue

      await step.run(`warmup-${session.userId}`, async () => {
        const subreddits = session.user.products[0]?.subreddits || []
        const targetSub = subreddits[Math.floor(Math.random() * subreddits.length)]
        if (!targetSub) return

        const threads = await fetchNewThreads(targetSub.name, 10)

        const thread = threads[Math.floor(Math.random() * threads.length)]
        if (!thread) return

        const comment = await generateWarmupComment({
          title: thread.title,
          body: thread.selftext,
          subreddit: targetSub.name,
        })

        await postReply(
          thread.id,
          comment,
          session.user.redditAccessToken!,
          session.user.redditRefreshToken!
        )

        const newDaysCompleted = session.daysCompleted + 1
        const isComplete = newDaysCompleted >= session.targetDays

        await prisma.warmupSession.update({
          where: { id: session.id },
          data: {
            daysCompleted: newDaysCompleted,
            status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
            completedAt: isComplete ? new Date() : null,
          }
        })
      })
    }
  }
)

// ─── Job 4: Account health check ──────────────────────────────────────────────

export const healthCheck = inngest.createFunction(
  { id: 'health-check' },
  { cron: '0 */6 * * *' }, // every 6 hours
  async ({ step }) => {
    const users = await step.run('fetch-users', async () => {
      return prisma.user.findMany({
        where: { redditUsername: { not: null }, redditAccessToken: { not: null } }
      })
    })

    for (const user of users) {
      await step.run(`health-${user.id}`, async () => {
        const isShadowbanned = await checkShadowban(user.redditUsername!)
        const { karma, accountAgeDays } = await fetchAccountKarma(
          user.redditUsername!,
          user.redditAccessToken!,
          user.redditRefreshToken!
        )

        const healthScore = Math.min(100, Math.max(0,
          (isShadowbanned ? 0 : 50) +
          Math.min(25, accountAgeDays / 4) +
          Math.min(25, karma / 40)
        ))

        await prisma.accountHealth.upsert({
          where: { userId: user.id },
          update: { isShadowbanned, karma, accountAgeDays, healthScore, updatedAt: new Date() },
          create: { userId: user.id, isShadowbanned, karma, accountAgeDays, healthScore }
        })
      })
    }
  }
)

// ─── Job 5: Manual scan trigger ───────────────────────────────────────────────

export const manualScan = inngest.createFunction(
  { id: 'manual-scan', concurrency: { limit: 3 } },
  { event: 'scan/manual' },
  async ({ event, step }) => {
    const { userId } = event.data

    const products = await step.run('fetch-products', async () => {
      return prisma.product.findMany({
        where: { userId, isActive: true },
        include: { subreddits: { where: { isActive: true, isBlacklisted: false } } },
      })
    })

    let totalCreated = 0
    for (const product of products) {
      for (const subreddit of product.subreddits) {
        const created = await step.run(`scan-${product.id}-${subreddit.name}`, () =>
          scanSubredditForProduct(product, subreddit)
        )
        totalCreated += created
      }
    }

    return { totalCreated }
  }
)

export const functions = [scanSubreddits, manualScan, postApprovedReplies, dailyWarmup, healthCheck]
