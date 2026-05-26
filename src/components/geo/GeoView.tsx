'use client'

import { useState, useCallback } from 'react'
import { S } from '@/lib/theme'

const GEO_CSS = `
  @keyframes geo-spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
  .geo-spin { animation: geo-spin 1s linear infinite }
  .geo-scroll::-webkit-scrollbar { width:6px }
  .geo-scroll::-webkit-scrollbar-thumb { background:var(--c-line3); border-radius:999px }
  .geo-accordion:hover { background: var(--c-card-hover) !important }
  .geo-row:hover { background: var(--c-card-hover) !important }
`

interface Product { id: string; name: string; url: string; description: string }

interface GeoAnalysis {
  geoScore: number
  summary: string
  dimensions: Record<string, { score: number; label: string; insight: string }>
  redditStrategy: { subreddit: string; reason: string; action: string }[]
  contentIdeas: { title: string; subreddit: string; type: string; why: string }[]
  competitorComparison: { name: string; estimatedGeoScore: number; gap: string }[]
  quickWins: string[]
}

interface GeoReport {
  id: string
  geoScore: number
  weekOf: string
  createdAt: string
  analysis: GeoAnalysis
}

interface Props { products: Product[]; plan: string; limit: number }

const PLAN_LABELS: Record<string, string> = { FREE: 'Free', STARTER: 'Starter', GROWTH: 'Growth' }

function scoreColor(s: number) { return s >= 75 ? S.green : s >= 50 ? S.amber : S.red }
function scoreBg(s: number)    { return s >= 75 ? S.greenSoft : s >= 50 ? S.amberSoft : S.redSoft }

function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size / 2) - 6
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const fs = size > 60 ? 20 : 14
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--c-line2)" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={scoreColor(score)} strokeWidth="5"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray .6s ease' }} />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill={scoreColor(score)} fontSize={fs} fontWeight="700" fontFamily="JetBrains Mono, monospace">
        {score}
      </text>
    </svg>
  )
}

function DimBar({ label, score, insight }: { label: string; score: number; insight: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, color: S.text2, fontWeight: 600 }}>{label}</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: scoreColor(score) }}>{score}</span>
      </div>
      <div style={{ height: 6, background: S.line, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: scoreColor(score), borderRadius: 999, transition: 'width .5s ease' }} />
      </div>
      <span style={{ fontSize: 13.5, color: S.text3, lineHeight: 1.5 }}>{insight}</span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: S.text3, fontWeight: 600 }}>
      <span>{children}</span>
      <span style={{ flex: 1, height: 1, background: S.line }} />
    </div>
  )
}

function ScoreTrend({ reports }: { reports: GeoReport[] }) {
  if (reports.length < 2) return null
  // Show last 8 in chronological order
  const sorted = [...reports].reverse().slice(-8)
  const max = 100
  const h = 48
  const w = 220

  const points = sorted.map((r, i) => {
    const x = (i / (sorted.length - 1)) * (w - 16) + 8
    const y = h - (r.geoScore / max) * (h - 8) - 4
    return { x, y, score: r.geoScore, date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const latest = points[points.length - 1]
  const prev = points[points.length - 2]
  const delta = latest.score - prev.score
  const deltaColor = delta > 0 ? S.green : delta < 0 ? S.red : S.text3

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: S.card, borderRadius: 10, border: `1px solid ${S.line}` }}>
      <svg width={w} height={h} style={{ flexShrink: 0 }}>
        <defs>
          <linearGradient id="trend-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={scoreColor(sorted[0].geoScore)} stopOpacity=".4" />
            <stop offset="100%" stopColor={scoreColor(latest.score)} />
          </linearGradient>
        </defs>
        <path d={pathD} fill="none" stroke="url(#trend-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5} fill={scoreColor(p.score)} opacity={i === points.length - 1 ? 1 : 0.5} />
        ))}
      </svg>
      <div>
        <div style={{ fontSize: 13, color: S.text3, marginBottom: 3 }}>Score trend · {sorted.length} reports</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: deltaColor }}>
          {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '—'} vs prev
        </div>
      </div>
    </div>
  )
}

function ReportHistory({ reports, currentId, onSelect }: { reports: GeoReport[]; currentId: string; onSelect: (r: GeoReport) => void }) {
  if (reports.length <= 1) return null
  return (
    <div>
      <SectionLabel>Report history</SectionLabel>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {reports.map(r => (
          <button key={r.id} onClick={() => onSelect(r)} style={{
            padding: '6px 12px', borderRadius: 8, border: `1px solid ${r.id === currentId ? S.orangeLine : S.line}`,
            background: r.id === currentId ? S.orangeSoft : S.card,
            color: r.id === currentId ? S.orange2 : S.text3,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', transition: 'all .15s',
          }}>
            {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' · '}
            <span style={{ color: scoreColor(r.geoScore) }}>{r.geoScore}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function GeoView({ products, plan, limit }: Props) {
  const [open, setOpen] = useState<string | null>(null)
  // per-product report history
  const [histories, setHistories] = useState<Record<string, GeoReport[]>>({})
  // per-product currently displayed report
  const [displayed, setDisplayed] = useState<Record<string, GeoReport>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [emailState, setEmailState] = useState<Record<string, 'idle' | 'sending' | 'sent' | 'error'>>({})

  const visibleProducts = products.slice(0, limit)
  const lockedCount = Math.max(0, products.length - limit)

  const loadHistory = useCallback(async (productId: string) => {
    try {
      const res = await fetch(`/api/geo/reports?productId=${productId}`)
      const json = await res.json()
      if (res.ok && json.data?.length > 0) {
        setHistories(h => ({ ...h, [productId]: json.data }))
        // Show the most recent report immediately
        setDisplayed(d => ({ ...d, [productId]: json.data[0] }))
        return true
      }
    } catch {}
    return false
  }, [])

  async function runAnalysis(productId: string) {
    if (loading) return
    setLoading(productId)
    setErrors(e => ({ ...e, [productId]: '' }))
    try {
      const res = await fetch('/api/geo/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`)
      // Reload history to include the new report
      await loadHistory(productId)
    } catch (e: any) {
      setErrors(e2 => ({ ...e2, [productId]: e?.message || 'Analysis failed — try again' }))
    }
    setLoading(null)
  }

  async function sendEmail(productId: string, reportId?: string) {
    setEmailState(s => ({ ...s, [productId]: 'sending' }))
    try {
      const res = await fetch('/api/geo/send-report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, reportId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setEmailState(s => ({ ...s, [productId]: 'sent' }))
      setTimeout(() => setEmailState(s => ({ ...s, [productId]: 'idle' })), 3000)
    } catch {
      setEmailState(s => ({ ...s, [productId]: 'error' }))
      setTimeout(() => setEmailState(s => ({ ...s, [productId]: 'idle' })), 3000)
    }
  }

  async function toggleAccordion(productId: string) {
    const next = open === productId ? null : productId
    setOpen(next)
    if (next && !histories[next]) {
      const hasHistory = await loadHistory(next)
      // If no history at all, auto-run first analysis
      if (!hasHistory) runAnalysis(next)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GEO_CSS }} />
      <div className="geo-scroll" style={{ flex: 1, overflowY: 'auto', background: S.bg }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 32px 80px' }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: S.text, letterSpacing: '-.02em' }}>
                  GEO — Generative Engine Optimization
                </h1>
                <p style={{ margin: 0, fontSize: 16, color: S.text3, lineHeight: 1.6, maxWidth: 560 }}>
                  Discover how well your product surfaces in AI-generated answers. Track score trends over time and email reports to your team.
                </p>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: S.orangeSoft, border: `1px solid ${S.orangeLine}`, fontSize: 13, fontWeight: 600, color: S.orange2, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.04em', flexShrink: 0 }}>
                {PLAN_LABELS[plan] ?? plan} · {limit} product{limit !== 1 ? 's' : ''}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
              {[
                { icon: '🧠', label: 'GEO Score' },
                { icon: '📈', label: 'Score trends' },
                { icon: '📊', label: 'Competitor gap' },
                { icon: '🎯', label: 'Reddit strategy' },
                { icon: '✍️', label: 'Content ideas' },
                { icon: '📧', label: 'Email report' },
              ].map(p => (
                <span key={p.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 8, background: S.card, border: `1px solid ${S.line}`, fontSize: 14, color: S.text2, fontWeight: 500 }}>
                  {p.icon} {p.label}
                </span>
              ))}
            </div>
          </div>

          {/* Accordions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visibleProducts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '64px 24px', background: S.card, borderRadius: 16, border: `1px solid ${S.line}` }}>
                <p style={{ fontSize: 17, color: S.text3, margin: '0 0 8px', fontWeight: 600 }}>No products yet</p>
                <p style={{ fontSize: 15, color: S.text4, margin: 0 }}>Add a product first to run GEO analysis.</p>
              </div>
            )}

            {visibleProducts.map(product => {
              const isOpen = open === product.id
              const reports = histories[product.id] ?? []
              const report = displayed[product.id]
              const analysis = report?.analysis
              const isLoading = loading === product.id
              const error = errors[product.id]
              const eState = emailState[product.id] ?? 'idle'

              return (
                <div key={product.id} style={{ background: S.panel, border: `1px solid ${isOpen ? S.orangeLine : S.line}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color .15s' }}>

                  {/* Accordion trigger */}
                  <button className="geo-accordion" onClick={() => toggleAccordion(product.id)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', background: S.panel, border: 'none',
                    cursor: 'pointer', textAlign: 'left', transition: 'background .15s',
                  }}>
                    <span style={{
                      width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                      background: 'linear-gradient(135deg, #FFA070, #E54B1B)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 17, fontWeight: 700, color: '#fff',
                    }}>
                      {product.name[0]?.toUpperCase() ?? '?'}
                    </span>
                    <span style={{ flex: 1, fontSize: 17, fontWeight: 600, color: S.text, letterSpacing: '-.01em' }}>
                      {product.name}
                    </span>
                    {analysis && (
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: scoreBg(analysis.geoScore), color: scoreColor(analysis.geoScore) }}>
                        GEO {analysis.geoScore}
                      </span>
                    )}
                    {reports.length > 1 && (
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: S.text4, padding: '3px 8px', borderRadius: 5, background: S.card, border: `1px solid ${S.line}` }}>
                        {reports.length} reports
                      </span>
                    )}
                    {isLoading && (
                      <svg className="geo-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.orange2} strokeWidth="2" style={{ flexShrink: 0 }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.text3} strokeWidth="2"
                      style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {/* Expanded body */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${S.line}` }}>
                      {isLoading && (
                        <div style={{ padding: '56px 24px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: S.text3, fontSize: 15 }}>
                            <svg className="geo-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={S.orange2} strokeWidth="2">
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                            </svg>
                            Running GEO analysis with Claude…
                          </div>
                        </div>
                      )}

                      {error && (
                        <div style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ color: S.red, fontSize: 15 }}>{error}</span>
                          <button onClick={() => runAnalysis(product.id)} style={{ fontSize: 14, color: S.orange2, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>Retry</button>
                        </div>
                      )}

                      {analysis && !isLoading && (
                        <div style={{ padding: '28px 24px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>

                          {/* Action bar */}
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                            <button onClick={() => runAnalysis(product.id)} disabled={!!isLoading} style={{
                              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px',
                              borderRadius: 8, background: S.card, border: `1px solid ${S.line}`,
                              fontSize: 14, fontWeight: 600, color: S.text2, cursor: 'pointer',
                              opacity: isLoading ? .5 : 1,
                            }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                              Re-analyze
                            </button>
                            <button
                              onClick={() => sendEmail(product.id, report.id)}
                              disabled={eState === 'sending'}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px',
                                borderRadius: 8,
                                background: eState === 'sent' ? S.greenSoft : eState === 'error' ? S.redSoft : S.orangeSoft,
                                border: `1px solid ${eState === 'sent' ? S.green : eState === 'error' ? S.red : S.orangeLine}`,
                                fontSize: 14, fontWeight: 600,
                                color: eState === 'sent' ? S.green : eState === 'error' ? S.red : S.orange2,
                                cursor: eState === 'sending' ? 'not-allowed' : 'pointer',
                                opacity: eState === 'sending' ? .6 : 1,
                              }}
                            >
                              {eState === 'sending' ? (
                                <svg className="geo-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                              ) : (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                              )}
                              {eState === 'sent' ? 'Sent!' : eState === 'error' ? 'Failed' : 'Email report'}
                            </button>
                            <span style={{ fontSize: 13, color: S.text4, marginLeft: 4 }}>
                              {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>

                          {/* Score trend */}
                          <ScoreTrend reports={reports} />

                          {/* Score + summary */}
                          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                            <ScoreRing score={analysis.geoScore} size={88} />
                            <div style={{ flex: 1, minWidth: 220 }}>
                              <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                                Overall GEO Score
                                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '2px 7px', borderRadius: 4, background: scoreBg(analysis.geoScore), color: scoreColor(analysis.geoScore), fontWeight: 700, letterSpacing: '.06em' }}>
                                  {analysis.geoScore >= 75 ? 'STRONG' : analysis.geoScore >= 50 ? 'MODERATE' : 'WEAK'}
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: 15, color: S.text2, lineHeight: 1.6 }}>{analysis.summary}</p>
                            </div>
                          </div>

                          {/* Report history selector */}
                          <ReportHistory reports={reports} currentId={report.id} onSelect={r => setDisplayed(d => ({ ...d, [product.id]: r }))} />

                          {/* Dimension bars */}
                          <div>
                            <SectionLabel>Performance breakdown</SectionLabel>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 22, marginTop: 16 }}>
                              {Object.values(analysis.dimensions).map(dim => (
                                <DimBar key={dim.label} label={dim.label} score={dim.score} insight={dim.insight} />
                              ))}
                            </div>
                          </div>

                          {/* Quick wins */}
                          {analysis.quickWins?.length > 0 && (
                            <div>
                              <SectionLabel>Quick wins</SectionLabel>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                                {analysis.quickWins.map((win, i) => (
                                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '13px 16px', background: S.card, borderRadius: 10, border: `1px solid ${S.line}` }}>
                                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: S.orangeSoft, color: S.orange2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                                      {i + 1}
                                    </span>
                                    <span style={{ fontSize: 15, color: S.text2, lineHeight: 1.55 }}>{win}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Reddit strategy */}
                          {analysis.redditStrategy?.length > 0 && (
                            <div>
                              <SectionLabel>Reddit strategy for GEO</SectionLabel>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                                {analysis.redditStrategy.map((s, i) => (
                                  <div key={i} className="geo-row" style={{ display: 'flex', gap: 16, padding: '14px 18px', background: S.card, borderRadius: 10, border: `1px solid ${S.line}`, transition: 'background .12s' }}>
                                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: S.orange2, flexShrink: 0, paddingTop: 2 }}>
                                      r/{s.subreddit}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                      <p style={{ margin: '0 0 5px', fontSize: 15, color: S.text, fontWeight: 500 }}>{s.reason}</p>
                                      <p style={{ margin: 0, fontSize: 14, color: S.text3, lineHeight: 1.5 }}>→ {s.action}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Content ideas */}
                          {analysis.contentIdeas?.length > 0 && (
                            <div>
                              <SectionLabel>Content ideas that improve AI visibility</SectionLabel>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                                {analysis.contentIdeas.map((idea, i) => (
                                  <div key={i} style={{ padding: '14px 18px', background: S.card, borderRadius: 10, border: `1px solid ${S.line}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '2px 7px', borderRadius: 4, background: S.purpleSoft, color: S.purple, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                        {idea.type}
                                      </span>
                                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: S.text3 }}>r/{idea.subreddit}</span>
                                    </div>
                                    <p style={{ margin: '0 0 6px', fontSize: 15, color: S.text, fontWeight: 600 }}>{idea.title}</p>
                                    <p style={{ margin: 0, fontSize: 14, color: S.text3, lineHeight: 1.5 }}>💡 {idea.why}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Competitor comparison */}
                          {analysis.competitorComparison?.length > 0 && (
                            <div>
                              <SectionLabel>Competitor GEO comparison</SectionLabel>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                                {analysis.competitorComparison.map((comp, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', background: S.card, borderRadius: 10, border: `1px solid ${S.line}` }}>
                                    <ScoreRing score={comp.estimatedGeoScore} size={52} />
                                    <div style={{ flex: 1 }}>
                                      <span style={{ fontSize: 16, fontWeight: 600, color: S.text }}>{comp.name}</span>
                                      <p style={{ margin: '4px 0 0', fontSize: 14, color: S.text3, lineHeight: 1.5 }}>{comp.gap}</p>
                                    </div>
                                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6, background: comp.estimatedGeoScore > analysis.geoScore ? S.redSoft : S.greenSoft, color: comp.estimatedGeoScore > analysis.geoScore ? S.red : S.green }}>
                                      {comp.estimatedGeoScore > analysis.geoScore ? `+${comp.estimatedGeoScore - analysis.geoScore} ahead` : `−${analysis.geoScore - comp.estimatedGeoScore} behind`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Products beyond plan limit — shown as locked */}
            {lockedCount > 0 && (
              <div style={{ background: S.panel, border: `1px solid ${S.line}`, borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ width: 38, height: 38, borderRadius: 9, background: S.line, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.text4} strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 3px', fontSize: 16, fontWeight: 600, color: S.text3 }}>
                    {lockedCount} product{lockedCount !== 1 ? 's' : ''} locked
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: S.text4 }}>
                    Upgrade to analyze more products.
                  </p>
                </div>
                <a href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 15px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: S.orangeSoft, border: `1px solid ${S.orangeLine}`, color: S.orange2, textDecoration: 'none' }}>
                  Upgrade
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
