export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  try {
    const clean = url.split('?')[0].replace(/\/$/, '')
    const jsonUrl = `${clean}.json?limit=25&depth=1&raw_json=1`

    const res = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Reddit returned ${res.status}`, comments: [] })
    }

    const data = await res.json()
    const children = data?.[1]?.data?.children ?? []

    const comments = children
      .filter((c: any) =>
        c.kind === 't1' &&
        c.data?.body &&
        c.data.body !== '[deleted]' &&
        c.data.body !== '[removed]' &&
        c.data.author !== 'AutoModerator' &&
        c.data.author !== '[deleted]'
      )
      .slice(0, 10)
      .map((c: any) => ({
        author: c.data.author as string,
        body: c.data.body as string,
        score: c.data.score as number,
      }))

    return NextResponse.json({ comments })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, comments: [] })
  }
}
