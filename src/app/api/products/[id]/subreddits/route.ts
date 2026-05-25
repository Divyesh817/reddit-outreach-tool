export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const AddSchema = z.object({ name: z.string().min(1) })
const ToggleSchema = z.object({ subredditId: z.string(), isActive: z.boolean() })

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (user as any).id

  const product = await prisma.product.findFirst({ where: { id: params.id, userId } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = AddSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const subreddit = await prisma.subreddit.upsert({
    where: { productId_name: { productId: product.id, name: parsed.data.name } },
    update: { isActive: true },
    create: { productId: product.id, name: parsed.data.name, fitScore: 50, isActive: true },
  })

  return NextResponse.json({ data: subreddit }, { status: 201 })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (user as any).id

  const product = await prisma.product.findFirst({ where: { id: params.id, userId } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = ToggleSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const sub = await prisma.subreddit.findFirst({
    where: { id: parsed.data.subredditId, productId: product.id },
  })
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.subreddit.update({
    where: { id: parsed.data.subredditId },
    data: { isActive: parsed.data.isActive },
  })

  return NextResponse.json({ data: updated })
}
