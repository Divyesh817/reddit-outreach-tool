export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const RSS_UA = 'Feedly/1.0 (+https://feedly.com/fetcher.html; like FeedFetcher-Google)'

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
}

function extractSelftext(entry: string): string {
  const raw = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] ?? ''
  if (!raw) return ''
  // First pass: decode outer entities (&lt; → <, &amp; → &)
  const html = decodeXml(raw)
  // Strip HTML tags
  const stripped = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/\s*submitted by\s.*$/i, '').trim()
  // Second pass: decode remaining entities (&quot; → ", &#39; → ')
  return decodeXml(stripped)
}

function parseAtom(xml: string) {
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
    const created_utc = updated
      ? Math.floor(new Date(updated).getTime() / 1000)
      : Math.floor(Date.now() / 1000)

    threads.push({
      id,
      title,
      selftext: extractSelftext(e),
      author,
      score: 1,
      num_comments: 0,
      created_utc,
      permalink: href ? href.replace('https://www.reddit.com', '') : `/r/unknown/comments/${id}/`,
      comments: [],
    })
  }

  return threads
}

async function fetchRss(subreddit: string, sort: string, limit: number) {
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/${sort}.rss?limit=${limit}`
  const res = await fetch(url, {
    headers: { 'User-Agent': RSS_UA, 'Accept': 'application/atom+xml, application/rss+xml, application/xml' },
    next: { revalidate: 0 },
  })
  if (!res.ok) return []
  const xml = await res.text()
  return parseAtom(xml)
}

export async function GET(req: NextRequest) {
  const subreddit = req.nextUrl.searchParams.get('subreddit')
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '25'), 50)
  if (!subreddit) return NextResponse.json({ error: 'Missing subreddit' }, { status: 400 })

  try {
    const [newThreads, hotThreads] = await Promise.all([
      fetchRss(subreddit, 'new', limit),
      fetchRss(subreddit, 'hot', limit),
    ])

    const seen = new Set<string>()
    const threads = [...newThreads, ...hotThreads].filter(t => {
      if (!t?.id || seen.has(t.id)) return false
      seen.add(t.id)
      return true
    })

    return NextResponse.json({ threads })
  } catch (e: any) {
    return NextResponse.json({ threads: [], error: e.message })
  }
}
