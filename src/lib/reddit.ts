// src/lib/reddit.ts
import Snoowrap from 'snoowrap'
import { SAFETY } from '@/types'
import { prisma } from '@/lib/prisma'

// ─── Client Factory ───────────────────────────────────────────────────────────

export function getRedditClient(accessToken: string, refreshToken: string) {
  return new Snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT!,
    clientId: process.env.REDDIT_CLIENT_ID!,
    clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    accessToken,
    refreshToken,
  })
}

// ─── Subreddit Scanning ───────────────────────────────────────────────────────

export async function fetchNewThreads(
  subredditName: string,
  accessToken: string,
  refreshToken: string,
  limit = 25
): Promise<Array<{
  id: string
  url: string
  title: string
  selftext: string
  author: string
  score: number
  num_comments: number
  created_utc: number
  comments: string[]
}>> {
  const reddit = getRedditClient(accessToken, refreshToken)
  const subreddit = reddit.getSubreddit(subredditName)
  const posts = await subreddit.getNew({ limit })

  return Promise.all(posts.map(async (post) => {
    // Fetch top 3 comments for context scoring
    const comments: string[] = await (post.comments as any)
      .fetchMore({ amount: 3 })
      .then((c: any[]) => c.slice(0, 3).map((comment: any) => comment.body))
      .catch(() => [])

    return {
      id: post.id,
      url: `https://reddit.com${post.permalink}`,
      title: post.title,
      selftext: post.selftext || '',
      author: post.author.name,
      score: post.score,
      num_comments: post.num_comments,
      created_utc: post.created_utc,
      comments,
    }
  }))
}

// ─── Posting ──────────────────────────────────────────────────────────────────

export async function postReply(
  postId: string,
  replyText: string,
  accessToken: string,
  refreshToken: string
): Promise<{ commentId: string; commentUrl: string }> {
  const reddit = getRedditClient(accessToken, refreshToken)
  const submission = reddit.getSubmission(postId)
  const comment = await (submission.reply(replyText) as any)

  return {
    commentId: comment.id,
    commentUrl: `https://reddit.com${comment.permalink}`,
  }
}

// ─── Safety Checks ────────────────────────────────────────────────────────────

export async function checkDailyPostingLimit(userId: string): Promise<{
  canPost: boolean
  postsToday: number
  limit: number
}> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const postsToday = await prisma.postedReply.count({
    where: {
      opportunity: { product: { userId } },
      postedAt: { gte: today },
    }
  })

  return {
    canPost: postsToday < SAFETY.MAX_PROMO_REPLIES_PER_DAY,
    postsToday,
    limit: SAFETY.MAX_PROMO_REPLIES_PER_DAY,
  }
}

export async function checkSubredditCooldown(
  userId: string,
  subredditName: string,
  productUrl: string
): Promise<boolean> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - SAFETY.MIN_DAYS_BETWEEN_SAME_SUBREDDIT_URL)

  const recentPost = await prisma.postedReply.findFirst({
    where: {
      opportunity: {
        product: { userId, url: productUrl },
        subreddit: { name: subredditName },
      },
      postedAt: { gte: cutoff },
    }
  })

  return !recentPost // true = safe to post
}

// ─── Shadowban Detection ──────────────────────────────────────────────────────

export async function checkShadowban(username: string): Promise<boolean> {
  try {
    // Check if user's comments are visible to logged-out users
    const response = await fetch(
      `https://www.reddit.com/user/${username}/comments.json?limit=1`,
      { headers: { 'User-Agent': process.env.REDDIT_USER_AGENT! } }
    )

    if (response.status === 404) return true  // account suspended or banned
    if (!response.ok) return false // API error, assume not banned

    const data = await response.json()
    const comments = data?.data?.children || []

    // If no comments show up publicly but user has posted, likely shadowbanned
    return comments.length === 0

  } catch {
    return false // assume not banned on fetch error
  }
}

// ─── Comment Visibility Check ─────────────────────────────────────────────────

export async function checkCommentVisible(commentUrl: string): Promise<boolean> {
  try {
    const jsonUrl = commentUrl.replace(/\/?$/, '.json')
    const response = await fetch(jsonUrl, {
      headers: { 'User-Agent': process.env.REDDIT_USER_AGENT! }
    })
    if (!response.ok) return false
    const data = await response.json()
    return Array.isArray(data) && data.length > 1
  } catch {
    return false
  }
}

// ─── Subreddit Rules Scanner ──────────────────────────────────────────────────

export async function fetchSubredditRules(subredditName: string): Promise<{
  allowsPromotion: boolean
  rulesText: string
}> {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subredditName}/about/rules.json`,
      { headers: { 'User-Agent': process.env.REDDIT_USER_AGENT! } }
    )

    if (!response.ok) return { allowsPromotion: true, rulesText: '' }

    const data = await response.json()
    const rules = data?.rules || []
    const rulesText = rules.map((r: any) => `${r.short_name}: ${r.description}`).join('\n')

    // Check for common no-promotion keywords
    const noPromoKeywords = [
      'no self-promotion', 'no promotion', 'no advertising', 'no spam',
      'no affiliate', 'no referral', 'no marketing'
    ]
    const lowerRules = rulesText.toLowerCase()
    const allowsPromotion = !noPromoKeywords.some(kw => lowerRules.includes(kw))

    return { allowsPromotion, rulesText }
  } catch {
    return { allowsPromotion: true, rulesText: '' }
  }
}

// ─── Account Karma ────────────────────────────────────────────────────────────

export async function fetchAccountKarma(
  username: string,
  accessToken: string,
  refreshToken: string
): Promise<{ karma: number; accountAgeDays: number }> {
  const reddit = getRedditClient(accessToken, refreshToken)
  const user = await (reddit.getUser(username).fetch() as any)

  const createdAt = new Date((user as any).created_utc * 1000)
  const accountAgeDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  return {
    karma: (user as any).comment_karma + (user as any).link_karma,
    accountAgeDays,
  }
}
