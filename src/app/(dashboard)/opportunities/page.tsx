import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { InboxView } from '@/components/opportunities/InboxView'

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const userId = user.id
  const initialStatus = (searchParams.status || 'QUEUED') as string

  const [products, allOpportunities] = await Promise.all([
    prisma.product.findMany({
      where: { userId, isActive: true },
      select: { id: true, name: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.opportunity.findMany({
      where: {
        product: { userId },
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
    }),
  ])

  const counts = {
    queued:   allOpportunities.filter(o => o.status === 'QUEUED').length,
    posted:   allOpportunities.filter(o => o.status === 'POSTED').length,
    skipped:  allOpportunities.filter(o => o.status === 'SKIPPED').length,
    noPitch:  allOpportunities.filter(o => o.status === 'NO_PITCH').length,
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <InboxView
        opportunities={allOpportunities as any}
        initialStatus={initialStatus}
        productName={products[0]?.name ?? 'Your product'}
        products={products}
        counts={counts}
      />
    </div>
  )
}
