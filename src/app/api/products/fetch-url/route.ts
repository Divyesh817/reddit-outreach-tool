import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const Schema = z.object({ url: z.string().url() })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })

  try {
    const response = await fetch(parsed.data.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RedditOutreachBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.status}` }, { status: 400 })
    }

    const html = await response.text()
    return NextResponse.json({ html: html.slice(0, 50000) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch URL' }, { status: 400 })
  }
}
