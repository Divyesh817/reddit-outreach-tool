// src/lib/inngest.ts
import { Inngest } from 'inngest'
import { prisma } from '@/lib/prisma'
import { fetchNewThreads, checkDailyPostingLimit, checkSubredditCooldown,
         checkShadowban, checkCommentVisible, fetchSubredditRules,
         fetchAccountKarma, postReply } from '@/lib/reddit'
import { scoreOpportunity, generateReply, generateWarmupComment } from '@/lib/anthropic'
import { SAFETY } from '@/types'

export const inngest = new Inngest({ id: 'reddit-outreach-tool' })

// ─── Job 1: Scan subreddits for new threads ───────────────────────────────────

export const scanSubreddits = inngest.createFunction(
  { id: 'scan-subreddits', concurrency: { limit: 5 } },
  { cron: '*/30 * * * *' }, // every 30 minutes
  async ({ step }) => {
    const activeProducts = await step.run('fetch-products', async () => {
      return prisma.product.findMany({
        where: { isActive: true },
        include: {
          subreddits: { where: { isActive: true, isBlacklisted: false, allowsPromotion: true } },
          user: { select: { redditAccessToken: true, redditRefreshToken: true } }
        }
      })
    })

    for (const product of activeProducts) {
      if (!product.user.redditAccessToken || !product.user.redditRefreshToken) continue

      for (const subreddit of product.subreddits) {
        await step.run(`scan-${product.id}-${subreddit.name}`, async () => {
          const threads = await fetchNewThreads(
            subreddit.name,
            product.user.redditAccessToken!,
            product.user.redditRefreshToken!
          )

          const cutoffTime = new Date()
          cutoffTime.setHours(cutoffTime.getHours() - SAFETY.MAX_THREAD_AGE_HOURS)

          for (const thread of threads) {
            const threadDate = new Date(thread.created_utc * 1000)
            if (threadDate < cutoffTime) continue

            // Skip if already seen
            const existing = await prisma.opportunity.findUnique({
              where: { redditPostId: thread.id }
            })
            if (existing) continue

            // Score the opportunity
            const scoring = await scoreOpportunity(
              { title: thread.title, body: thread.selftext, topComments: thread.comments },
              { url: product.url, name: product.name, description: product.description,
                targetAudience: product.targetAudience, keyBenefits: product.keyBenefits,
                competitors: product.competitors, summary: product.summary }
            )

            if (scoring.intentScore < 30) continue // skip low-intent threads

            // Create opportunity
            const opportunity = await prisma.opportunity.create({
              data: {
                productId: product.id,
                subredditId: subreddit.id,
                redditPostId: thread.id,
                redditPostUrl: thread.url,
                redditPostTitle: thread.title,
                redditPostBody: thread.selftext,
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

            // Pre-generate reply
            const replyResult = await generateReply(
              { title: thread.title, body: thread.selftext, subreddit: subreddit.name },
              { url: product.url, name: product.name, description: product.description,
                targetAudience: product.targetAudience, keyBenefits: product.keyBenefits,
                competitors: product.competitors, summary: product.summary },
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
          }

          await prisma.subreddit.update({
            where: { id: subreddit.id },
            data: { lastScannedAt: new Date() }
          })
        })
      }
    }
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

        const threads = await fetchNewThreads(
          targetSub.name,
          session.user.redditAccessToken!,
          session.user.redditRefreshToken!,
          10
        )

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

export const functions = [scanSubreddits, postApprovedReplies, dailyWarmup, healthCheck]
