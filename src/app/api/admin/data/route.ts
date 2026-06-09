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

    const paymentsBody = paymentsRes.status === 'fulfilled' && paymentsRes.value.ok
      ? await paymentsRes.value.json()
      : {}

    const subsBody = subsRes.status === 'fulfilled' && subsRes.value.ok
      ? await subsRes.value.json()
      : {}

    const redgrowProductIds = new Set([
      process.env.DODO_STARTER_PRODUCT_ID,
      process.env.DODO_GROWTH_PRODUCT_ID,
    ].filter(Boolean))

    // Dodo may return items at .items or .data
    const allPayments: any[] = paymentsBody.items ?? paymentsBody.data ?? []
    const allSubs: any[] = subsBody.items ?? subsBody.data ?? []

    // Payment product_id may be top-level or nested in items array (matches webhook structure)
    function paymentProductId(p: any): string {
      return p.product_id ?? p.items?.[0]?.product_id ?? ''
    }

    const paymentList = redgrowProductIds.size > 0
      ? allPayments.filter((p: any) => redgrowProductIds.has(paymentProductId(p)))
      : allPayments

    const subList = redgrowProductIds.size > 0
      ? allSubs.filter((s: any) => redgrowProductIds.has(s.product_id ?? ''))
      : allSubs

    // Accept all Dodo success statuses
    const PAID_STATUSES = new Set(['succeeded', 'paid', 'captured', 'complete', 'completed'])

    const totalRevenue = paymentList
      .filter((p: any) => PAID_STATUSES.has((p.status ?? '').toLowerCase()))
      .reduce((sum: number, p: any) => sum + (p.total_amount ?? p.amount ?? 0), 0)

    const activeSubs = subList.filter((s: any) => s.status === 'active')

    // Build paid customers list from active subscriptions
    const paidCustomers = activeSubs.map((s: any) => ({
      email: s.customer?.email ?? s.customer_email ?? '',
      name:  s.customer?.name  ?? '',
      plan:  s.product_id === process.env.DODO_STARTER_PRODUCT_ID ? 'STARTER' : 'GROWTH',
      subscriptionId: s.subscription_id ?? s.id ?? '',
      createdAt: s.created_at ?? '',
    })).filter((c: any) => c.email)

    const recentPayments = paymentList
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map((p: any) => ({
        id: p.payment_id ?? p.id,
        amount: p.total_amount ?? p.amount ?? 0,
        currency: p.currency,
        status: p.status,
        email: p.customer?.email ?? p.customer_email ?? '',
        createdAt: p.created_at,
      }))

    return {
      totalRevenue,
      activeSubCount: activeSubs.length,
      recentPayments,
      totalPayments: paymentList.length,
      paidCustomers,
    }
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
