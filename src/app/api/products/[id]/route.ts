import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const UpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  targetAudience: z.string().optional(),
  keyBenefits: z.array(z.string()).optional(),
  competitors: z.array(z.string()).optional(),
  summary: z.string().optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const product = await prisma.product.findFirst({
    where: { id: params.id, userId },
    include: {
      subreddits: { orderBy: { fitScore: 'desc' } },
      _count: { select: { opportunities: true } },
    },
  })

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: product })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const body = await req.json().catch(() => null)
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const product = await prisma.product.findFirst({ where: { id: params.id, userId } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.product.update({
    where: { id: params.id },
    data: parsed.data,
    include: { subreddits: true },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const product = await prisma.product.findFirst({ where: { id: params.id, userId } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.product.update({ where: { id: params.id }, data: { isActive: false } })
  return NextResponse.json({ message: 'Deleted' })
}
