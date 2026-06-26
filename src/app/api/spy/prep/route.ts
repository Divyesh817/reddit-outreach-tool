export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const COOLDOWN_HOURS = 3

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true },
  })

  if (!dbUser || dbUser.plan === 'FREE') {
    return NextResponse.json({ error: 'Competitor Spy is a paid feature', locked: true }, { status: 403 })
  }

  // Rate limit — once per 3 hours
  const cooldownCutoff = new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000)
  const lastScan = await prisma.spyResult.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })
  if (lastScan?.createdAt && lastScan.createdAt > cooldownCutoff) {
    const minutesLeft = Math.ceil((lastScan.createdAt.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000 - Date.now()) / 60000)
    return NextResponse.json({
      error: `Next spy scan in ${minutesLeft} min`,
      tooSoon: true,
      nextScanIn: minutesLeft,
    }, { status: 429 })
  }

  // Get competitors from active products
  const products = await prisma.product.findMany({
    where: { userId: user.id, isActive: true },
    select: { id: true, name: true, competitors: true },
  })

  if (!products.length) {
    return NextResponse.json({ error: 'No active products' }, { status: 400 })
  }

  // Flatten competitors per product, deduplicate
  const searches = products.flatMap(p =>
    (p.competitors as string[])
      .filter(c => c && c.trim().length > 0)
      .map(c => ({ competitor: c.trim(), productId: p.id, productName: p.name }))
  )

  if (!searches.length) {
    return NextResponse.json({ error: 'No competitors configured. Add competitors to your product profile.' }, { status: 400 })
  }

  return NextResponse.json({ searches, lookbackHours: 72 })
}
