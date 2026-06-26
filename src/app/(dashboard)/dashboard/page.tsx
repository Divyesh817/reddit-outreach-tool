import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

async function getDashboardData(userId: string, productId?: string) {
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)

  // When a specific product is selected, scope all queries to it
  const oppWhere = productId
    ? { productId, product: { userId } }
    : { product: { userId } }
  const subWhere = productId
    ? { productId, product: { userId } }
    : { product: { userId } }

  const [
    queued, posted, weekOpps,
    products, recentOpps, topSubreddits, painBreakdown, avgIntent,
  ] = await Promise.all([
    prisma.opportunity.count({ where: { ...oppWhere, status: 'QUEUED' } }),
    prisma.postedReply.count({ where: { opportunity: { ...oppWhere } } }),
    prisma.opportunity.count({ where: { ...oppWhere, createdAt: { gte: weekAgo } } }),
    prisma.product.findMany({ where: productId ? { id: productId, userId, isActive: true } : { userId, isActive: true }, select: { id: true, name: true }, orderBy: { createdAt: 'asc' } }),
    prisma.opportunity.findMany({
      where: { ...oppWhere, status: 'QUEUED' },
      orderBy: { intentScore: 'desc' },
      take: 6,
      select: {
        id: true, redditPostTitle: true, intentScore: true,
        painType: true, redditPostedAt: true,
        subreddit: { select: { name: true } },
        product: { select: { name: true } },
      },
    }),
    prisma.subreddit.findMany({
      where: subWhere,
      orderBy: { opportunities: { _count: 'desc' } },
      take: 4,
      select: { name: true, _count: { select: { opportunities: true } } },
    }),
    prisma.opportunity.groupBy({
      by: ['painType'],
      where: oppWhere,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    prisma.opportunity.aggregate({
      where: { ...oppWhere, createdAt: { gte: weekAgo } },
      _avg: { intentScore: true },
    }),
  ])

  return { queued, posted, weekOpps, products, recentOpps, topSubreddits, painBreakdown, avgIntent }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { payment?: string; plan?: string; product?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const userId = user.id

  if (searchParams.payment === 'success' && searchParams.plan) {
    const plan = searchParams.plan.toUpperCase()
    if (plan === 'STARTER' || plan === 'GROWTH') {
      await prisma.user.update({ where: { id: userId }, data: { plan } }).catch(() => {})
    }
    redirect('/dashboard')
  }

  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'
  const { queued, posted, weekOpps, products, recentOpps, topSubreddits, painBreakdown, avgIntent } = await getDashboardData(userId, searchParams.product)
  const hour = new Date().getHours()
  const avg = Math.round(avgIntent._avg.intentScore ?? 0)
  const hasProduct = products.length > 0

  return (
    <DashboardContent
      firstName={firstName}
      hour={hour}
      queued={queued}
      posted={posted}
      weekOpps={weekOpps}
      avg={avg}
      hasProduct={hasProduct}
      products={products.map(p => ({ id: p.id, name: p.name, logoUrl: (p as any).logoUrl ?? null }))}
      recentOpps={recentOpps.map(o => ({ ...o, redditPostedAt: new Date(o.redditPostedAt).toISOString() }))}
      topSubreddits={topSubreddits}
      painBreakdown={painBreakdown}
    />
  )
}
