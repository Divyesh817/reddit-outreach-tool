export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const PLAN_PRICE: Record<string, number> = { STARTER: 9, GROWTH: 19 }

async function getBillingStats() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [byPlan, newPaidThisMonth, newPaidLastMonth] = await Promise.all([
    prisma.user.groupBy({ by: ['plan'], _count: true }),
    prisma.user.count({
      where: { plan: { in: ['STARTER', 'GROWTH'] }, createdAt: { gte: monthStart } },
    }),
    prisma.user.count({
      where: { plan: { in: ['STARTER', 'GROWTH'] }, createdAt: { gte: lastMonthStart, lt: monthStart } },
    }),
  ])

  const planMap: Record<string, number> = Object.fromEntries(byPlan.map(g => [g.plan, g._count]))
  const starterCount = planMap['STARTER'] ?? 0
  const growthCount  = planMap['GROWTH']  ?? 0
  const mrr = (starterCount * PLAN_PRICE.STARTER) + (growthCount * PLAN_PRICE.GROWTH)

  return { mrr, starterCount, growthCount, newPaidThisMonth, newPaidLastMonth }
}

function isAdmin() {
  const cookieStore = cookies()
  return cookieStore.get('admin_session')?.value === '1'
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    usersByPlan,
    recentUsers,
    totalProducts,
    totalOpportunities,
    totalPosted,
    billing,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ['plan'], _count: true }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, email: true, name: true, plan: true, createdAt: true },
    }),
    prisma.product.count(),
    prisma.opportunity.count(),
    prisma.postedReply.count(),
    getBillingStats(),
  ])

  return NextResponse.json({
    users: {
      total: totalUsers,
      byPlan: Object.fromEntries(usersByPlan.map(g => [g.plan, g._count])),
      recent: recentUsers,
    },
    products: { total: totalProducts },
    opportunities: { total: totalOpportunities },
    posted: { total: totalPosted },
    billing,
  })
}
