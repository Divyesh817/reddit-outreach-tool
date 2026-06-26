export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const since = new Date(Date.now() - 72 * 60 * 60 * 1000)

  const results = await prisma.spyResult.findMany({
    where: {
      userId: user.id,
      createdAt: { gte: since },
      status: 'NEW',
    },
    orderBy: { redditPostedAt: 'desc' },
    take: 50,
    include: { product: { select: { name: true } } },
  })

  return NextResponse.json({ results })
}

export async function PATCH(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json()

  await prisma.spyResult.updateMany({
    where: { id, userId: user.id },
    data: { status },
  })

  return NextResponse.json({ ok: true })
}
