export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const subreddit = req.nextUrl.searchParams.get('subreddit')
  const limit = req.nextUrl.searchParams.get('limit') ?? '15'
  if (!subreddit) return NextResponse.json({ error: 'Missing subreddit' }, { status: 400 })

  const ua = 'Redgrow/1.0.0 (by /u/redgrow_app)'
  const base = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}`

  const [nr, hr, tr] = await Promise.allSettled([
    fetch(`${base}/new.json?limit=${limit}`, { headers: { 'User-Agent': ua }, next: { revalidate: 0 } }).then(r => r.json()),
    fetch(`${base}/hot.json?limit=${limit}`, { headers: { 'User-Agent': ua }, next: { revalidate: 0 } }).then(r => r.json()),
    fetch(`${base}/top.json?limit=${limit}&t=day`, { headers: { 'User-Agent': ua }, next: { revalidate: 0 } }).then(r => r.json()),
  ])

  const threads = [
    ...(nr.status === 'fulfilled' ? (nr.value?.data?.children ?? []).map((c: any) => c.data) : []),
    ...(hr.status === 'fulfilled' ? (hr.value?.data?.children ?? []).map((c: any) => c.data) : []),
    ...(tr.status === 'fulfilled' ? (tr.value?.data?.children ?? []).map((c: any) => c.data) : []),
  ]

  return NextResponse.json({ threads })
}
