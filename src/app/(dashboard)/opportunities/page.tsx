import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { InboxView } from '@/components/opportunities/InboxView'

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string; product?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const userId = user.id
  const initialStatus = (searchParams.status || 'QUEUED') as string
  const activeProductId = searchParams.product

  const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } })
  const plan = dbUser?.plan ?? 'FREE'

  const oppWhere = activeProductId
    ? { productId: activeProductId, product: { userId } }
    : { product: { userId } }

  const [products, allOpportunities] = await Promise.all([
    prisma.product.findMany({
      where: activeProductId
        ? { id: activeProductId, userId, isActive: true }
        : { userId, isActive: true },
      select: { id: true, name: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.opportunity.findMany({
      where: {
        ...oppWhere,
        redditPostedAt: { gte: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { intentScore: 'desc' },
      take: 200,
      include: {
        subreddit: { select: { name: true, allowsPromotion: true, rulesScannedAt: true } },
        replies: {
          where: { isActive: true },
          take: 1,
          orderBy: { version: 'desc' },
        },
        product: { select: { id: true, name: true } },
      },
      // include competitorMentioned in the select (it's on the model root)
    }),
  ])

  const counts = {
    queued:  allOpportunities.filter(o => o.status === 'QUEUED' || o.status === 'NO_PITCH').length,
    posted:  allOpportunities.filter(o => o.status === 'POSTED').length,
    skipped: allOpportunities.filter(o => o.status === 'SKIPPED').length,
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <InboxView
        opportunities={allOpportunities as any}
        initialStatus={initialStatus}
        productName={products[0]?.name ?? 'Your product'}
        products={products}
        counts={counts}
        plan={plan}
        activeProductId={activeProductId}
      />
    </div>
  )
}
