import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const opportunity = await prisma.opportunity.findFirst({
    where: { id: params.id, product: { userId } },
  })
  if (!opportunity) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.opportunity.update({
    where: { id: params.id },
    data: { status: 'SKIPPED', reviewedAt: new Date() },
  })

  return NextResponse.json({ message: 'Skipped' })
}
