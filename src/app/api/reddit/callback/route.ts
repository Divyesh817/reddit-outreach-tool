export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fetchAccountKarma } from '@/lib/reddit'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.redirect(new URL('/login', req.url))
  const userId = (session.user as any).id

  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const storedState = req.cookies.get('reddit_oauth_state')?.value

  if (error || !code) {
    return NextResponse.redirect(new URL('/settings?error=reddit_denied', req.url))
  }

  if (!state || state !== storedState) {
    return NextResponse.redirect(new URL('/settings?error=reddit_state_mismatch', req.url))
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
      'User-Agent': process.env.REDDIT_USER_AGENT!,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.REDDIT_REDIRECT_URI!,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/settings?error=reddit_token_failed', req.url))
  }

  const tokens = await tokenRes.json()
  const { access_token, refresh_token, expires_in } = tokens

  // Fetch Reddit username
  const meRes = await fetch('https://oauth.reddit.com/api/v1/me', {
    headers: {
      'Authorization': `bearer ${access_token}`,
      'User-Agent': process.env.REDDIT_USER_AGENT!,
    },
  })

  if (!meRes.ok) {
    return NextResponse.redirect(new URL('/settings?error=reddit_me_failed', req.url))
  }

  const me = await meRes.json()
  const username = me.name
  const tokenExpiry = new Date(Date.now() + expires_in * 1000)

  // Save tokens
  await prisma.user.update({
    where: { id: userId },
    data: {
      redditUsername: username,
      redditAccessToken: access_token,
      redditRefreshToken: refresh_token,
      redditTokenExpiry: tokenExpiry,
      redditConnectedAt: new Date(),
    },
  })

  // Bootstrap account health
  const { karma, accountAgeDays } = await fetchAccountKarma(username, access_token, refresh_token)
  await prisma.accountHealth.upsert({
    where: { userId },
    update: { karma, accountAgeDays },
    create: { userId, karma, accountAgeDays },
  })

  // Start warmup if account has no active session
  const existingWarmup = await prisma.warmupSession.findUnique({ where: { userId } })
  if (!existingWarmup) {
    await prisma.warmupSession.create({
      data: {
        userId,
        targetDays: accountAgeDays < 30 ? 14 : 7,
        status: 'IN_PROGRESS',
      },
    })
  }

  const response = NextResponse.redirect(new URL('/settings?success=reddit_connected', req.url))
  response.cookies.delete('reddit_oauth_state')
  return response
}
