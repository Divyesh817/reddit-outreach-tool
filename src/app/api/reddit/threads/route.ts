export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const UA = 'Feedly/1.0 (+https://feedly.com/fetcher.html; like FeedFetcher-Google)'

function timedFetch(url: string, opts: RequestInit, ms = 8000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer))
}

// ─── Source 1: Pullpush (Reddit data mirror) ─────────────────────────────────

async function fromPullpush(subreddit: string, limit: number) {
  const res = await timedFetch(
    `https://api.pullpush.io/reddit/search/submission/?subreddit=${encodeURIComponent(subreddit)}&sort=desc&size=${limit}`,
    { headers: { 'User-Agent': UA, 'Accept': 'application/json' }, next: { revalidate: 0 } } as RequestInit
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data?.data ?? [])
    .filter((p: any) => p.title && p.id)
    .map((p: any) => ({
      id: String(p.id),
      title: p.title,
      selftext: p.selftext ?? '',
      author: p.author ?? '[deleted]',
      score: p.score ?? 1,
      num_comments: p.num_comments ?? 0,
      created_utc: p.created_utc ?? Math.floor(Date.now() / 1000),
      permalink: p.permalink ?? `/r/${subreddit}/comments/${p.id}/`,
      comments: [],
    }))
}

// ─── Source 2: Arctic Shift (another Reddit archive) ─────────────────────────

async function fromArcticShift(subreddit: string, limit: number) {
  const res = await timedFetch(
    `https://arctic-shift.photon-reddit.com/api/posts/search?subreddit=${encodeURIComponent(subreddit)}&limit=${limit}&sort=created_utc&order=desc`,
    { headers: { 'User-Agent': UA, 'Accept': 'application/json' }, next: { revalidate: 0 } } as RequestInit
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data?.data ?? [])
    .filter((p: any) => p.title && p.id)
    .map((p: any) => ({
      id: String(p.id),
      title: p.title,
      selftext: p.selftext ?? '',
      author: p.author ?? '[deleted]',
      score: p.score ?? 1,
      num_comments: p.num_comments ?? 0,
      created_utc: p.created_utc ?? Math.floor(Date.now() / 1000),
      permalink: p.permalink ?? `/r/${p.subreddit ?? subreddit}/comments/${p.id}/`,
      comments: [],
    }))
}

// ─── Source 3: Reddit RSS (last resort) ──────────────────────────────────────

async function fromRss(subreddit: string, limit: number) {
  const res = await timedFetch(
    `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/new.rss?limit=${limit}`,
    { headers: { 'User-Agent': UA, 'Accept': 'application/atom+xml, application/xml' }, next: { revalidate: 0 } } as RequestInit
  )
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
    const title = (e.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '').trim()
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    if (!title) continue
    const href = e.match(/href="(https:\/\/www\.reddit\.com\/r\/[^"]+\/comments\/[^"]+)"/)?.[1] ?? ''
    const author = e.match(/<name>\/u\/([^<\n]+)<\/name>/)?.[1]?.trim() ?? '[deleted]'
    const updated = e.match(/<updated>([^<]+)<\/updated>/)?.[1] ?? ''
    const content = e.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] ?? ''
    const selftext = content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      .replace(/\s*submitted by\s.*$/i, '').trim()
    threads.push({
      id, title, selftext, author,
      score: 1, num_comments: 0,
      created_utc: updated ? Math.floor(new Date(updated).getTime() / 1000) : Math.floor(Date.now() / 1000),
      permalink: href ? href.replace('https://www.reddit.com', '') : `/r/${subreddit}/comments/${id}/`,
      comments: [],
    })
  }
  return threads
}

// ─── Handler: try all sources, use first that returns data ───────────────────

export async function GET(req: NextRequest) {
  const subreddit = req.nextUrl.searchParams.get('subreddit')
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '25'), 25)
  if (!subreddit) return NextResponse.json({ error: 'Missing subreddit' }, { status: 400 })

  const sources = [
    () => fromPullpush(subreddit, limit),
    () => fromArcticShift(subreddit, limit),
    () => fromRss(subreddit, limit),
  ]

  for (const source of sources) {
    try {
      const threads = await source()
      if (threads.length > 0) {
        // Deduplicate by id
        const seen = new Set<string>()
        return NextResponse.json({
          threads: threads.filter((t: any) => { if (seen.has(t.id)) return false; seen.add(t.id); return true })
        })
      }
    } catch { /* try next source */ }
  }

  return NextResponse.json({ threads: [] })
}
