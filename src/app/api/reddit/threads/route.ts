export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client'

export async function GET(req: NextRequest) {
  const subreddit = req.nextUrl.searchParams.get('subreddit')
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '25'), 25)
  if (!subreddit) return NextResponse.json({ error: 'Missing subreddit' }, { status: 400 })

  const token = process.env.APIFY_API_TOKEN
  if (!token) return NextResponse.json({ threads: [], error: 'APIFY_API_TOKEN not configured' })

  try {
    const client = new ApifyClient({ token })

    const run = await client.actor('trudax/reddit-scraper').call({
      searches: [{
        keywords: '',
        subreddit,
        type: 'link',
        sort: 'new',
        time: 'week',
      }],
      maxItems: limit,
      commentsPerPost: 5,
      proxy: { useApifyProxy: true },
    })

    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    // Group comments under their parent post id
    const commentsByPost: Record<string, string[]> = {}
    for (const item of items as any[]) {
      if (item.dataType === 'comment' && item.parentId) {
        const postId = String(item.parentId).replace(/^t3_/, '')
        if (!commentsByPost[postId]) commentsByPost[postId] = []
        if (commentsByPost[postId].length < 5 && item.text) {
          commentsByPost[postId].push(String(item.text).slice(0, 500))
        }
      }
    }

    const threads = (items as any[])
      .filter(item => (item.dataType === 'post' || !item.dataType) && item.title && item.id)
      .map(item => {
        const id = String(item.id)
        return {
          id,
          title: item.title,
          selftext: item.text ?? item.selftext ?? item.body ?? '',
          author: item.author ?? '[deleted]',
          score: item.score ?? 1,
          num_comments: item.numberOfComments ?? item.numComments ?? 0,
          created_utc: item.createdAt
            ? Math.floor(new Date(item.createdAt).getTime() / 1000)
            : Math.floor(Date.now() / 1000),
          permalink: item.url
            ? item.url.replace('https://www.reddit.com', '')
            : `/r/${subreddit}/comments/${id}/`,
          comments: commentsByPost[id] ?? [],
        }
      })

    return NextResponse.json({ threads })
  } catch (e: any) {
    return NextResponse.json({ threads: [], error: e.message })
  }
}
