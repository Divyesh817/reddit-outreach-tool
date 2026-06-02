export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const UA = 'Feedly/1.0 (+https://feedly.com/fetcher.html; like FeedFetcher-Google)'

// ─── Source 1: Pullpush comments endpoint ────────────────────────────────────

async function fromPullpush(postId: string) {
  const res = await fetch(
    `https://api.pullpush.io/reddit/search/comment/?link_id=t3_${postId}&sort=desc&size=10`,
    { headers: { 'User-Agent': UA, 'Accept': 'application/json' }, next: { revalidate: 0 } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data?.data ?? [])
    .filter((c: any) => c.body && c.body !== '[deleted]' && c.body !== '[removed]' && c.author !== '[deleted]')
    .slice(0, 10)
    .map((c: any) => ({
      author: c.author ?? '[deleted]',
      body: String(c.body).slice(0, 500),
      score: c.score ?? 1,
    }))
}

// ─── Source 2: Arctic Shift comments endpoint ─────────────────────────────────

async function fromArcticShift(postId: string) {
  const res = await fetch(
    `https://arctic-shift.photon-reddit.com/api/comments/search?link_id=t3_${postId}&limit=10&order=desc`,
    { headers: { 'User-Agent': UA, 'Accept': 'application/json' }, next: { revalidate: 0 } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data?.data ?? [])
    .filter((c: any) => c.body && c.body !== '[deleted]' && c.body !== '[removed]' && c.author !== '[deleted]')
    .slice(0, 10)
    .map((c: any) => ({
      author: c.author ?? '[deleted]',
      body: String(c.body).slice(0, 500),
      score: c.score ?? 1,
    }))
}

// ─── Source 3: Reddit per-post RSS ───────────────────────────────────────────

async function fromRss(postId: string) {
  const res = await fetch(
    `https://www.reddit.com/comments/${postId}.rss?limit=15`,
    { headers: { 'User-Agent': UA, 'Accept': 'application/atom+xml' }, next: { revalidate: 0 } }
  )
  if (!res.ok) return []
  const xml = await res.text()
  const entries: string[] = []
  const re = /<entry>([\s\S]*?)<\/entry>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) entries.push(m[1])

  return entries.slice(1).slice(0, 10).map(e => {
    const author = e.match(/<name>\/u\/([^<\n]+)<\/name>/)?.[1]?.trim() ?? '[deleted]'
    const contentHtml = e.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] ?? ''
    const decoded = contentHtml
      .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&')
      .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(parseInt(n,10)))
    const stripped = decoded.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()
    // Second pass: handle double-encoded entities
    const body = stripped
      .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
      .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(parseInt(n,10))).slice(0, 500)
    return { author, body, score: 1 }
  }).filter(c => c.body.length > 10 && c.author !== '[deleted]')
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  const postId = url.split('/comments/')[1]?.split('/')[0]
  if (!postId) return NextResponse.json({ comments: [] })

  const sources = [
    () => fromPullpush(postId),
    () => fromArcticShift(postId),
    () => fromRss(postId),
  ]

  for (const source of sources) {
    try {
      const comments = await source()
      if (comments.length > 0) return NextResponse.json({ comments })
    } catch { /* try next */ }
  }

  return NextResponse.json({ comments: [] })
}
