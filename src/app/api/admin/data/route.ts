export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'


async function getDodoStats() {
  try {
    const key = process.env.DODO_API_KEY
    if (!key) return null

    const [paymentsRes, subsRes] = await Promise.allSettled([
      fetch('https://live.dodopayments.com/payments?limit=100', {
        headers: { Authorization: `Bearer ${key}` },
        cache: 'no-store',
      }),
      fetch('https://live.dodopayments.com/subscriptions?limit=100', {
        headers: { Authorization: `Bearer ${key}` },
        cache: 'no-store',
      }),
    ])

    const payments = paymentsRes.status === 'fulfilled' && paymentsRes.value.ok
      ? await paymentsRes.value.json()
      : { items: [] }

    const subs = subsRes.status === 'fulfilled' && subsRes.value.ok
      ? await subsRes.value.json()
      : { items: [] }

    // Filter to Redgrow product IDs only
    const redgrowProductIds = new Set([
      process.env.DODO_STARTER_PRODUCT_ID,
      process.env.DODO_GROWTH_PRODUCT_ID,
    ].filter(Boolean))

    const allPayments: any[] = payments.items ?? []
    const allSubs: any[] = subs.items ?? []

    const paymentList = redgrowProductIds.size > 0
      ? allPayments.filter((p: any) => redgrowProductIds.has(p.product_id))
      : allPayments

    const subList = redgrowProductIds.size > 0
      ? allSubs.filter((s: any) => redgrowProductIds.has(s.product_id))
      : allSubs

    const totalRevenue = paymentList
      .filter((p: any) => p.status === 'succeeded')
      .reduce((sum: number, p: any) => sum + (p.total_amount ?? 0), 0)

    const activeSubCount = subList.filter((s: any) => s.status === 'active').length

    const recentPayments = paymentList
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map((p: any) => ({
        id: p.payment_id,
        amount: p.total_amount,
        currency: p.currency,
        status: p.status,
        createdAt: p.created_at,
      }))

    return { totalRevenue, activeSubCount, recentPayments, totalPayments: paymentList.length }
  } catch {
    return null
  }
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
    dodo,
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
    getDodoStats(),
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
    payments: dodo,
  })
}
