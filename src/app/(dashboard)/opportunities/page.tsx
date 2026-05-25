import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OpportunityQueue } from '@/components/opportunities/OpportunityQueue'
import { PAIN_TYPE_LABELS } from '@/types'

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: { painType?: string; page?: string }
}) {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const page = parseInt(searchParams.page || '1')
  const painType = searchParams.painType || undefined
  const take = 20

  const where: any = {
    product: { userId },
    status: 'QUEUED',
    ...(painType && { painType }),
  }

  const [opportunities, total, counts] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      orderBy: { intentScore: 'desc' },
      skip: (page - 1) * take,
      take,
      include: {
        subreddit: { select: { name: true } },
        replies: { where: { isActive: true }, take: 1 },
        product: { select: { id: true, name: true } },
      },
    }),
    prisma.opportunity.count({ where }),
    // Count per pain type
    prisma.opportunity.groupBy({
      by: ['painType'],
      where: { product: { userId }, status: 'QUEUED' },
      _count: true,
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Opportunity queue</h1>
        <p className="text-gray-500 mt-1">
          {total > 0
            ? `${total} threads ready for review, sorted by intent score.`
            : 'No opportunities in queue. Subreddits are scanned every 30 minutes.'}
        </p>
      </div>

      <OpportunityQueue
        opportunities={opportunities as any}
        total={total}
        page={page}
        pages={Math.ceil(total / take)}
        counts={counts}
        currentPainType={painType}
      />
    </div>
  )
}
