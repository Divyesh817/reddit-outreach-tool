export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

function isAdmin() {
  return cookies().get('admin_session')?.value === '1'
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const message = await prisma.ticketMessage.create({
    data: { ticketId: params.id, content: content.trim(), isAdmin: true },
  })

  await prisma.supportTicket.update({
    where: { id: params.id },
    data: { status: 'in_progress', updatedAt: new Date() },
  })

  return NextResponse.json(message)
}
