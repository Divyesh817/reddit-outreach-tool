// src/lib/inngest.ts
import { Inngest } from 'inngest'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { fetchNewThreads, checkDailyPostingLimit, checkSubredditCooldown,
         checkCommentVisible, postReply } from '@/lib/reddit'
import { batchScoreOpportunities, generateReply, generateWarmupComment, runGeoAnalysis } from '@/lib/anthropic'
import { sendWelcomeEmail, sendHighIntentAlert, sendDailyDigest, sendWeeklySummary, sendCompetitorDigest } from '@/lib/emails'
import type { ProductProfile } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export const inngest = new Inngest({ id: 'reddit-outreach-tool' })

const RSS_UA = 'Feedly/1.0 (+https://feedly.com/fetcher.html; like FeedFetcher-Google)'

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

const SWITCHING_PATTERNS = [
  'leaving', 'cancelling', 'canceled', 'cancelled', 'switching from',
  'alternative to', 'replace', 'instead of', 'moved from', 'dropped',
  'ditching', 'migrating from', 'looking for alternative',
]

function detectCompetitorMentioned(text: string, competitors: string[]): string | null {
  const lower = text.toLowerCase()
  return competitors.find(c => c && lower.includes(c.toLowerCase())) ?? null
}

function hasSwitchingIntent(text: string): boolean {
  const lower = text.toLowerCase()
  return SWITCHING_PATTERNS.some(p => lower.includes(p))
}

function decodeXml(s: string) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
}

async function fetchRss(subreddit: string, sort: string, limit: number) {
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/${sort}.rss?limit=${limit}`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': RSS_UA, 'Accept': 'application/atom+xml, application/xml' },
      next: { revalidate: 0 },
    })
    if (!res.ok) return []
    const xml = await res.text()
    const threads: any[] = []
    const re = /<entry>([\s\S]*?)<\/entry>/g
    let m: RegExpExecArray | null
    while ((m = re.exec(xml)) !== null) {
      const e = m[1]
      const rawId = e.match(/<id>([^<]+)<\/id>/)?.[1] ?? ''
      const id = rawId.replace(/^.*t3_/, '')
      if (!id) continue
      const title = decodeXml(e.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? '')
      if (!title) continue
      const href = e.match(/href="(https:\/\/www\.reddit\.com\/r\/[^"]+\/comments\/[^"]+)"/)?.[1] ?? ''
      const author = e.match(/<name>\/u\/([^<\n]+)<\/name>/)?.[1]?.trim() ?? '[deleted]'
      const updated = e.match(/<updated>([^<]+)<\/updated>/)?.[1] ?? ''
      const content = e.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] ?? ''
      const selftext = decodeXml(content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        .replace(/\s*submitted by\s.*$/i, '').trim()
      threads.push({
        id, title, selftext, author, score: 1, num_comments: 0,
        created_utc: updated ? Math.floor(new Date(updated).getTime() / 1000) : Math.floor(Date.now() / 1000),
        permalink: href ? href.replace('https://www.reddit.com', '') : `/r/${subreddit}/comments/${id}/`,
        comments: [],
      })
    }
    return threads
  } catch { return [] }
}

async function fetchCommentsRss(threadId: string): Promise<string[]> {
  try {
    const res = await fetch(`https://www.reddit.com/comments/${threadId}.rss?limit=8`, {
      headers: { 'User-Agent': RSS_UA }, next: { revalidate: 0 },
    })
    if (!res.ok) return []
    const xml = await res.text()
    const entries: string[] = []
    const re = /<entry>([\s\S]*?)<\/entry>/g
    let em: RegExpExecArray | null
    let skip = true
    while ((em = re.exec(xml)) !== null) {
      if (skip) { skip = false; continue }
      const content = em[1].match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] ?? ''
      const text = decodeXml(content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)
      if (text.length > 10) entries.push(text)
      if (entries.length >= 5) break
    }
    return entries
  } catch { return [] }
}

// ─── Shared: scan one subreddit for one product ───────────────────────────────

async function scanSubredditForProduct(
  product: {
    id: string; userId: string; url: string; name: string; description: string
    targetAudience: string; keyBenefits: string[]; competitors: string[]; summary: string; keywords: string[]
  },
  subreddit: { id: string; name: string }
) {
  const name = subreddit.name.replace(/^\/?r\//i, '')
  const [newThreads, hotThreads] = await Promise.all([
    fetchRss(name, 'new', 25),
    fetchRss(name, 'hot', 25),
  ])
  const seen = new Set<string>()
  const allThreads = [...newThreads, ...hotThreads].filter(t => {
    if (!t?.id || seen.has(t.id)) return false
    seen.add(t.id)
    return true
  })

  if (!allThreads.length) return 0

  const profile: ProductProfile = {
    url: product.url, name: product.name, description: product.description,
    targetAudience: product.targetAudience, keyBenefits: product.keyBenefits,
    competitors: product.competitors, summary: product.summary, keywords: product.keywords,
  }

  // Keyword/competitor match → lower bar (55), otherwise hold to 65
  const MIN_INTENT_SCORE = 65
  const MIN_INTENT_SCORE_WITH_SIGNAL = 55
  const MAX_LEADS_PER_SCAN = 6
  const LOOKBACK_HOURS = 48
  let created = 0

  // Merge global patterns with product-specific keywords from onboarding
  const productKeywords = (product.keywords ?? []).map(k => k.toLowerCase())
  const allPatterns = [...HIGH_INTENT_PATTERNS, ...productKeywords]

  const cutoff = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000)

  const fresh = allThreads.filter(t => {
    if (new Date(t.created_utc * 1000) < cutoff) return false
    if (t.author === '[deleted]' || t.author === 'AutoModerator') return false
    if (t.title === '[deleted]' || t.title === '[removed]') return false
    if (t.score < -3) return false
    return true
  })

  const candidates = fresh.filter(t => {
    const text = `${t.title} ${t.selftext}`.toLowerCase()
    if (profile.competitors.some((c: string) => c && text.includes(c.toLowerCase()))) return true
    return allPatterns.some(p => text.includes(p))
  })

  const existingIds = new Set(
    (await prisma.opportunity.findMany({
      where: { redditPostId: { in: candidates.map(t => t.id) }, product: { userId: product.userId } },
      select: { redditPostId: true },
    })).map(o => o.redditPostId)
  )

  const toScore = candidates.filter(t => !existingIds.has(t.id)).slice(0, 7)
  if (!toScore.length) return 0

  // Fetch comments before scoring so Claude has full context
  const threadsWithComments = await Promise.all(
    toScore.map(async t => ({
      id: t.id,
      title: t.title,
      body: t.selftext,
      comments: await fetchCommentsRss(t.id),
      _raw: t,
    }))
  )

  const scores = await batchScoreOpportunities(
    threadsWithComments.map(t => ({ id: t.id, title: t.title, body: t.body, comments: t.comments })),
    profile
  )

  for (let i = 0; i < threadsWithComments.length; i++) {
    const { _raw: thread, comments: topComments } = threadsWithComments[i]
    const scoring = scores[i]
    if (!scoring) continue

    const threadText = `${threadsWithComments[i].title} ${threadsWithComments[i].body}`
    const competitorMentioned = detectCompetitorMentioned(threadText, profile.competitors)
    const isCompetitorThread = competitorMentioned !== null
    const isSwitching = isCompetitorThread && hasSwitchingIntent(threadText)

    // Lower the bar if the thread directly matched a product keyword or competitor
    const hasDirectSignal = (scoring.matchedKeywords?.length ?? 0) > 0 || isCompetitorThread
    const effectiveMin = isCompetitorThread ? 40 : hasDirectSignal ? MIN_INTENT_SCORE_WITH_SIGNAL : MIN_INTENT_SCORE

    // Karma-worthy: relevant topic but not pitch-worthy — save as NO_PITCH for engagement ratio
    const isKarmaLead = scoring.intentScore >= 50 && !scoring.shouldPitch && !isCompetitorThread
    // Skip anything below effective threshold
    if (scoring.intentScore < effectiveMin && !isKarmaLead) continue

    try {
      const opportunity = await prisma.opportunity.create({
        data: {
          productId: product.id,
          subredditId: subreddit.id,
          redditPostId: thread.id,
          redditPostUrl: `https://reddit.com${thread.permalink}`,
          redditPostTitle: thread.title,
          redditPostBody: thread.selftext || null,
          topComments,
          redditAuthor: thread.author,
          redditScore: thread.score,
          redditCommentCount: thread.num_comments,
          redditPostedAt: new Date(thread.created_utc * 1000),
          intentScore: scoring.intentScore,
          painType: isSwitching ? 'switching_intent' : scoring.painType,
          shouldPitch: scoring.shouldPitch,
          scoringReasoning: scoring.reasoning,
          matchedKeywords: scoring.matchedKeywords ?? [],
          competitorMentioned,
          status: isKarmaLead ? 'NO_PITCH' : 'QUEUED',
        }
      })

      // Alert for high-intent leads (score >= 80) OR switching-intent competitor threads
      if (scoring.intentScore >= 80 || isSwitching) {
        try {
          const owner = await prisma.user.findUnique({
            where: { id: product.userId },
            select: { email: true, notificationPrefs: true, plan: true },
          })
          const prefs = (owner?.notificationPrefs as any) ?? {}
          const isPaid = owner?.plan && owner.plan !== 'FREE'
          if (owner?.email && prefs.highIntent !== false && (scoring.intentScore >= 80 || (isSwitching && isPaid))) {
            await sendHighIntentAlert(owner.email, {
              productName: product.name,
              postTitle: thread.title,
              subreddit: name,
              intentScore: scoring.intentScore,
              postUrl: `https://reddit.com${thread.permalink}`,
              opportunityId: opportunity.id,
            })
          }
        } catch { /* non-fatal */ }
      }

      created++
    } catch { continue }

    if (created >= MAX_LEADS_PER_SCAN) break
  }

  await prisma.subreddit.update({
    where: { id: subreddit.id },
    data: { lastScannedAt: new Date() },
  })

  return created
}

// ─── Job 1: Scan subreddits for new threads — every 3 hours ──────────────────

export const scanSubreddits = inngest.createFunction(
  { id: 'scan-subreddits', concurrency: { limit: 5 } },
  { cron: '0 */3 * * *' },
  async ({ step }) => {
    const activeProducts = await step.run('fetch-products', async () => {
      return prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true, userId: true, url: true, name: true, description: true,
          targetAudience: true, keyBenefits: true, competitors: true, summary: true, keywords: true,
          subreddits: { where: { isActive: true, isBlacklisted: false }, select: { id: true, name: true } },
        },
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

// ─── Job 5: Manual scan trigger ───────────────────────────────────────────────

export const manualScan = inngest.createFunction(
  { id: 'manual-scan', concurrency: { limit: 3 } },
  { event: 'scan/manual' },
  async ({ event, step }) => {
    const { userId } = event.data

    const products = await step.run('fetch-products', async () => {
      return prisma.product.findMany({
        where: { userId, isActive: true },
        select: {
          id: true, userId: true, url: true, name: true, description: true,
          targetAudience: true, keyBenefits: true, competitors: true, summary: true, keywords: true,
          subreddits: { where: { isActive: true, isBlacklisted: false }, select: { id: true, name: true } },
        },
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

// ─── Job 7: Welcome email (2 min after signup) ────────────────────────────────

export const welcomeEmail = inngest.createFunction(
  { id: 'welcome-email' },
  { event: 'user/created' },
  async ({ event, step }) => {
    // Wait 2 minutes before sending so it feels like a personal follow-up
    await step.sleep('delay', 2 * 60 * 1000)

    const { userId } = event.data
    const user = await step.run('fetch-user', () =>
      prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } })
    )
    if (!user?.email) return

    await step.run('send-welcome', () =>
      sendWelcomeEmail(user.email!, user.name)
    )
  }
)

// ─── Job 8: Leads digest — 8am UTC every 2 days, only if new leads exist ──────

export const dailyDigest = inngest.createFunction(
  { id: 'daily-digest' },
  { cron: '0 8 */2 * *' },
  async ({ step }) => {
    const users = await step.run('fetch-users', () =>
      prisma.user.findMany({
        where: { email: { not: '' } },
        select: { id: true, email: true, name: true, notificationPrefs: true },
      })
    )

    // Look back 48 hours to match the 2-day cadence
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000)

    let sent = 0
    for (const user of users) {
      const prefs = (user.notificationPrefs as any) ?? {}
      if (prefs.dailyDigest === false) continue

      await step.run(`digest-${user.id}`, async () => {
        const opps = await prisma.opportunity.findMany({
          where: {
            product: { userId: user.id },
            createdAt: { gte: since },
            status: 'QUEUED',
          },
          orderBy: { intentScore: 'desc' },
          take: 10,
          include: { product: { select: { name: true } }, subreddit: { select: { name: true } } },
        })
        // Only send if at least one lead came in
        if (opps.length === 0) return

        await sendDailyDigest(
          user.email!,
          user.name,
          opps.map(o => ({
            productName: o.product.name,
            postTitle: o.redditPostTitle,
            subreddit: o.subreddit.name,
            intentScore: o.intentScore,
          }))
        )
        sent++
      })
    }

    return { sent }
  }
)

// ─── Job 9: Competitor spy digest — every 2 days, paid users only ────────────

export const competitorDigest = inngest.createFunction(
  { id: 'competitor-digest' },
  { cron: '0 8 */2 * *' },
  async ({ step }) => {
    const users = await step.run('fetch-paid-users', () =>
      prisma.user.findMany({
        where: { email: { not: '' }, plan: { not: 'FREE' } },
        select: { id: true, email: true, name: true, notificationPrefs: true },
      })
    )

    const since = new Date(Date.now() - 48 * 60 * 60 * 1000)
    let sent = 0

    for (const user of users) {
      const prefs = (user.notificationPrefs as any) ?? {}
      if (prefs.competitorDigest === false) continue

      await step.run(`competitor-digest-${user.id}`, async () => {
        const threads = await prisma.opportunity.findMany({
          where: {
            product: { userId: user.id },
            createdAt: { gte: since },
            competitorMentioned: { not: null },
            status: { in: ['QUEUED', 'NO_PITCH'] },
          },
          orderBy: { intentScore: 'desc' },
          take: 8,
          include: { subreddit: { select: { name: true } } },
        })

        if (threads.length === 0) return

        const SWITCHING = ['leaving','cancelling','canceled','cancelled','switching from','alternative to','replace','instead of','moved from','dropped','ditching']

        await sendCompetitorDigest(
          user.email!,
          user.name,
          threads.map(t => ({
            competitor: t.competitorMentioned!,
            postTitle: t.redditPostTitle,
            subreddit: t.subreddit.name,
            postUrl: t.redditPostUrl,
            intentScore: t.intentScore,
            isSwitching: SWITCHING.some(p => `${t.redditPostTitle} ${t.redditPostBody ?? ''}`.toLowerCase().includes(p)),
          }))
        )
        sent++
      })
    }

    return { sent }
  }
)

// ─── Job 10: Weekly summary — Monday 8am UTC ──────────────────────────────────

export const weeklySummary = inngest.createFunction(
  { id: 'weekly-summary' },
  { cron: '0 8 * * 1' },
  async ({ step }) => {
    const users = await step.run('fetch-users', () =>
      prisma.user.findMany({
        where: { email: { not: '' } },
        select: { id: true, email: true, name: true, notificationPrefs: true },
      })
    )

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekOf = weekAgo.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    let sent = 0
    for (const user of users) {
      const prefs = (user.notificationPrefs as any) ?? {}
      if (prefs.weeklySummary === false) continue

      await step.run(`weekly-${user.id}`, async () => {
        const [newOpps, repliesDrafted, repliesApproved, topSubreddits] = await Promise.all([
          prisma.opportunity.count({
            where: { product: { userId: user.id }, createdAt: { gte: weekAgo } },
          }),
          prisma.reply.count({
            where: { opportunity: { product: { userId: user.id } }, createdAt: { gte: weekAgo } },
          }),
          prisma.opportunity.count({
            where: { product: { userId: user.id }, status: 'POSTED', updatedAt: { gte: weekAgo } },
          }),
          prisma.subreddit.findMany({
            where: {
              product: { userId: user.id },
              opportunities: { some: { createdAt: { gte: weekAgo } } },
            },
            orderBy: { opportunities: { _count: 'desc' } },
            take: 5,
            select: { name: true },
          }),
        ])

        if (newOpps === 0 && repliesDrafted === 0) return

        await sendWeeklySummary(user.email!, user.name, {
          newOpps,
          repliesDrafted,
          repliesApproved,
          topSubreddits: topSubreddits.map(s => s.name),
          weekOf,
        })
        sent++
      })
    }

    return { sent }
  }
)

export const functions = [
  /* scanSubreddits, */ manualScan, postApprovedReplies, dailyWarmup,
  weeklyGeoDigest, welcomeEmail, dailyDigest, weeklySummary, competitorDigest,
]
