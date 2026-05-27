import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { SubredditList } from '@/components/products/SubredditList'
import { KeywordsTab } from '@/components/products/KeywordsTab'
import Link from 'next/link'
import { S } from '@/lib/theme'


function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span style={{
      fontSize: 14, fontWeight: 600, padding: '3px 9px', borderRadius: 6,
      background: accent ? S.orangeSoft : S.panel2,
      border: `1px solid ${accent ? S.orangeLine : S.line2}`,
      color: accent ? S.orange2 : S.text3,
    }}>
      {children}
    </span>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 13, fontWeight: 700, color: S.text4, margin: '0 0 6px',
      textTransform: 'uppercase', letterSpacing: '.06em',
      fontFamily: 'JetBrains Mono, monospace',
    }}>
      {children}
    </p>
  )
}

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
      <div style={{ background: S.panel, borderRadius: 14, border: `1px solid ${S.line2}`, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '14px 24px', borderBottom: `1px solid ${S.line}` }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: S.text3, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'JetBrains Mono, monospace' }}>
            Product Profile
          </p>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {product.description && (
            <div>
              <FieldLabel>Description</FieldLabel>
              <p style={{ fontSize: 16, color: S.text2, margin: 0, lineHeight: 1.6 }}>{product.description}</p>
            </div>
          )}

          {product.targetAudience && (
            <div>
              <FieldLabel>Target audience</FieldLabel>
              <p style={{ fontSize: 16, color: S.text2, margin: 0, lineHeight: 1.6 }}>{product.targetAudience}</p>
            </div>
          )}

          {product.keyBenefits.length > 0 && (
            <div>
              <FieldLabel>Key benefits</FieldLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {product.keyBenefits.map((b, i) => <Chip key={i} accent>{b}</Chip>)}
              </div>
            </div>
          )}

          {product.competitors.length > 0 && (
            <div>
              <FieldLabel>Competitors</FieldLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {product.competitors.map((c, i) => <Chip key={i}>{c}</Chip>)}
              </div>
            </div>
          )}

          {product.summary && (
            <div>
              <FieldLabel>AI summary</FieldLabel>
              <p style={{
                fontSize: 16, color: S.text3, margin: 0, lineHeight: 1.65,
                background: S.card, borderRadius: 8, padding: '12px 16px',
                border: `1px solid ${S.line}`,
              }}>
                {product.summary}
              </p>
            </div>
          )}
        </div>
      </div>

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
