import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ProductsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const products = await prisma.product.findMany({
    where: { userId, isActive: true },
    include: {
      subreddits: { where: { isActive: true } },
      _count: { select: { opportunities: { where: { status: 'QUEUED' } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product profiles and subreddit watchlists.</p>
        </div>
        <Link href="/products/new">
          <Button>Add product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-400 text-sm mb-4">No products yet. Add your first product to start finding Reddit leads.</p>
            <Link href="/products/new">
              <Button>Add your first product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products.map(product => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-900">{product.name}</h2>
                        {product._count.opportunities > 0 && (
                          <Badge variant="yellow">{product._count.opportunities} queued</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{product.url}</p>
                    </div>
                    <div className="ml-6 text-right shrink-0">
                      <p className="text-sm font-medium text-gray-700">{product.subreddits.length} subreddits</p>
                      <p className="text-xs text-gray-400 mt-0.5">watching</p>
                    </div>
                  </div>
                  {product.subreddits.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {product.subreddits.slice(0, 6).map(sub => (
                        <Badge key={sub.id} variant="default">r/{sub.name}</Badge>
                      ))}
                      {product.subreddits.length > 6 && (
                        <Badge variant="default">+{product.subreddits.length - 6} more</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
