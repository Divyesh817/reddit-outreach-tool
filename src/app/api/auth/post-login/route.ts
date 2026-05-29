import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/lib/inngest'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ dest: '/login' }, { status: 401 })
  }

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
  } catch (err: any) {
    console.error('post-login: DB upsert failed', err?.message)
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

  return NextResponse.json({ dest })
}
