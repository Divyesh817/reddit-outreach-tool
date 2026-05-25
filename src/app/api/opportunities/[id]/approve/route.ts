export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { inngest } from '@/lib/inngest'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const opportunity = await prisma.opportunity.findFirst({
    where: { id: params.id, product: { userId } },
  })
  if (!opportunity) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (opportunity.status !== 'QUEUED') {
    return NextResponse.json({ error: 'Opportunity is not in QUEUED status' }, { status: 400 })
  }

  await prisma.opportunity.update({
    where: { id: params.id },
    data: { status: 'APPROVED', reviewedAt: new Date() },
  })

  // Trigger background posting job
  await inngest.send({
    name: 'opportunity/approved',
    data: { opportunityId: params.id, userId },
  })

  return NextResponse.json({ message: 'Approved' })
}
