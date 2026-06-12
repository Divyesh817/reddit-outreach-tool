import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { SubredditList } from '@/components/products/SubredditList'
import { KeywordsTab } from '@/components/products/KeywordsTab'
import { ProductProfileEditor } from '@/components/products/ProductProfileEditor'
import Link from 'next/link'
import { S } from '@/lib/theme'

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user!.id

  const product = await prisma.product.findFirst({
    where: { id: params.id, userId },
    include: {
      subreddits: { orderBy: { fitScore: 'desc' } },
      _count: { select: { opportunities: true } },
    },
  })

  if (!product) notFound()

  return (
    <div style={{ padding: '32px 40px', maxWidth: 840 }}>

      {/* Breadcrumb + header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 15 }}>
          <Link href="/products" style={{ color: S.text4, textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace' }}>
            Products
          </Link>
          <span style={{ color: S.text4 }}>/</span>
          <span style={{ color: S.text3, fontFamily: 'JetBrains Mono, monospace' }}>{product.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 23, fontWeight: 700, color: S.text, margin: 0, letterSpacing: '-.02em' }}>
              {product.name}
            </h1>
            <p style={{ fontSize: 15, color: S.text4, margin: '4px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
              {product.url}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              fontSize: 14, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
              background: S.greenSoft, color: S.green, border: `1px solid rgba(63,176,122,.3)`,
              fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: S.green, display: 'inline-block' }} />
              Live
            </span>
            <span style={{ fontSize: 14, color: S.text3, fontFamily: 'JetBrains Mono, monospace' }}>
              {product._count.opportunities} threads
            </span>
          </div>
        </div>
      </div>

      {/* Product profile */}
      <ProductProfileEditor
        productId={product.id}
        initial={{
          name: product.name,
          description: product.description ?? '',
          targetAudience: product.targetAudience ?? '',
          keyBenefits: product.keyBenefits,
          competitors: product.competitors,
          summary: product.summary ?? '',
        }}
      />

      {/* Keywords */}
      <KeywordsTab
        productId={product.id}
        initialKeywords={product.keywords}
      />

      {/* Subreddit watchlist */}
      <SubredditList
        productId={product.id}
        subreddits={product.subreddits}
      />
    </div>
  )
}
