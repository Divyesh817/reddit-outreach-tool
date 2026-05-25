import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubredditList } from '@/components/products/SubredditList'
import Link from 'next/link'

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const product = await prisma.product.findFirst({
    where: { id: params.id, userId },
    include: {
      subreddits: { orderBy: { fitScore: 'desc' } },
      _count: { select: { opportunities: true } },
    },
  })

  if (!product) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/products" className="hover:text-gray-700">Products</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-400 mt-1">{product.url}</p>
        </div>
      </div>

      {/* Profile summary */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Product profile</h2>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-700">{product.description}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Target audience</p>
            <p className="text-sm text-gray-700">{product.targetAudience}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Key benefits</p>
            <div className="flex flex-wrap gap-1.5">
              {product.keyBenefits.map((b, i) => <Badge key={i} variant="purple">{b}</Badge>)}
            </div>
          </div>
          {product.competitors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Competitors</p>
              <div className="flex flex-wrap gap-1.5">
                {product.competitors.map((c, i) => <Badge key={i}>{c}</Badge>)}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">AI summary</p>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{product.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Subreddit watchlist */}
      <SubredditList
        productId={product.id}
        subreddits={product.subreddits}
      />
    </div>
  )
}
