export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (user as any).id

  const health = await prisma.accountHealth.findUnique({ where: { userId } })
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { redditUsername: true, redditConnectedAt: true },
  })

  return NextResponse.json({ data: { ...health, redditUsername: dbUser?.redditUsername, connectedAt: dbUser?.redditConnectedAt } })
}
