'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useT } from '@/lib/i18n'
import './onboarding.css'

type Step = '1' | '1b' | '2' | '3' | '4' | '4b'
type CheckState = 'pending' | 'active' | 'done'

interface Checks {
  website: CheckState
  profile: CheckState
  subreddits: CheckState
  keywords: CheckState
}

interface ProductProfile {
  name: string
  description: string
  summary: string
  targetAudience: string
  keyBenefits: string[]
  competitors: string[]
}

interface DiscoveredSub {
  name: string
  fitScore: number
  fitReason: string
}

export default function OnboardingPage() {
  const t = useT()
  const to = t.onboarding

  const [step, setStep] = useState<Step>('1')
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState(false)

  const [checks, setChecks] = useState<Checks>({ website: 'pending', profile: 'pending', subreddits: 'pending', keywords: 'pending' })
  const [analyzeError, setAnalyzeError] = useState('')
  const [profile, setProfile] = useState<ProductProfile | null>(null)
  const [discoveredSubs, setDiscoveredSubs] = useState<DiscoveredSub[]>([])
  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set())
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([])

  const [keywords, setKeywords] = useState<string[]>([])
  const [kwInput, setKwInput] = useState('')

  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [scanLeadsFound, setScanLeadsFound] = useState(0)
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function setCheck(key: keyof Checks, val: CheckState) {
    setChecks(p => ({ ...p, [key]: val }))
  }
  function delay(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) }
  function normalizeUrl(u: string) { return u.startsWith('http') ? u : `https://${u}` }

  async function handleAnalyze() {
    const normalized = normalizeUrl(url)
    try { new URL(normalized) } catch { setUrlError(true); return }
    setUrlError(false)
    setAnalyzeError('')
    setStep('1b')
    setChecks({ website: 'active', profile: 'pending', subreddits: 'pending', keywords: 'pending' })

    let html = ''
    try {
      const r = await fetch('/api/products/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized }),
      })
      if (r.ok) {
        const data = await r.json()
        html = data.html || ''
      }
    } catch { /* non-fatal */ }
    setCheck('website', 'done')
    await delay(200)
    setCheck('profile', 'active')

    let fetchedProfile: ProductProfile | null = null
    let fetchedSubs: DiscoveredSub[] = []
    let fetchedKeywords: string[] = []
    try {
      const r = await fetch('/api/onboarding/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized, html }),
      })
      if (!r.ok) throw new Error('AI analysis failed')
      const data = await r.json()
      fetchedProfile = data.profile
      fetchedSubs = data.subreddits || []
      fetchedKeywords = data.keywords || []
    } catch (e: any) {
      setAnalyzeError(e.message || 'Analysis failed')
      return
    }

    setCheck('profile', 'done')
    await delay(350)
    setCheck('subreddits', 'active')
    await delay(700)
    setCheck('subreddits', 'done')
    await delay(300)
    setCheck('keywords', 'active')
    await delay(600)
    setCheck('keywords', 'done')
    await delay(400)

    const cleanSubs = fetchedSubs.map((s: any) => ({ ...s, name: s.name.replace(/^\/?r\//i, '') }))
    setProfile(fetchedProfile)
    setDiscoveredSubs(cleanSubs)
    setSelectedSubs(new Set(cleanSubs.map((s: any) => s.name)))
    setSuggestedKeywords(fetchedKeywords)
    setKeywords(fetchedKeywords.slice(0, 6))
    setStep('2')
  }

  function toggleSub(name: string) {
    setSelectedSubs(p => {
      const n = new Set(p)
      if (n.has(name)) n.delete(name); else n.add(name)
      return n
    })
  }

  function addKeyword(kw: string) {
    const trimmed = kw.trim()
    if (!trimmed || keywords.includes(trimmed)) return
    setKeywords(p => [...p, trimmed])
  }

  function removeKeyword(kw: string) { setKeywords(p => p.filter(k => k !== kw)) }

  function handleKwKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && kwInput.trim()) {
      addKeyword(kwInput)
      setKwInput('')
    }
  }

  async function handleComplete() {
    setCreating(true)
    setCreateError('')
    try {
      const r = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: normalizeUrl(url),
          profile,
          selectedSubreddits: [...selectedSubs],
          keywords,
        }),
      })
      if (!r.ok) {
        const body = await r.json().catch(() => ({}))
        throw new Error(body.error || `Error ${r.status}`)
      }
      setCreating(false)
      setStep('4b')
      runInitialScan()
    } catch (e: any) {
      setCreating(false)
      setCreateError(e.message || 'Something went wrong')
    }
  }

  async function runInitialScan() {
    try {
      const prepRes = await fetch('/api/scan', { method: 'POST' })
      const prep = await prepRes.json().catch(() => ({}))
      const subreddits: { subredditId: string; subredditName: string; productId: string }[] = prep.subreddits ?? []

      if (!subreddits.length) {
        window.location.href = '/opportunities'
        return
      }

      const limit = prep.fetchLimit ?? 15
      const subredditsData: { subredditId: string; productId: string; threads: any[] }[] = []
      for (const { subredditId, subredditName, productId } of subreddits) {
        const res = await fetch(`/api/reddit/threads?subreddit=${encodeURIComponent(subredditName)}&limit=${limit}`)
        const data = await res.json().catch(() => ({ threads: [] }))
        subredditsData.push({ subredditId, productId, threads: data.threads ?? [] })
      }

      const processRes = await fetch('/api/scan/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subredditsData }),
      })
      const result = await processRes.json().catch(() => ({}))
      setScanLeadsFound(result.totalCreated ?? 0)
    } catch { /* non-fatal */ }

    scanTimerRef.current = setTimeout(() => {
      window.location.href = '/opportunities'
    }, 2000)
  }

  useEffect(() => {
    return () => { if (scanTimerRef.current) clearTimeout(scanTimerRef.current) }
  }, [])

  const stepNum = step === '1' || step === '1b' ? 1 : step === '2' ? 2 : step === '3' ? 3 : 4
  const STEPS = to.steps.map((label, i) => ({ n: i + 1, label }))

  return (
    <div className="ob-root">
      <header className="ob-top">
        <a href="/" className="ob-brand">
          <span className="ob-brand-mark" />
          <span>Redgrow</span>
        </a>
        <div className="ob-top-right">
          <a href="/dashboard">{to.backToDashboard}</a>
          <a href="#" onClick={async e => { e.preventDefault(); const { createClient } = await import('@/lib/supabase/client'); await createClient().auth.signOut(); window.location.href = '/' }}>{to.signOut}</a>
        </div>
      </header>

      <div className="ob-wrap">
        <div className="ob-stage">

          {/* Stepper */}
          <div className="ob-stepper">
            {STEPS.map(({ n, label }, i) => (
              <span key={n} style={{ display: 'contents' }}>
                {i > 0 && <span className={`ob-step-bar ${stepNum > n - 1 ? 'done' : ''}`} />}
                <span className={`ob-step-pill ${stepNum === n ? 'active' : stepNum > n ? 'done' : ''}`}>
                  <span className="ob-step-num">{stepNum > n ? '✓' : n}</span>
                  <span>{label}</span>
                </span>
              </span>
            ))}
          </div>

          {/* Card */}
          <div className="ob-card">
            {/* ─── LEFT ─── */}
            <div className="ob-left">
              {step === '1' && (
                <>
                  <div className="ob-eyebrow">{to.step1.eyebrowPrefix} <span className="ob-eyebrow-dim">{to.step1.eyebrowHint}</span></div>
                  <h1 className="ob-title">{to.step1.titleLine1} <em>{to.step1.titleEm}</em></h1>
                  <p className="ob-lead">{to.step1.lead}</p>
                  <div className="ob-field">
                    <label className="ob-field-label">{to.step1.label}</label>
                    <div className={`ob-input-row${urlError ? ' error' : ''}`}>
                      <span className="ob-input-ic">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                      </span>
                      <input
                        type="url"
                        className="ob-input"
                        placeholder="https://yourproduct.com"
                        value={url}
                        onChange={e => { setUrl(e.target.value); setUrlError(false) }}
                        onKeyDown={e => e.key === 'Enter' && url.trim().length >= 4 && handleAnalyze()}
                        autoFocus
                      />
                    </div>
                    {urlError
                      ? <p className="ob-helper error">{to.step1.urlError}</p>
                      : <p className="ob-helper">{to.step1.helper}</p>}
                  </div>
                  <div className="ob-actions">
                    <span className="ob-save-indicator"><span className="ob-save-dot" />{to.step1.progressSaved}</span>
                    <button className="ob-btn ob-btn-primary" onClick={handleAnalyze} disabled={url.trim().length < 4}>
                      {to.step1.continueBtn} <span className="ob-arr">→</span>
                    </button>
                  </div>
                </>
              )}

              {step === '1b' && (
                <>
                  <div className="ob-eyebrow">{to.step1.eyebrowPrefix} <span className="ob-eyebrow-dim">{to.step1b.eyebrowHint}</span></div>
                  <h1 className="ob-title">{to.step1.titleLine1} <em>{to.step1.titleEm}</em></h1>
                  <p className="ob-lead">{to.step1b.lead}</p>
                  <div className="ob-field">
                    <label className="ob-field-label">{to.step1.label}</label>
                    <div className="ob-input-row" style={{ opacity: .7 }}>
                      <span className="ob-input-ic">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                      </span>
                      <input className="ob-input" value={normalizeUrl(url)} disabled />
                    </div>
                    {analyzeError
                      ? <p className="ob-helper error">{analyzeError}</p>
                      : <div className="ob-helper-analyzing"><span className="ob-dot-pulse" /> {to.step1b.analyzing}</div>}
                  </div>
                  <div className="ob-actions">
                    <span className="ob-save-indicator"><span className="ob-save-dot" />{to.step1b.takesTime}</span>
                    <button className="ob-btn ob-btn-primary" disabled>{to.step1b.analyzingBtn} <span className="ob-arr">→</span></button>
                  </div>
                </>
              )}

              {step === '2' && (
                <>
                  <div className="ob-eyebrow">{to.step2.eyebrowPrefix} <span className="ob-eyebrow-dim">{to.step2.eyebrowHint}</span></div>
                  <h1 className="ob-title">{to.step2.titleLine1} <em>{to.step2.titleEm}</em></h1>
                  <p className="ob-lead">
                    {to.step2.lead(discoveredSubs.length, profile?.name || 'your product')}
                  </p>
                  <div className="ob-field">
                    <label className="ob-field-label">{to.step2.filterLabel}</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      <span className="ob-filter-chip active">{to.step2.filterAll} <span className="ob-filter-count">{discoveredSubs.length}</span></span>
                      <span className="ob-filter-chip">{to.step2.filterHighFit} <span className="ob-filter-count">{discoveredSubs.filter(s => s.fitScore >= 80).length}</span></span>
                      <span className="ob-filter-chip">{to.step2.filterNiche} <span className="ob-filter-count">{discoveredSubs.filter(s => s.fitScore < 80).length}</span></span>
                    </div>
                  </div>
                  <div className="ob-actions">
                    <button className="ob-btn ob-btn-ghost" onClick={() => setStep('1')}>{to.step2.back}</button>
                    <button className="ob-btn ob-btn-primary" onClick={() => setStep('3')}>
                      {to.step2.selectedContinue(selectedSubs.size)} <span className="ob-arr">→</span>
                    </button>
                  </div>
                </>
              )}

              {step === '3' && (
                <>
                  <div className="ob-eyebrow">{to.step3.eyebrowPrefix} <span className="ob-eyebrow-dim">{to.step3.eyebrowHint}</span></div>
                  <h1 className="ob-title">{to.step3.titleLine1} <em>{to.step3.titleEm}</em></h1>
                  <p className="ob-lead">{to.step3.lead}</p>
                  <div className="ob-field">
                    <label className="ob-field-label">
                      {to.step3.label} <span style={{ color: '#8B8175', fontWeight: 500, letterSpacing: '.04em' }}>· {keywords.length} {to.step3.of30}</span>
                    </label>
                    <div className="ob-kw-input">
                      {keywords.map(kw => (
                        <span key={kw} className="ob-kw-chip">
                          {kw}
                          <span className="ob-kw-x" onClick={() => removeKeyword(kw)}>×</span>
                        </span>
                      ))}
                      <input
                        className="ob-kw-text-input"
                        placeholder={to.step3.placeholder}
                        value={kwInput}
                        onChange={e => setKwInput(e.target.value)}
                        onKeyDown={handleKwKeyDown}
                      />
                    </div>
                    <p className="ob-helper">{to.step3.helper}</p>
                  </div>
                  <div className="ob-actions">
                    <button className="ob-btn ob-btn-ghost" onClick={() => setStep('2')}>{to.step3.back}</button>
                    <button className="ob-btn ob-btn-primary" onClick={() => setStep('4')}>{to.step3.continueBtn} <span className="ob-arr">→</span></button>
                  </div>
                </>
              )}

              {step === '4' && (
                <>
                  <div className="ob-eyebrow" style={{ color: '#3FB07A' }}>
                    {to.step4.eyebrowPrefix} <span className="ob-eyebrow-dim" style={{ color: '#8B8175' }}>{to.step4.eyebrowHint}</span>
                  </div>
                  <h1 className="ob-title">{to.step4.titleLine1} <em>{to.step4.titleEm}</em></h1>
                  <p className="ob-lead">
                    {to.step4.lead(selectedSubs.size, keywords.length)}
                  </p>
                  <div className="ob-field">
                    <label className="ob-field-label">{to.step4.nextLabel}</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                      {to.step4.nextItems.map((text, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, color: '#C9BFAE' }}>
                          <span className="ob-next-num">{i + 1}</span>
                          {text}
                        </div>
                      ))}
                    </div>
                  </div>
                  {createError && (
                    <p style={{ fontSize: 13, color: '#E55353', fontWeight: 600, margin: '8px 0 0', background: 'rgba(229,83,83,.1)', border: '1px solid rgba(229,83,83,.3)', borderRadius: 8, padding: '10px 14px' }}>
                      ⚠ {createError}
                    </p>
                  )}
                  <div className="ob-actions">
                    <button className="ob-btn ob-btn-ghost" onClick={() => setStep('3')}>{to.step4.back}</button>
                    <button className="ob-btn ob-btn-primary" onClick={handleComplete} disabled={creating}>
                      {creating
                        ? <><span className="ob-inline-spinner" /> {to.step4.saving}</>
                        : <>{to.step4.findLeads} <span className="ob-arr">→</span></>}
                    </button>
                  </div>
                </>
              )}

              {step === '4b' && (
                <>
                  <div className="ob-eyebrow" style={{ color: '#3FB07A' }}>
                    {to.step4b.eyebrow} <span className="ob-eyebrow-dim" style={{ color: '#8B8175' }}>{to.step4b.eyebrowHint}</span>
                  </div>
                  <h1 className="ob-title">{to.step4b.titleLine1} <em>{to.step4b.titleEm}</em></h1>
                  <p className="ob-lead">{to.step4b.lead}</p>
                  <div className="ob-field">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                      {to.step4b.scanItems.map((label, i) => {
                        const done = i === 0 ? true : scanLeadsFound > 0
                        return (
                          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, color: done ? '#C9BFAE' : '#5E544A' }}>
                            <span style={{
                              width: 20, height: 20, borderRadius: '50%', display: 'inline-flex',
                              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              background: done ? 'rgba(63,176,122,.15)' : 'rgba(255,255,255,.04)',
                              border: `1px solid ${done ? 'rgba(63,176,122,.4)' : 'rgba(255,255,255,.08)'}`,
                              fontSize: 10,
                            }}>
                              {done ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3FB07A" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : <span className="ob-dot-pulse" style={{ width: 6, height: 6 }} />}
                            </span>
                            {label}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 10, background: 'rgba(63,176,122,.08)', border: '1px solid rgba(63,176,122,.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="ob-dot-pulse" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, color: '#3FB07A', fontWeight: 600 }}>
                      {scanLeadsFound > 0 ? to.step4b.leadsFound(scanLeadsFound) : to.step4b.scanning}
                    </span>
                  </div>
                  <div className="ob-actions" style={{ marginTop: 24 }}>
                    <span style={{ fontSize: 13, color: '#5E544A' }}>{to.step4b.autoRedirect}</span>
                    <button className="ob-btn ob-btn-primary" onClick={() => { window.location.href = '/opportunities' }}>
                      {to.step4b.goNow} <span className="ob-arr">→</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* ─── RIGHT ─── */}
            <div className="ob-right">
              {step === '1' && <OrbitGraphic />}
              {step === '1b' && <ChecklistPanel checks={checks} url={normalizeUrl(url)} />}
              {step === '2' && (
                <SubredditPanel subs={discoveredSubs} selected={selectedSubs} onToggle={toggleSub} />
              )}
              {step === '3' && (
                <KeywordPanel
                  suggestions={suggestedKeywords}
                  currentKeywords={keywords}
                  onAdd={addKeyword}
                />
              )}
              {(step === '4' || step === '4b') && (
                <ReadyPanel selectedCount={selectedSubs.size} kwCount={keywords.length} productName={profile?.name} scanning={step === '4b'} leadsFound={scanLeadsFound} />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Orbit graphic (Step 1 right panel) ──────────────────────────────────────

function OrbitGraphic() {
  const nodes = [
    { style: { left: '50%', top: 0, transform: 'translateX(-50%)' }, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg> },
    { style: { right: 0, top: '30%' }, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 14 0v1"/></svg> },
    { style: { right: '10%', bottom: '8%' }, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg> },
    { style: { left: '50%', bottom: '10%', transform: 'translateX(-50%)' }, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg> },
    { style: { left: '10%', bottom: '18%' }, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> },
    { style: { left: 0, top: '30%' }, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="17" cy="17" r="4"/><circle cx="7" cy="7" r="4"/><path d="M11 7h6"/><path d="M7 11v6"/></svg> },
  ]
  return (
    <div className="ob-orbit" aria-hidden="true">
      <svg className="ob-orbit-rings" viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="80" fill="none" stroke="rgba(255,237,210,.06)" strokeDasharray="2 5"/>
        <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(255,237,210,.05)" strokeDasharray="2 5"/>
        <circle cx="200" cy="200" r="190" fill="none" stroke="rgba(255,237,210,.04)" strokeDasharray="2 5"/>
      </svg>
      <div className="ob-orbit-pulse" />
      <div className="ob-orbit-pulse p2" />
      <div className="ob-orbit-nodes">
        {nodes.map((n, i) => (
          <div key={i} className="ob-orbit-node" style={n.style as React.CSSProperties}>{n.icon}</div>
        ))}
        <div className="ob-orbit-core">
          <svg viewBox="0 0 24 24" fill="none" width="44" height="44">
            <circle cx="12" cy="13" r="9" fill="#fff"/>
            <circle cx="9" cy="13" r="1.3" fill="#FF5722"/>
            <circle cx="15" cy="13" r="1.3" fill="#FF5722"/>
            <path d="M8 16 Q12 19 16 16" stroke="#FF5722" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
            <circle cx="12" cy="5.5" r="1.1" fill="#fff" stroke="#fff" strokeWidth="1"/>
            <line x1="12" y1="6.5" x2="12" y2="9" stroke="#fff" strokeWidth="1.4"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Checklist panel (Step 1b right panel) ────────────────────────────────────

function ChecklistPanel({ checks, url }: { checks: { website: CheckState; profile: CheckState; subreddits: CheckState; keywords: CheckState }; url: string }) {
  const to = useT().onboarding
  const cl = to.checklist

  const items = [
    {
      key: 'website' as const,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
      title: cl.website.title,
      activeSub: cl.website.active(url),
      doneSub: cl.website.done(url),
      pendingSub: cl.website.pending,
    },
    {
      key: 'profile' as const,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
      title: cl.profile.title,
      activeSub: cl.profile.active,
      doneSub: cl.profile.done,
      pendingSub: cl.profile.pending,
    },
    {
      key: 'subreddits' as const,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
      title: cl.subreddits.title,
      activeSub: cl.subreddits.active,
      doneSub: cl.subreddits.done,
      pendingSub: cl.subreddits.pending,
    },
    {
      key: 'keywords' as const,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>,
      title: cl.keywords.title,
      activeSub: cl.keywords.active,
      doneSub: cl.keywords.done,
      pendingSub: cl.keywords.pending,
    },
  ]

  return (
    <div className="ob-checklist">
      {items.map(item => {
        const state = checks[item.key]
        return (
          <div key={item.key} className={`ob-check-item ${state}`}>
            <div className="ob-check-ic">
              {state === 'active' && <div className="ob-check-spinner" />}
              {state === 'done'
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>
                : item.icon}
            </div>
            <div className="ob-check-body">
              <div className="ob-check-title">{item.title}</div>
              <div className="ob-check-sub">
                {state === 'active' ? item.activeSub : state === 'done' ? item.doneSub : item.pendingSub}
              </div>
            </div>
            <div className="ob-check-time">
              {state === 'done' ? cl.stateLabels.done : state === 'active' ? '…' : cl.stateLabels.queued}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Subreddit panel (Step 2 right panel) ────────────────────────────────────

function SubredditPanel({ subs, selected, onToggle }: {
  subs: DiscoveredSub[]
  selected: Set<string>
  onToggle: (name: string) => void
}) {
  const to = useT().onboarding
  const sp = to.subredditPanel

  return (
    <div className="ob-sr-preview">
      <div className="ob-preview-head">
        <span className="ob-preview-lbl">{sp.header}</span>
        <span className="ob-preview-count">{sp.selected(selected.size, subs.length)}</span>
      </div>
      <div className="ob-sr-list">
        {subs.map(sub => {
          const on = selected.has(sub.name)
          return (
            <div key={sub.name} className={`ob-sr-item${on ? ' on' : ''}`}>
              <span className="ob-sr-mark">r</span>
              <div className="ob-sr-info">
                <div className="ob-sr-name">r/{sub.name}</div>
                <div className="ob-sr-score"><b>{sub.fitScore}%</b> {sp.fitLabel}</div>
              </div>
              <div className="ob-fit-bar" style={{ '--fit': `${sub.fitScore}%` } as React.CSSProperties} />
              <button className={`ob-toggle${on ? ' on' : ''}`} onClick={() => onToggle(sub.name)} aria-label={`Toggle r/${sub.name}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Keyword panel (Step 3 right panel) ──────────────────────────────────────

function KeywordPanel({ suggestions, currentKeywords, onAdd }: {
  suggestions: string[]
  currentKeywords: string[]
  onAdd: (kw: string) => void
}) {
  const to = useT().onboarding
  const kp = to.keywordPanel
  const available = suggestions.filter(s => !currentKeywords.includes(s))

  return (
    <div>
      <div className="ob-sug-head"><span className="ob-sug-spark">✦</span> {kp.aiSuggested}</div>
      <div className="ob-kw-grid">
        {available.slice(0, 12).map(kw => (
          <span key={kw} className="ob-kw-sug" onClick={() => onAdd(kw)}>
            <span className="ob-kw-plus">+</span>{kw}
          </span>
        ))}
        {available.length === 0 && (
          <span style={{ fontSize: 12.5, color: '#5E544A', fontFamily: 'JetBrains Mono, monospace' }}>{kp.allAdded}</span>
        )}
      </div>

      <div className="ob-sug-head" style={{ marginTop: 18 }}><span className="ob-sug-spark">⚡</span> {kp.painSignals}</div>
      <div className="ob-kw-grid">
        <span className="ob-kw-sug" style={{ borderColor: 'rgba(226,85,85,.25)', color: '#FF8A8A', pointerEvents: 'none' }}><span className="ob-kw-plus" style={{ color: '#FF8A8A' }}>●</span>{kp.competitorPain}</span>
        <span className="ob-kw-sug" style={{ borderColor: 'rgba(255,87,34,.28)', color: '#FF7849', pointerEvents: 'none' }}><span className="ob-kw-plus" style={{ color: '#FF7849' }}>●</span>{kp.switchingIntent}</span>
        <span className="ob-kw-sug" style={{ borderColor: 'rgba(91,141,239,.25)', color: '#9DB3FF', pointerEvents: 'none' }}><span className="ob-kw-plus" style={{ color: '#9DB3FF' }}>●</span>{kp.toolSearch}</span>
        <span className="ob-kw-sug" style={{ borderColor: 'rgba(63,176,122,.2)', color: '#3FB07A', pointerEvents: 'none' }}><span className="ob-kw-plus" style={{ color: '#3FB07A' }}>●</span>{kp.highFitICP}</span>
      </div>

      <div className="ob-alert-row">
        <div className="ob-alert-ic">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
          </svg>
        </div>
        <div>
          <div className="ob-alert-title">{kp.alertTitle}</div>
          <div className="ob-alert-sub">{kp.alertSub}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Ready panel (Step 4 right panel) ────────────────────────────────────────

function ReadyPanel({ selectedCount, kwCount, productName, scanning = false, leadsFound = 0 }: { selectedCount: number; kwCount: number; productName?: string; scanning?: boolean; leadsFound?: number }) {
  const to = useT().onboarding
  const rp = to.readyPanel

  return (
    <div>
      <div className="ob-ready-head">
        <span className="ob-ready-lbl">{rp.firstMatch} <span style={{ color: scanning ? '#3FB07A' : '#FF7849' }}>{scanning ? rp.liveScanRunning : rp.scanningNow}</span></span>
        <span className="ob-live-badge"><span className="ob-live-dot" />{rp.live}</span>
      </div>
      <div className="ob-preview-thread">
        <span className="ob-thread-mark">r</span>
        <div>
          <div className="ob-thread-meta">
            <span className="sub">r/SaaS</span><span>·</span><span>just now</span><span>·</span><span>▲ 12 · 3 comments</span>
          </div>
          <div className="ob-thread-ttl">
            Anyone know a good alternative to [Competitor] for this? Looking for something that doesn't cost a fortune.
          </div>
          <div className="ob-thread-tags">
            <span className="ob-pain-tag">{to.keywordPanel.switchingIntent}</span>
            <span className="ob-pain-tag blue">{to.keywordPanel.toolSearch}</span>
          </div>
        </div>
        <span className="ob-intent-pill">91%</span>
      </div>

      <div className="ob-summary-grid">
        <div className="ob-sum">
          <div className="ob-sum-lbl">{rp.subredditsLabel}</div>
          <div className="ob-sum-val">{selectedCount}</div>
          <div className="ob-sum-delta">{rp.watching}</div>
        </div>
        <div className="ob-sum">
          <div className="ob-sum-lbl">{rp.keywordsLabel}</div>
          <div className="ob-sum-val">{kwCount}</div>
          <div className="ob-sum-delta">{rp.tracked}</div>
        </div>
        <div className="ob-sum">
          <div className="ob-sum-lbl">{scanning ? rp.leadsFoundLabel : rp.intentLabel}</div>
          <div className="ob-sum-val">{scanning ? leadsFound : <>91<span style={{ fontSize: 14, color: '#8B8175', fontWeight: 500 }}>%</span></>}</div>
          <div className="ob-sum-delta">{scanning ? rp.soFar : rp.firstMatchLabel}</div>
        </div>
      </div>

      <div className="ob-ready-success" style={scanning ? { borderColor: 'rgba(63,176,122,.25)', background: 'rgba(63,176,122,.06)' } : {}}>
        <div className="ob-ready-ic" style={scanning ? { background: 'rgba(63,176,122,.15)', borderColor: 'rgba(63,176,122,.3)' } : {}}>
          {scanning
            ? <span className="ob-dot-pulse" style={{ width: 8, height: 8 }} />
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <div>
          <div className="ob-ready-title">{scanning ? rp.scanInProgress : rp.workspaceLive}</div>
          <div className="ob-ready-sub">
            {scanning ? rp.scanningText(productName) : rp.liveText(productName)}
          </div>
        </div>
      </div>
    </div>
  )
}
