export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { keywords } = await req.json()
  if (!Array.isArray(keywords)) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const product = await prisma.product.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: { keywords: keywords.slice(0, 30) },
    select: { keywords: true },
  })

  return NextResponse.json(updated)
}
