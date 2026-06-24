export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS } from '@/types'
import type { Plan } from '@/types'

// Returns the list of subreddits + product profiles for the client to fetch Reddit threads.
// Reddit fetching happens client-side (browser IPs) to avoid Vercel IP blocks.
export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { plan: true } })
  const plan = (dbUser?.plan ?? 'FREE') as Plan
  const limits = PLAN_LIMITS[plan]

  // Rate limit manual scans to once every 3 hours — same cadence as the auto-scan.
  // Running more often just depletes the same thread pool the cron would have found.
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
  const lastScanned = await prisma.subreddit.findFirst({
    where: { product: { userId: user.id } },
    orderBy: { lastScannedAt: 'desc' },
    select: { lastScannedAt: true },
  })
  if (lastScanned?.lastScannedAt && lastScanned.lastScannedAt > threeHoursAgo) {
    const minutesLeft = Math.ceil((lastScanned.lastScannedAt.getTime() + 3 * 60 * 60 * 1000 - Date.now()) / 60000)
    return NextResponse.json({
      error: `Scan runs every 3 hours — next scan in ${minutesLeft} min`,
      tooSoon: true,
      nextScanIn: minutesLeft,
    }, { status: 429 })
  }

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const scansToday = await prisma.opportunity.count({
    where: { product: { userId: user.id }, createdAt: { gte: todayStart } },
  })
  if (limits.scansPerDay !== 9999 && scansToday >= limits.scansPerDay * 5) {
    return NextResponse.json({
      error: `Daily scan limit reached (${limits.scansPerDay}/day for ${plan})`,
      limitReached: true,
    }, { status: 429 })
  }

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const oppsThisMonth = await prisma.opportunity.count({
    where: { product: { userId: user.id }, createdAt: { gte: monthStart } },
  })
  if (oppsThisMonth >= limits.opportunitiesPerMonth) {
    return NextResponse.json({
      error: `Monthly limit reached (${limits.opportunitiesPerMonth} for ${plan})`,
      limitReached: true,
    }, { status: 429 })
  }

  const products = await prisma.product.findMany({
    where: { userId: user.id, isActive: true },
    include: {
      subreddits: {
        where: { isActive: true, isBlacklisted: false },
        take: limits.subredditsPerProduct,
      },
    },
  })

  if (!products.length) {
    return NextResponse.json({ error: 'No active products', subreddits: [] })
  }

  const subreddits = products.flatMap(p =>
    p.subreddits.map(s => ({
      subredditId: s.id,
      subredditName: s.name.replace(/^\/?r\//i, ''),
      productId: p.id,
    }))
  )

  return NextResponse.json({
    subreddits,
    fetchLimit: Math.min(25, limits.threadsPerSubreddit),
    lookbackHours: Math.max(limits.lookbackHours, 24),
    plan,
  })
}
