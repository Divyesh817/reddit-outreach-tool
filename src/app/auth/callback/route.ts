import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/lib/inngest'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin

  // Collect cookies from the session exchange so we can attach them to the redirect
  const cookiesToSet: { name: string; value: string; options: any }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookies) { cookiesToSet.push(...cookies) },
      },
    }
  )

  let user = null
  let authError = null

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code)
    user = result.data.user
    authError = result.error
  } else if (token_hash && type) {
    const result = await supabase.auth.verifyOtp({ token_hash, type })
    user = result.data.user
    authError = result.error
  }

  function redirect(path: string) {
    const res = NextResponse.redirect(`${appUrl}${path}`)
    cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
    return res
  }

  if (!authError && user) {
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

    if (isNewUser) {
      try {
        await inngest.send({ name: 'user/created', data: { userId: user.id } })
      } catch { /* non-fatal */ }
    }

    let dest = '/onboarding'
    try {
      const productCount = await prisma.product.count({ where: { userId: user.id } })
      dest = productCount === 0 ? '/onboarding' : '/dashboard'
    } catch {}

    return redirect(dest)
  }

  return redirect('/login?error=auth')
}
