// src/lib/reddit.ts
import Snoowrap from 'snoowrap'
import { ApifyClient } from 'apify-client'
import { SAFETY } from '@/types'
import { prisma } from '@/lib/prisma'

const USER_AGENT = process.env.REDDIT_USER_AGENT || 'Redgrow/1.0 (by /u/PastReaction341)'
const REDDIT_HEADERS = { 'User-Agent': USER_AGENT }

// ─── Public thread fetching ───────────────────────────────────────────────────

export interface RedditThread {
  id: string
  url: string
  title: string
  selftext: string
  author: string
  score: number
  num_comments: number
  created_utc: number
  comments: string[]
}

export async function fetchNewThreads(
  subredditName: string,
  limit = 25,
  skipComments = false
): Promise<RedditThread[]> {
  const res = await fetch(
    `https://www.reddit.com/r/${subredditName}/new.json?limit=${limit}`,
    { headers: REDDIT_HEADERS, next: { revalidate: 0 } }
  )
  if (!res.ok) {
    if (res.status === 404) throw new Error(`r/${subredditName} not found`)
    if (res.status === 403) throw new Error(`r/${subredditName} is private`)
    throw new Error(`Reddit API error ${res.status}`)
  }
  const data = await res.json()
  const posts: any[] = data?.data?.children?.map((c: any) => c.data) ?? []
  return Promise.all(
    posts.slice(0, limit).map(async (post): Promise<RedditThread> => {
      let comments: string[] = []
      if (!skipComments) {
        try {
          const cr = await fetch(
            `https://www.reddit.com/r/${subredditName}/comments/${post.id}.json?limit=3&depth=1`,
            { headers: REDDIT_HEADERS, next: { revalidate: 0 } }
          )
          if (cr.ok) {
            const cd = await cr.json()
            comments = (cd?.[1]?.data?.children ?? [])
              .filter((c: any) => c.kind === 't1' && c.data?.body)
              .slice(0, 3)
              .map((c: any) => c.data.body as string)
          }
        } catch { /* non-fatal */ }
      }
      return {
        id: post.id,
        url: `https://reddit.com${post.permalink}`,
        title: post.title,
        selftext: post.selftext || '',
        author: post.author || '[deleted]',
        score: post.score ?? 0,
        num_comments: post.num_comments ?? 0,
        created_utc: post.created_utc,
        comments,
      }
    })
  )
}

export async function fetchHotThreads(
  subredditName: string,
  limit = 25,
  skipComments = false
): Promise<RedditThread[]> {
  const res = await fetch(
    `https://www.reddit.com/r/${subredditName}/hot.json?limit=${limit}`,
    { headers: REDDIT_HEADERS, next: { revalidate: 0 } }
  )
  if (!res.ok) return []
  const data = await res.json()
  const posts: any[] = data?.data?.children?.map((c: any) => c.data) ?? []
  return Promise.all(
    posts.slice(0, limit).map(async (post): Promise<RedditThread> => {
      let comments: string[] = []
      if (!skipComments) {
        try {
          const cr = await fetch(
            `https://www.reddit.com/r/${subredditName}/comments/${post.id}.json?limit=3&depth=1`,
            { headers: REDDIT_HEADERS, next: { revalidate: 0 } }
          )
          if (cr.ok) {
            const cd = await cr.json()
            comments = (cd?.[1]?.data?.children ?? [])
              .filter((c: any) => c.kind === 't1' && c.data?.body)
              .slice(0, 3)
              .map((c: any) => c.data.body as string)
          }
        } catch { /* non-fatal */ }
      }
      return {
        id: post.id,
        url: `https://reddit.com${post.permalink}`,
        title: post.title,
        selftext: post.selftext || '',
        author: post.author || '[deleted]',
        score: post.score ?? 0,
        num_comments: post.num_comments ?? 0,
        created_utc: post.created_utc,
        comments,
      }
    })
  )
}

export async function fetchTopThreads(
  subredditName: string,
  limit = 25,
  time: 'day' | 'week' = 'week',
  skipComments = false
): Promise<RedditThread[]> {
  const res = await fetch(
    `https://www.reddit.com/r/${subredditName}/top.json?limit=${limit}&t=${time}`,
    { headers: REDDIT_HEADERS, next: { revalidate: 0 } }
  )
  if (!res.ok) return []
  const data = await res.json()
  const posts: any[] = data?.data?.children?.map((c: any) => c.data) ?? []
  return Promise.all(
    posts.slice(0, limit).map(async (post): Promise<RedditThread> => {
      let comments: string[] = []
      if (!skipComments) {
        try {
          const cr = await fetch(
            `https://www.reddit.com/r/${subredditName}/comments/${post.id}.json?limit=3&depth=1`,
            { headers: REDDIT_HEADERS, next: { revalidate: 0 } }
          )
          if (cr.ok) {
            const cd = await cr.json()
            comments = (cd?.[1]?.data?.children ?? [])
              .filter((c: any) => c.kind === 't1' && c.data?.body)
              .slice(0, 3)
              .map((c: any) => c.data.body as string)
          }
        } catch { /* non-fatal */ }
      }
      return {
        id: post.id,
        url: `https://reddit.com${post.permalink}`,
        title: post.title,
        selftext: post.selftext || '',
        author: post.author || '[deleted]',
        score: post.score ?? 0,
        num_comments: post.num_comments ?? 0,
        created_utc: post.created_utc,
        comments,
      }
    })
  )
}

// ─── Recent Comment Threads ───────────────────────────────────────────────────
// Scans the subreddit's comment stream and returns the parent posts of
// recent comments — catches active discussions in older threads.

export async function fetchRecentCommentThreads(
  subredditName: string,
  limit = 15
): Promise<RedditThread[]> {
  const res = await fetch(
    `https://www.reddit.com/r/${subredditName}/comments.json?limit=${limit}`,
    {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 0 },
    }
  )
  if (!res.ok) return []

  const data = await res.json()
  const comments: any[] = data?.data?.children?.map((c: any) => c.data) ?? []

  // Get unique parent post IDs from these comments
  const postIds = [...new Set(comments.map((c: any) => c.link_id?.replace('t3_', '')).filter(Boolean))]

  // Fetch post details for unique threads
  const threadMap = new Map<string, RedditThread>()
  await Promise.allSettled(
    postIds.slice(0, 8).map(async (postId) => {
      try {
        const postRes = await fetch(
          `https://www.reddit.com/r/${subredditName}/comments/${postId}.json?limit=3&depth=1`,
          { headers: { 'User-Agent': USER_AGENT }, next: { revalidate: 0 } }
        )
        if (!postRes.ok) return
        const pd = await postRes.json()
        const post = pd?.[0]?.data?.children?.[0]?.data
        if (!post) return
        const commentListing = pd?.[1]?.data?.children ?? []
        const topComments = commentListing
          .filter((c: any) => c.kind === 't1' && c.data?.body)
          .slice(0, 3)
          .map((c: any) => c.data.body as string)

        threadMap.set(postId, {
          id: post.id,
          url: `https://reddit.com${post.permalink}`,
          title: post.title,
          selftext: post.selftext || '',
          author: post.author || '[deleted]',
          score: post.score ?? 0,
          num_comments: post.num_comments ?? 0,
          created_utc: post.created_utc,
          comments: topComments,
        })
      } catch { /* skip */ }
    })
  )

  return [...threadMap.values()]
}

// ─── Apify thread fetching (used by background jobs — bypasses Vercel IP block) ─

export async function fetchThreadsViaApify(
  subredditName: string,
  limit = 25
): Promise<RedditThread[]> {
  const token = process.env.APIFY_API_TOKEN
  if (!token) throw new Error('APIFY_API_TOKEN not set')

  const client = new ApifyClient({ token })

  const run = await client.actor('trudax/reddit-scraper').call({
    searches: [{
      keywords: '',
      subreddit: subredditName,
      type: 'link',
      sort: 'new',
      time: 'week',
    }],
    maxItems: limit,
    commentsPerPost: 5,
    proxy: { useApifyProxy: true },
  })

  const { items } = await client.dataset(run.defaultDatasetId).listItems()

  // Group comments by their parent post id
  const commentsByPost: Record<string, string[]> = {}
  for (const item of items as any[]) {
    if (item.dataType === 'comment' && item.parentId) {
      const postId = String(item.parentId).replace(/^t3_/, '')
      if (!commentsByPost[postId]) commentsByPost[postId] = []
      if (item.text && commentsByPost[postId].length < 5) {
        commentsByPost[postId].push(String(item.text).slice(0, 300))
      }
    }
  }

  return (items as any[])
    .filter(item => (item.dataType === 'post' || !item.dataType) && item.title && item.id)
    .map((item): RedditThread => {
      const id = String(item.id)
      return {
        id,
        url: item.url ?? `https://reddit.com/r/${subredditName}`,
        title: item.title,
        selftext: item.text ?? item.selftext ?? item.body ?? '',
        author: item.author ?? '[deleted]',
        score: item.score ?? 1,
        num_comments: item.numberOfComments ?? item.numComments ?? 0,
        created_utc: item.createdAt
          ? Math.floor(new Date(item.createdAt).getTime() / 1000)
          : Math.floor(Date.now() / 1000),
        comments: commentsByPost[id] ?? [],
      }
    })
}

// ─── Client Factory (for posting — requires user OAuth) ───────────────────────

export function getRedditClient(accessToken: string, refreshToken: string) {
  return new Snoowrap({
    userAgent: USER_AGENT,
    clientId: process.env.REDDIT_CLIENT_ID!,
    clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    accessToken,
    refreshToken,
  })
}

// ─── Posting (future use — requires user Reddit OAuth) ────────────────────────

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
