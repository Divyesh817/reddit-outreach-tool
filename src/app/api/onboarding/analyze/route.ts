export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scrapeProductProfile, discoverSubreddits, generateKeywordSuggestions } from '@/lib/anthropic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, html } = await req.json()
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  // html may be empty if the site blocked scraping — the AI uses the URL + domain signals
  const profile = await scrapeProductProfile(url, html || '')

  const [subreddits, keywords] = await Promise.all([
    discoverSubreddits(profile).catch(() => []),
    generateKeywordSuggestions(profile).catch(() => []),
  ])

  return NextResponse.json({ profile, subreddits, keywords })
}
