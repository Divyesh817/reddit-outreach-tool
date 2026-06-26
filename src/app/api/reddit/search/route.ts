export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const UA = 'Feedly/1.0 (+https://feedly.com/fetcher.html; like FeedFetcher-Google)'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = req.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 })

  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(`"${q}"`)}&sort=new&t=week&limit=25&type=link`
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'application/json' },
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      return NextResponse.json({ threads: [], error: `Reddit returned ${res.status}` })
    }

    const data = await res.json()
    const threads = (data?.data?.children ?? []).map((c: any) => {
      const d = c.data
      return {
        id: d.id,
        title: d.title,
        selftext: d.selftext ?? '',
        author: d.author ?? '[deleted]',
        score: d.score ?? 0,
        num_comments: d.num_comments ?? 0,
        created_utc: d.created_utc,
        permalink: d.permalink,
        subreddit: d.subreddit,
        url: d.url,
      }
    })

    return NextResponse.json({ threads })
  } catch (e: any) {
    return NextResponse.json({ threads: [], error: e.message })
  }
}
