import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clientId = process.env.REDDIT_CLIENT_ID!
  const redirectUri = process.env.REDDIT_REDIRECT_URI!
  const state = Math.random().toString(36).slice(2)
  const scopes = 'identity submit read'

  const authUrl = new URL('https://www.reddit.com/api/v1/authorize')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('duration', 'permanent')
  authUrl.searchParams.set('scope', scopes)

  const response = NextResponse.redirect(authUrl.toString())
  response.cookies.set('reddit_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}
