export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  // Verify product belongs to user
  const product = await prisma.product.findFirst({
    where: { id: productId, userId: user.id },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const reports = await prisma.geoReport.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: {
      id: true,
      geoScore: true,
      weekOf: true,
      createdAt: true,
      analysis: true,
    },
  })

  return NextResponse.json({ data: reports })
}
