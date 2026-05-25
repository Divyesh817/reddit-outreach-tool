import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

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

  if (!error && user) {
    // Upsert user record in our DB
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

    // No products → onboarding; has products → dashboard
    const productCount = await prisma.product.count({ where: { userId: user.id } })
    const dest = productCount === 0 ? '/onboarding' : '/dashboard'
    return NextResponse.redirect(`${origin}${dest}`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
