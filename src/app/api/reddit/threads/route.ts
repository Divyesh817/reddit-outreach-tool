export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function fetchSort(subreddit: string, sort: string, limit: string, extra = '') {
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/${sort}.json?limit=${limit}${extra}&raw_json=1`
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'application/json' },
    next: { revalidate: 0 },
  })
  if (!res.ok) return []
  const data = await res.json()
  // Reddit returns an error object (e.g. { error: 429 }) when rate-limited
  if (!data?.data?.children) return []
  return (data.data.children as any[]).map(c => c.data)
}

export async function GET(req: NextRequest) {
  const subreddit = req.nextUrl.searchParams.get('subreddit')
  const limit = req.nextUrl.searchParams.get('limit') ?? '15'
  if (!subreddit) return NextResponse.json({ error: 'Missing subreddit' }, { status: 400 })

  // Fetch /new then /hot sequentially — parallel bursts trigger Reddit rate limits on shared Vercel IPs
  const newThreads = await fetchSort(subreddit, 'new', limit)
  await delay(300)
  const hotThreads = await fetchSort(subreddit, 'hot', limit)

  // Deduplicate by id
  const seen = new Set<string>()
  const threads = [...newThreads, ...hotThreads].filter(t => {
    if (!t?.id || seen.has(t.id)) return false
    seen.add(t.id)
    return true
  })

  return NextResponse.json({ threads })
}
