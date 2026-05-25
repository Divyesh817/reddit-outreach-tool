export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const opportunity = await prisma.opportunity.findFirst({
    where: { id: params.id, product: { userId: user.id } },
  })
  if (!opportunity) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Mark as POSTED (user copied the reply and posted it manually)
  await prisma.opportunity.update({
    where: { id: params.id },
    data: { status: 'POSTED', reviewedAt: new Date() },
  })

  return NextResponse.json({ message: 'Marked as done' })
}
