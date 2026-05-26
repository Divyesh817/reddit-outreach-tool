import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/lib/inngest'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  let user = null
  let error = null

  if (code) {
    // Google OAuth / PKCE flow
    const result = await supabase.auth.exchangeCodeForSession(code)
    user = result.data.user
    error = result.error
  } else if (token_hash && type) {
    // Magic link / email OTP flow
    const result = await supabase.auth.verifyOtp({ token_hash, type })
    user = result.data.user
    error = result.error
  }

  // Always use the configured app URL so Vercel's internal domain doesn't leak
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin

  if (!error && user) {
    // Upsert user record — non-fatal if DB is slow/unavailable
    let isNewUser = false
    try {
      const existing = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true } })
      isNewUser = !existing
      await prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name ?? null,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
        },
        update: {
          email: user.email!,
          name: user.user_metadata?.full_name ?? null,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
        },
      })
    } catch (dbErr: any) {
      console.error('Auth callback: DB upsert failed', dbErr?.message)
    }

    // Fire welcome email job for brand-new signups
    if (isNewUser) {
      try {
        await inngest.send({ name: 'user/created', data: { userId: user.id } })
      } catch { /* non-fatal */ }
    }

    // No products → onboarding; has products → dashboard
    let dest = '/onboarding'
    try {
      const productCount = await prisma.product.count({ where: { userId: user.id } })
      dest = productCount === 0 ? '/onboarding' : '/dashboard'
    } catch {}

    return NextResponse.redirect(`${appUrl}${dest}`)
  }

  return NextResponse.redirect(`${appUrl}/login?error=auth`)
}
