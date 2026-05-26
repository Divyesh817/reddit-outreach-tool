import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { GeoView } from '@/components/geo/GeoView'

// Plan → max products for GEO analysis
const PLAN_LIMITS: Record<string, number> = {
  FREE: 1,
  STARTER: 3,
  GROWTH: 5,
}

export default async function GeoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [dbUser, products] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true },
    }),
    prisma.product.findMany({
      where: { userId: user.id, isActive: true },
      select: { id: true, name: true, url: true, description: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const plan = dbUser?.plan ?? 'FREE'
  const limit = PLAN_LIMITS[plan] ?? 1

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <GeoView products={products} plan={plan} limit={limit} />
    </div>
  )
}
