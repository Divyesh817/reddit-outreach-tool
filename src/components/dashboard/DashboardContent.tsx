'use client'

import Link from 'next/link'
import { useT } from '@/lib/i18n'
import { S } from '@/lib/theme'
import { ProductLogo } from '@/components/ui/ProductLogo'

type Opp = {
  id: string
  redditPostTitle: string
  intentScore: number
  painType: string
  redditPostedAt: string // ISO string from server
  subreddit: { name: string }
  product: { name: string }
}

type Sub = { name: string; _count: { opportunities: number } }
type PainRow = { painType: string; _count: { id: number } }
type Product = { id: string; name: string; logoUrl?: string | null }

interface Props {
  firstName: string
  hour: number
  queued: number
  posted: number
  weekOpps: number
  avg: number
  hasProduct: boolean
  products: Product[]
  recentOpps: Opp[]
  topSubreddits: Sub[]
  painBreakdown: PainRow[]
}

function timeAgo(isoDate: string) {
  const h = Math.floor((Date.now() - new Date(isoDate).getTime()) / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function DashboardContent({
  firstName, hour, queued, posted, weekOpps, avg,
  hasProduct, products, recentOpps, topSubreddits, painBreakdown,
}: Props) {
  const t = useT()
  const td = t.dashboard

  const greeting = hour < 12 ? td.greetings.morning : hour < 17 ? td.greetings.afternoon : td.greetings.evening

  const painColors: Record<string, { color: string; bg: string }> = {
    workflow_pain:          { color: S.purple,  bg: S.purpleSoft },
    competitor_frustration: { color: S.red,     bg: S.redSoft },
    switching_intent:       { color: S.orange2, bg: S.orangeSoft },
    active_tool_search:     { color: S.blue,    bg: S.blueSoft },
    roi_frustration:        { color: S.amber,   bg: S.amberSoft },
  }

  const statCards = [
    {
      label: td.stats.inbox,
      value: queued,
      sub: td.stats.leadsToReview,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>,
      color: S.orange, soft: S.orangeSoft, line: S.orangeLine, href: '/opportunities',
    },
    {
      label: td.stats.thisWeek,
      value: weekOpps,
      sub: td.stats.newLeads,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
      color: S.blue, soft: S.blueSoft, line: `${S.blue}33`, href: null,
    },
    {
      label: td.stats.avgIntent,
      value: avg > 0 ? `${avg}%` : '—',
      sub: td.stats.weekScore,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>,
      color: S.purple, soft: S.purpleSoft, line: `${S.purple}33`, href: null,
    },
    {
      label: td.stats.replied,
      value: posted,
      sub: td.stats.allTimePosts,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>,
      color: S.green, soft: S.greenSoft, line: S.greenLine, href: null,
    },
  ]

  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: 1100, width: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: S.text, margin: 0, letterSpacing: '-.02em' }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ fontSize: 15, color: S.text3, marginTop: 5, margin: '5px 0 0' }}>
            {hasProduct
              ? `${td.watchingProducts(products.length)} · ${td.leadsWaiting(queued)}`
              : td.setupFirst}
          </p>
        </div>
        <Link href="/opportunities" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
          borderRadius: 9, fontSize: 15, fontWeight: 600, textDecoration: 'none',
          background: `linear-gradient(135deg, ${S.orange} 0%, #E54B1B 100%)`,
          color: '#fff', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.2), 0 4px 14px rgba(255,87,34,.3)',
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/>
          </svg>
          {td.reviewInbox}
        </Link>
      </div>

      {/* No product nudge */}
      {!hasProduct && (
        <div style={{
          background: S.panel, borderRadius: 14, border: `1px solid ${S.orangeLine}`,
          padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 18, marginBottom: 32,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: S.orangeSoft,
            border: `1px solid ${S.orangeLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={S.orange} strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: S.text, margin: '0 0 3px' }}>{td.noProductTitle}</p>
            <p style={{ fontSize: 14, color: S.text3, margin: 0 }}>{td.noProductDesc}</p>
          </div>
          <Link href="/onboarding" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 20px',
            borderRadius: 9, fontSize: 15, fontWeight: 600, background: S.orange,
            color: '#fff', textDecoration: 'none', flexShrink: 0,
          }}>
            {td.noProductCta}
          </Link>
        </div>
      )}

      {/* Stat cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {statCards.map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Main two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 18, alignItems: 'start' }}>

        {/* Left: Recent leads */}
        <div style={{ background: S.panel, border: `1px solid ${S.line2}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 22px', borderBottom: `1px solid ${S.line}`,
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: S.text }}>{td.topLeads}</span>
            <Link href="/opportunities" style={{ fontSize: 13, color: S.orange2, textDecoration: 'none', fontWeight: 600 }}>
              {td.seeAll}
            </Link>
          </div>
          {recentOpps.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: S.text4, fontSize: 14 }}>
              {td.noLeads}
            </div>
          ) : (
            recentOpps.map((opp, i) => {
              const painLabel = (td.painLabels as Record<string, string>)[opp.painType] ?? opp.painType
              const painStyle = painColors[opp.painType] ?? { color: S.text3, bg: S.card }
              return (
                <Link key={opp.id} href="/opportunities" style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px',
                    borderBottom: i < recentOpps.length - 1 ? `1px solid ${S.line}` : 'none',
                  }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                      background: opp.intentScore >= 75 ? S.orangeSoft : S.card,
                      border: `1px solid ${opp.intentScore >= 75 ? S.orangeLine : S.line}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: opp.intentScore >= 75 ? S.orange2 : S.text2, lineHeight: 1 }}>
                        {opp.intentScore}
                      </span>
                      <span style={{ fontSize: 9, color: S.text4, fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>INT</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: '0 0 5px', fontSize: 14, fontWeight: 600, color: S.text,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {opp.redditPostTitle}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                          color: painStyle.color, background: painStyle.bg,
                        }}>
                          {painLabel}
                        </span>
                        <span style={{ fontSize: 12, color: S.text3, fontFamily: 'JetBrains Mono, monospace' }}>
                          r/{opp.subreddit.name}
                        </span>
                        {products.length > 1 && (
                          <span style={{ fontSize: 12, color: S.text4 }}>{opp.product.name}</span>
                        )}
                        <span style={{ fontSize: 12, color: S.text4, marginLeft: 'auto' }}>
                          {timeAgo(opp.redditPostedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Products */}
          <div style={{ background: S.panel, border: `1px solid ${S.line2}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: `1px solid ${S.line}`,
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: S.text }}>{td.products}</span>
              <Link href="/products" style={{ fontSize: 13, color: S.orange2, textDecoration: 'none', fontWeight: 600 }}>{td.manage}</Link>
            </div>
            {products.length === 0 ? (
              <div style={{ padding: '20px 18px', textAlign: 'center' }}>
                <Link href="/onboarding" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600,
                  color: S.orange2, textDecoration: 'none', padding: '8px 14px',
                  background: S.orangeSoft, border: `1px solid ${S.orangeLine}`, borderRadius: 7,
                }}>
                  {td.addFirstProduct}
                </Link>
              </div>
            ) : (
              products.map((p, i) => (
                <Link key={p.id} href="/products" style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
                    borderBottom: i < products.length - 1 ? `1px solid ${S.line}` : 'none',
                  }}>
                    <ProductLogo name={p.name} logoUrl={p.logoUrl ?? null} size={34} radius={9} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: S.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.text4} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Top subreddits */}
          {topSubreddits.length > 0 && (
            <div style={{ background: S.panel, border: `1px solid ${S.line2}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${S.line}` }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: S.text }}>{td.topSubreddits}</span>
              </div>
              {topSubreddits.map((sub, i) => {
                const max = topSubreddits[0]._count.opportunities || 1
                const pct = Math.round((sub._count.opportunities / max) * 100)
                return (
                  <div key={sub.name} style={{
                    padding: '11px 18px', borderBottom: i < topSubreddits.length - 1 ? `1px solid ${S.line}` : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: S.text2 }}>r/{sub.name}</span>
                      <span style={{ fontSize: 12, color: S.text4, fontFamily: 'JetBrains Mono, monospace' }}>
                        {sub._count.opportunities} {td.leads}
                      </span>
                    </div>
                    <div style={{ height: 4, background: S.line, borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 999, width: `${pct}%`,
                        background: `linear-gradient(90deg, ${S.orange2}, ${S.orange})`,
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pain type breakdown */}
          {painBreakdown.length > 0 && (
            <div style={{ background: S.panel, border: `1px solid ${S.line2}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${S.line}` }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: S.text }}>{td.painSignals}</span>
              </div>
              <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {painBreakdown.map(pt => {
                  const label = (td.painLabels as Record<string, string>)[pt.painType] ?? pt.painType
                  const style = painColors[pt.painType] ?? { color: S.text3, bg: S.card }
                  const total = painBreakdown.reduce((s, p) => s + p._count.id, 0)
                  const pct = Math.round((pt._count.id / total) * 100)
                  return (
                    <div key={pt.painType}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: style.color }}>{label}</span>
                        <span style={{ fontSize: 12, color: S.text4, fontFamily: 'JetBrains Mono, monospace' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 5, background: S.line, borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 999, width: `${pct}%`, background: style.color, opacity: 0.7 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon, color, soft, line, href }: {
  label: string; value: number | string; sub: string
  icon: React.ReactNode; color: string; soft: string; line: string; href: string | null
}) {
  const inner = (
    <div style={{
      background: S.panel, border: `1px solid ${S.line2}`, borderRadius: 14,
      padding: '18px 20px', cursor: href ? 'pointer' : 'default',
      transition: 'border-color .15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: S.text3, letterSpacing: '.03em' }}>{label}</span>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: soft,
          border: `1px solid ${line}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color, letterSpacing: '-.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: S.text4, marginTop: 5 }}>{sub}</div>
    </div>
  )
  if (href) return <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>
  return inner
}
