import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ProductsContent } from '@/components/products/ProductsContent'

export default async function ProductsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [products, dbUser] = await Promise.all([
    prisma.product.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        subreddits: { where: { isActive: true }, select: { id: true, name: true } },
        _count: {
          select: {
            opportunities: true,
            subreddits: { where: { isActive: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findUnique({ where: { id: user.id }, select: { plan: true } }),
  ])

  const plan = dbUser?.plan ?? 'FREE'
  const PRODUCT_LIMITS: Record<string, number> = { FREE: 1, STARTER: 3, GROWTH: 5 }
  const productLimit = PRODUCT_LIMITS[plan] ?? 1
  const atLimit = products.length >= productLimit

  const totalSubreddits = products.reduce((sum, p) => sum + p._count.subreddits, 0)
  const totalOpportunities = products.reduce((sum, p) => sum + p._count.opportunities, 0)

  return (
    <ProductsContent
      products={products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        url: p.url,
        subreddits: p.subreddits,
        counts: { subreddits: p._count.subreddits, opportunities: p._count.opportunities },
      }))}
      plan={plan}
      productLimit={productLimit}
      atLimit={atLimit}
      totalSubreddits={totalSubreddits}
      totalOpportunities={totalOpportunities}
    />
  )
}
