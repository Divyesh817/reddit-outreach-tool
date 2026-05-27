export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

function isAdmin() {
  return cookies().get('admin_session')?.value === '1'
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { email: true, name: true, plan: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  return NextResponse.json(tickets)
}
