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
  const status = searchParams.status || 'QUEUED'
  const take = 50

  const product = await prisma.product.findFirst({
    where: { userId, isActive: true },
    select: { id: true, name: true },
    orderBy: { createdAt: 'asc' },
  })

  const where: any = {
    product: { userId },
    status,
  }

  const [opportunities, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      orderBy: { intentScore: 'desc' },
      take,
      include: {
        subreddit: { select: { name: true } },
        replies: {
          where: { isActive: true },
          take: 1,
          orderBy: { version: 'desc' },
        },
        product: { select: { id: true, name: true } },
      },
    }),
    prisma.opportunity.count({ where }),
  ])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <InboxView
        opportunities={opportunities as any}
        total={total}
        currentStatus={status}
        productName={product?.name ?? 'Your product'}
      />
    </div>
  )
}
