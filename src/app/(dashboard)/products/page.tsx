import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ProductCard } from '@/components/products/ProductCard'
import { S } from '@/lib/theme'



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
  const upgradeTarget = plan === 'FREE' ? 'Starter' : 'Growth'

  // Upgrade message copy per plan
  const upgradeMsg = plan === 'FREE'
    ? 'Upgrade to Starter to track up to 3 products.'
    : 'Upgrade to Growth to track up to 5 products.'

  // Aggregate stats
  const totalSubreddits = products.reduce((sum, p) => sum + p._count.subreddits, 0)
  const totalOpportunities = products.reduce((sum, p) => sum + p._count.opportunities, 0)

  const statsStrip = [
    { label: 'Products', value: products.length, max: productLimit },
    { label: 'Subreddits watched', value: totalSubreddits, delta: null },
    { label: 'Threads found', value: totalOpportunities, delta: null },
    { label: 'Replies copied', value: 0, delta: null },
  ]

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 25, fontWeight: 700, color: S.text, margin: 0, letterSpacing: '-.02em' }}>
            Products
          </h1>
          <p style={{ fontSize: 18, color: S.text3, margin: '4px 0 0', lineHeight: 1.5 }}>
            Manage your product profiles and subreddit watchlists.
          </p>
        </div>
        {(!atLimit || products.length === 0) && (
          <Link
            href="/onboarding"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 8, fontSize: 16, fontWeight: 600,
              background: S.orange, color: '#fff', textDecoration: 'none',
              transition: 'opacity .15s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1v10M1 6h10"/></svg>
            Add product
          </Link>
        )}
      </div>

      {/* Stats strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1,
        background: S.line, borderRadius: 12, overflow: 'hidden', marginBottom: 28,
        border: `1px solid ${S.line2}`,
      }}>
        {statsStrip.map((s, i) => (
          <div key={i} style={{ background: S.panel, padding: '18px 20px' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: S.text3, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'JetBrains Mono, monospace' }}>
              {s.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 29, fontWeight: 700, color: S.text, letterSpacing: '-.03em', lineHeight: 1 }}>
                {s.value}
              </span>
              {s.max && (
                <span style={{ fontSize: 15, color: S.text4, fontFamily: 'JetBrains Mono, monospace' }}>
                  / {s.max}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Product cards */}
      {products.length === 0 ? (
        <div style={{
          background: S.panel, borderRadius: 14, border: `1px solid ${S.line2}`,
          padding: '64px 32px', textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: S.orangeSoft,
            border: `1px solid ${S.orangeLine}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="3" width="14" height="14" rx="3" stroke={S.orange} strokeWidth="1.5"/>
              <path d="M10 7v6M7 10h6" stroke={S.orange} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{ fontSize: 18, fontWeight: 600, color: S.text, margin: '0 0 6px' }}>No products yet</p>
          <p style={{ fontSize: 16, color: S.text3, margin: '0 0 20px', lineHeight: 1.6 }}>
            Add your product to start finding high-intent Reddit threads.
          </p>
          <Link
            href="/onboarding"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 22px', borderRadius: 8, fontSize: 16, fontWeight: 600,
              background: S.orange, color: '#fff', textDecoration: 'none',
            }}
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              url={product.url}
              subreddits={product.subreddits}
              counts={{
                subreddits: product._count.subreddits,
                opportunities: product._count.opportunities,
              }}
            />
          ))}

          {/* Add-product slots up to plan limit */}
          {Array.from({ length: Math.max(0, productLimit - products.length) }).map((_, i) => (
            atLimit || plan !== 'FREE' ? (
              // Paid plan — show active add button
              <a key={`add-${i}`} href="/products/new" style={{
                background: S.panel, borderRadius: 14,
                border: `1.5px dashed ${S.line2}`,
                padding: '20px 24px', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 14,
                transition: 'border-color .15s',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: S.panel2,
                  border: `1px dashed ${S.line2}`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke={S.text3} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, color: S.text3, margin: 0 }}>Add product</p>
              </a>
            ) : (
              // Free plan — locked slot
              <div key={`locked-${i}`} style={{
                background: S.panel, borderRadius: 14,
                border: `1.5px dashed ${S.line3}`,
                padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 14, opacity: .65,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: S.panel2,
                  border: `1px dashed ${S.line3}`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="15" height="15" fill="none" stroke={S.text4} strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: S.text3, margin: '0 0 2px' }}>Add another product</p>
                  <p style={{ fontSize: 13.5, color: S.text4, margin: 0 }}>{upgradeMsg}</p>
                </div>
                <a href="/settings" style={{
                  fontSize: 12, fontWeight: 700, padding: '5px 11px', borderRadius: 6,
                  background: S.amberSoft, color: S.amber, textDecoration: 'none',
                  fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.04em',
                  border: `1px solid rgba(229,160,74,.3)`,
                }}>
                  UPGRADE
                </a>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}
