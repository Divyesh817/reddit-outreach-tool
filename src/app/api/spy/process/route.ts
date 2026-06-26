export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

interface RawSpyThread {
  id: string
  title: string
  selftext: string
  author: string
  score: number
  num_comments: number
  created_utc: number
  permalink: string
  subreddit: string
  url: string
}

interface SpyBatch {
  competitor: string
  productId: string
  threads: RawSpyThread[]
}

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { plan: true } })
  if (!dbUser || dbUser.plan === 'FREE') {
    return NextResponse.json({ error: 'Paid feature' }, { status: 403 })
  }

  const body = await req.json()
  const batches: SpyBatch[] = body.batches ?? []

  if (!batches.length) return NextResponse.json({ created: 0 })

  const lookbackCutoff = new Date(Date.now() - 72 * 60 * 60 * 1000)

  let created = 0

  for (const { competitor, productId, threads } of batches) {
    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: { id: productId, userId: user.id },
      select: { id: true },
    })
    if (!product) continue

    const fresh = threads.filter(t => {
      const d = new Date(t.created_utc * 1000)
      if (d < lookbackCutoff) return false
      if (t.author === '[deleted]' || t.author === 'AutoModerator') return false
      if (t.title === '[deleted]' || t.title === '[removed]') return false
      return true
    })

    for (const thread of fresh) {
      try {
        await prisma.spyResult.upsert({
          where: { productId_redditPostId: { productId, redditPostId: thread.id } },
          create: {
            userId: user.id,
            productId,
            competitor,
            redditPostId: thread.id,
            redditPostUrl: `https://reddit.com${thread.permalink}`,
            redditPostTitle: thread.title,
            redditPostBody: thread.selftext || null,
            redditAuthor: thread.author,
            redditScore: thread.score,
            redditCommentCount: thread.num_comments,
            redditPostedAt: new Date(thread.created_utc * 1000),
            subredditName: thread.subreddit,
            status: 'NEW',
          },
          update: {
            redditScore: thread.score,
            redditCommentCount: thread.num_comments,
          },
        })
        created++
      } catch { continue }
    }
  }

  return NextResponse.json({ created })
}
