export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: params.id, userId: user.id },
  })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (ticket.status === 'resolved') {
    return NextResponse.json({ error: 'Ticket is resolved' }, { status: 400 })
  }

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const message = await prisma.ticketMessage.create({
    data: { ticketId: params.id, content: content.trim(), isAdmin: false },
  })

  await prisma.supportTicket.update({
    where: { id: params.id },
    data: { status: 'open', updatedAt: new Date() },
  })

  return NextResponse.json(message)
}
