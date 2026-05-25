export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (user as any).id

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'QUEUED'
  const painType = searchParams.get('painType') || undefined
  const productId = searchParams.get('productId') || undefined
  const page = parseInt(searchParams.get('page') || '1')
  const take = 20

  const where: any = {
    product: { userId },
    status,
    ...(painType && { painType }),
    ...(productId && { productId }),
  }

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      orderBy: { intentScore: 'desc' },
      skip: (page - 1) * take,
      take,
      include: {
        subreddit: { select: { name: true } },
        replies: { where: { isActive: true }, take: 1 },
        product: { select: { name: true, url: true } },
      },
    }),
    prisma.opportunity.count({ where }),
  ])

  return NextResponse.json({
    data: opportunities,
    meta: { total, page, pages: Math.ceil(total / take) },
  })
}
