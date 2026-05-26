// src/lib/inngest.ts
import { Inngest } from 'inngest'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { fetchNewThreads, checkDailyPostingLimit, checkSubredditCooldown,
         checkShadowban, checkCommentVisible, fetchSubredditRules,
         fetchAccountKarma, postReply } from '@/lib/reddit'
import { scoreOpportunity, generateReply, generateWarmupComment, runGeoAnalysis } from '@/lib/anthropic'
import { SAFETY } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

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

// ─── Job 6: Weekly GEO digest ─────────────────────────────────────────────────

export const weeklyGeoDigest = inngest.createFunction(
  { id: 'weekly-geo-digest', concurrency: { limit: 3 } },
  { cron: '0 8 * * 1' }, // every Monday at 8am UTC
  async ({ step }) => {
    const products = await step.run('fetch-products', async () => {
      return prisma.product.findMany({
        where: { isActive: true },
        include: { user: { select: { id: true, email: true, name: true } } },
      })
    })

    // Compute Monday of current week
    const now = new Date()
    const dayOfWeek = now.getUTCDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekOf = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysToMonday))

    let sent = 0

    for (const product of products) {
      await step.run(`geo-digest-${product.id}`, async () => {
        let analysis
        try {
          analysis = await runGeoAnalysis(product)
        } catch (e: any) {
          console.error(`GEO weekly: analysis failed for ${product.name}:`, e?.message)
          return
        }

        const report = await prisma.geoReport.create({
          data: {
            productId: product.id,
            userId: product.user.id,
            geoScore: analysis.geoScore,
            analysis: analysis as object,
            weekOf,
          },
        })

        // Fetch score history for trend line in email
        const history = await prisma.geoReport.findMany({
          where: { productId: product.id },
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: { geoScore: true, createdAt: true },
        })

        const prevScore = history[1]?.geoScore
        const delta = prevScore !== undefined ? analysis.geoScore - prevScore : null
        const deltaStr = delta === null ? '' : delta > 0 ? ` (+${delta} vs last week)` : delta < 0 ? ` (${delta} vs last week)` : ' (no change)'

        const scoreLabel = analysis.geoScore >= 75 ? 'STRONG' : analysis.geoScore >= 50 ? 'MODERATE' : 'WEAK'
        const scoreColor = analysis.geoScore >= 75 ? '#4ADE80' : analysis.geoScore >= 50 ? '#FBBF24' : '#F87171'

        const quickWinsHtml = analysis.quickWins?.map((w, i) =>
          `<tr><td style="padding:10px 14px;border-bottom:1px solid #1E1E28;vertical-align:top">
            <span style="font-family:monospace;font-size:11px;font-weight:700;color:#FF6B35;margin-right:10px">${i + 1}</span>
            <span style="font-size:14px;color:#C4C4D0">${w}</span>
          </td></tr>`
        ).join('') ?? ''

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Weekly GEO Report</title></head>
<body style="margin:0;padding:0;background:#0D0D10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#E2E2E8">
<div style="max-width:580px;margin:0 auto;padding:40px 24px">
  <div style="text-align:center;margin-bottom:32px">
    <div style="font-family:monospace;font-size:12px;color:#FF6B35;letter-spacing:.12em;font-weight:700;text-transform:uppercase;margin-bottom:16px">Redgrow · Weekly GEO Digest</div>
    <h1 style="font-size:22px;font-weight:700;color:#F4F4F8;margin:0 0 6px;letter-spacing:-.02em">${product.name}</h1>
    <p style="font-size:14px;color:#7C7C8A;margin:0">${new Date(weekOf).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
  </div>

  <div style="background:#16161A;border:1px solid #2A2A35;border-radius:14px;padding:24px;margin-bottom:24px;text-align:center">
    <div style="font-size:52px;font-weight:800;font-family:monospace;color:${scoreColor};line-height:1">${analysis.geoScore}</div>
    <div style="display:inline-block;margin-top:8px;padding:4px 12px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:.08em;background:${analysis.geoScore >= 75 ? '#0A2318' : analysis.geoScore >= 50 ? '#231900' : '#200A0A'};color:${scoreColor}">${scoreLabel}${deltaStr}</div>
    <p style="font-size:14px;color:#A8A8B8;line-height:1.6;margin:16px 0 0">${analysis.summary}</p>
  </div>

  ${quickWinsHtml ? `
  <div style="margin-bottom:24px">
    <div style="font-family:monospace;font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#55556A;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #1E1E28">This week's quick wins</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#16161A;border:1px solid #1E1E28;border-radius:10px;overflow:hidden">${quickWinsHtml}</table>
  </div>` : ''}

  <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #1E1E28">
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/geo" style="display:inline-block;padding:12px 24px;border-radius:9px;background:#FF6B35;color:#fff;font-size:14px;font-weight:700;text-decoration:none">View full report →</a>
    <p style="font-size:12px;color:#55556A;margin-top:16px">Redgrow GEO · Weekly digest every Monday</p>
  </div>
</div>
</body></html>`

        await resend.emails.send({
          from: 'Redgrow GEO <div@redgrow.app>',
          to: product.user.email,
          subject: `Weekly GEO: ${product.name} scored ${analysis.geoScore}${deltaStr}`,
          html,
        })

        sent++
      })
    }

    return { sent }
  }
)

export const functions = [scanSubreddits, manualScan, postApprovedReplies, dailyWarmup, healthCheck, weeklyGeoDigest]
