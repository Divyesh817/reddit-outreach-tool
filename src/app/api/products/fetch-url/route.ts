export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { z } from 'zod'

const Schema = z.object({ url: z.string().url() })

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })

  try {
    const response = await fetch(parsed.data.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    })

    // Accept 2xx and some 3xx; treat 4xx/5xx as soft failures (still return empty html)
    const html = response.ok ? await response.text() : ''
    return NextResponse.json({ html: html.slice(0, 60000) })
  } catch (e: any) {
    // Return empty html rather than an error — the AI can still work from the URL alone
    return NextResponse.json({ html: '' })
  }
}
