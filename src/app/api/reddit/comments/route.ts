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

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  try {
    // Extract post id from URL: /r/sub/comments/{id}/...
    const postId = url.split('/comments/')[1]?.split('/')[0]
    if (!postId) return NextResponse.json({ comments: [], unavailable: true })

    // Try per-post RSS feed (comments appear as entries)
    const rssUrl = `https://www.reddit.com/comments/${postId}.rss?limit=15`
    const res = await fetch(rssUrl, {
      headers: { 'User-Agent': RSS_UA, 'Accept': 'application/atom+xml, application/xml' },
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      return NextResponse.json({ comments: [], unavailable: true })
    }

    const xml = await res.text()

    // Per-post RSS: first entry is the post itself, rest are top-level comments
    const entryRe = /<entry>([\s\S]*?)<\/entry>/g
    const entries: any[] = []
    let m: RegExpExecArray | null
    while ((m = entryRe.exec(xml)) !== null) entries.push(m[1])

    // Skip first entry (the post itself)
    const comments = entries.slice(1).slice(0, 10).map(e => {
      const author = e.match(/<name>\/u\/([^<\n]+)<\/name>/)?.[1]?.trim() ?? '[deleted]'
      const contentHtml = e.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] ?? ''
      const body = decodeXml(stripHtml(contentHtml)).slice(0, 500)
      return { author, body, score: 1 }
    }).filter(c => c.body.length > 0 && c.author !== '[deleted]')

    return NextResponse.json({ comments })
  } catch (e: any) {
    return NextResponse.json({ comments: [], unavailable: true })
  }
}
