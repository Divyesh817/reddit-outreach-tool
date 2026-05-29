'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { S } from '@/lib/theme'
import { PAIN_TYPE_LABELS, type PainType } from '@/types'

// Pain type chip styles — use theme CSS vars for structural colors
const PAIN_STYLE: Record<PainType, { text: string; bg: string; label: string }> = {
  workflow_pain:          { text: S.purple,  bg: S.purpleSoft, label: 'Workflow pain' },
  competitor_frustration: { text: S.red,     bg: S.redSoft,    label: 'Competitor pain' },
  switching_intent:       { text: S.orange2, bg: S.orangeSoft, label: 'Switching intent' },
  active_tool_search:     { text: S.blue,    bg: S.blueSoft,   label: 'Tool search' },
  roi_frustration:        { text: S.amber,   bg: S.amberSoft,  label: 'ROI frustration' },
}

const PAIN_PERSONA: Record<PainType, string> = {
  workflow_pain:          'Workflow challenge',
  competitor_frustration: 'Competitor unhappy',
  switching_intent:       'Actively switching',
  active_tool_search:     'Seeking solution',
  roi_frustration:        'ROI challenge',
}

function timeAgo(date: string) {
  const h = Math.floor((Date.now() - new Date(date).getTime()) / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reply {
  id: string
  text: string
  toneUsed: string | null
  whyThisWorks: string | null
  version: number
}

interface Opportunity {
  id: string
  redditPostTitle: string
  redditPostUrl: string
  redditPostBody: string | null
  redditAuthor: string
  redditScore: number
  redditCommentCount: number
  redditPostedAt: string
  intentScore: number
  painType: PainType
  shouldPitch: boolean
  scoringReasoning: string | null
  status: string
  topComments: string[]
  subreddit: { name: string; allowsPromotion: boolean; rulesScannedAt: string | null }
  replies: Reply[]
  product: { id: string; name: string }
}

interface Props {
  opportunities: Opportunity[]
  initialStatus: string
  productName: string
  counts: { queued: number; posted: number; skipped: number }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const icBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 7, display: 'flex', alignItems: 'center',
  justifyContent: 'center', color: S.text3, background: 'none', border: 'none',
  cursor: 'pointer', transition: 'all .15s', flexShrink: 0,
}

function SectionHead({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
      letterSpacing: '.12em', textTransform: 'uppercase', color: S.text3, fontWeight: 600,
    }}>
      <span>{left}</span>
      <span style={{ flex: 1, height: 1, background: S.line }} />
      {right && <span style={{ color: S.text3, fontWeight: 500, letterSpacing: '.06em', fontSize: 12 }}>{right}</span>}
    </div>
  )
}

function SignalChip({ icon, text, match }: { icon: React.ReactNode; text: React.ReactNode; match?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px',
      borderRadius: 7, background: S.card,
      border: `1px solid ${match ? S.orangeLine : S.line}`,
      fontSize: 13.5, color: match ? S.orange2 : S.text2,
    }}>
      <span style={{ width: 14, height: 14, color: match ? S.orange : S.text3, display: 'flex', flexShrink: 0 }}>
        {icon}
      </span>
      {text}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

// CSS string extracted to avoid dangerouslySetInnerHTML needing dynamic interp — injected once
const INBOX_CSS = `
  @keyframes ib-spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
  .ib-spin { animation: ib-spin 1s linear infinite }
  .ib-thread:hover { background: var(--c-card-hover) !important; }
  .ib-icbtn:hover  { background: rgba(128,100,70,.12) !important; color: var(--c-text) !important; }
  .ib-danger:hover { background: var(--c-red-soft) !important; color: var(--c-red) !important; }
  .ib-scroll::-webkit-scrollbar { width:6px }
  .ib-scroll::-webkit-scrollbar-thumb { background:var(--c-line3); border-radius:999px }
  .ib-post-fade::after {
    content:''; position:absolute; left:0; right:0; bottom:0; height:52px;
    background:linear-gradient(transparent,var(--c-card)); pointer-events:none;
  }
  .ib-post-fade.expanded::after { display:none }
  .ib-expand:hover  { color:var(--c-orange2) !important }
  .ib-btn-ghost:hover { background:var(--c-card-hover) !important; border-color:var(--c-line2) !important }
  .ib-open:hover svg { color:var(--c-orange2) }
`

export function InboxView({ opportunities: initial, initialStatus, productName, counts: initialCounts }: Props) {
  const router = useRouter()

  const [allOpps, setAllOpps] = useState(initial)
  const [activeStatus, setActiveStatus] = useState(initialStatus)
  const [search, setSearch] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanMsg, setScanMsg] = useState('')
  const [comments, setComments] = useState<{ author: string; body: string; score: number }[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState('')
  const [commentReplies, setCommentReplies] = useState<Record<number, { text: string; whyThisWorks: string; loading: boolean; copied: boolean }>>({})

  async function generateCommentReply(commentIndex: number, comment: { author: string; body: string }) {
    if (!selected) return
    setCommentReplies(prev => ({ ...prev, [commentIndex]: { text: '', whyThisWorks: '', loading: true, copied: false } }))
    try {
      const res = await fetch(`/api/opportunities/${selected.id}/reply-to-comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentBody: comment.body, commentAuthor: comment.author }),
      })
      const data = await res.json()
      setCommentReplies(prev => ({ ...prev, [commentIndex]: { text: data.text ?? '', whyThisWorks: data.whyThisWorks ?? '', loading: false, copied: false } }))
      if (data.text) router.refresh()
    } catch {
      setCommentReplies(prev => ({ ...prev, [commentIndex]: { text: '', whyThisWorks: '', loading: false, copied: false } }))
    }
  }

  async function copyCommentReply(commentIndex: number, text: string) {
    await navigator.clipboard.writeText(text)
    setCommentReplies(prev => ({ ...prev, [commentIndex]: { ...prev[commentIndex], copied: true } }))
    setTimeout(() => setCommentReplies(prev => ({ ...prev, [commentIndex]: { ...prev[commentIndex], copied: false } })), 2000)
  }

  // Derive opps + counts from allOpps to keep everything in sync after actions
  const opps = allOpps.filter(o => o.status === activeStatus)
  const counts = {
    queued:  allOpps.filter(o => o.status === 'QUEUED').length,
    posted:  allOpps.filter(o => o.status === 'POSTED').length,
    skipped: allOpps.filter(o => o.status === 'SKIPPED').length,
  }

  const [selected, setSelected] = useState<Opportunity | null>(
    initial.filter(o => o.status === initialStatus)[0] ?? null
  )
  const [replyText, setReplyText] = useState(initial[0]?.replies[0]?.text ?? '')
  const [editMode, setEditMode] = useState(false)
  const [postExpanded, setPostExpanded] = useState(false)
  const [loading, setLoading] = useState<'done' | 'skip' | 'regen' | null>(null)
  const [copied, setCopied] = useState(false)
  // null = follow shouldPitch from DB; true/false = user override
  const [includePitch, setIncludePitch] = useState<boolean | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const effectivePitch = includePitch !== null ? includePitch : (selected?.shouldPitch ?? false)

  const filtered = search
    ? opps.filter(o =>
        o.redditPostTitle.toLowerCase().includes(search.toLowerCase()) ||
        o.subreddit.name.toLowerCase().includes(search.toLowerCase()) ||
        o.redditAuthor.toLowerCase().includes(search.toLowerCase())
      )
    : opps

  const tabCounts: Record<string, number> = {
    QUEUED: counts.queued,
    POSTED: counts.posted,
    SKIPPED: counts.skipped,
  }

  const selectedIndex = filtered.findIndex(o => o.id === selected?.id)
  const reply = selected?.replies[0] ?? null

  // Keep handlers in a ref so keyboard listener never goes stale
  const h = useRef({ handleMarkDone, handleCopy, handleSkip, navigateRelative })
  useEffect(() => { h.current = { handleMarkDone, handleCopy, handleSkip, navigateRelative } })

  // Load stored comments for the initially selected thread on mount
  useEffect(() => {
    if (selected) loadStoredComments(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tgt = e.target as HTMLElement
      if (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA') return
      if (e.key === 'e' || e.key === 'E') h.current.handleMarkDone()
      if (e.key === 'x' || e.key === 'X') h.current.handleSkip()
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') { e.preventDefault(); h.current.handleCopy() }
      if ((e.metaKey || e.ctrlKey) && e.key === 'o') { e.preventDefault(); if (selected) window.open(selected.redditPostUrl, '_blank') }
      if (e.key === 'ArrowDown') h.current.navigateRelative(1)
      if (e.key === 'ArrowUp')   h.current.navigateRelative(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  function selectOpp(opp: Opportunity) {
    setSelected(opp)
    setReplyText(opp.replies[0]?.text ?? '')
    setEditMode(false)
    setPostExpanded(false)
    setCopied(false)
    setIncludePitch(null)
    setCommentsError('')
    setCommentReplies({})
    detailRef.current?.scrollTo(0, 0)
    loadStoredComments(opp)
  }

  function loadStoredComments(opp: Opportunity) {
    const stored = (opp.topComments ?? []).filter(Boolean)
    if (stored.length > 0) {
      setComments(stored.map(body => ({ author: '', body, score: 0 })))
    } else {
      setComments([])
    }
    setCommentsLoading(false)
    setCommentsError('')
  }

  function navigateRelative(delta: number) {
    const next = filtered[selectedIndex + delta]
    if (next) selectOpp(next)
  }

  async function handleCopy() {
    if (!replyText) return
    await navigator.clipboard.writeText(replyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleMarkDone() {
    if (!selected || loading) return
    setLoading('done')
    await fetch(`/api/opportunities/${selected.id}/approve`, { method: 'POST' })
    // Transition status client-side — no router.refresh needed
    setAllOpps(prev => prev.map(o => o.id === selected.id ? { ...o, status: 'POSTED' } : o))
    const nextInQueue = opps.filter(o => o.id !== selected.id)[0] ?? null
    setSelected(nextInQueue); setReplyText(nextInQueue?.replies[0]?.text ?? ''); setCopied(false)
    setLoading(null)
  }

  async function handleSkip() {
    if (!selected || loading) return
    setLoading('skip')
    await fetch(`/api/opportunities/${selected.id}/skip`, { method: 'POST' })
    setAllOpps(prev => prev.map(o => o.id === selected.id ? { ...o, status: 'SKIPPED' } : o))
    const nextInQueue = opps.filter(o => o.id !== selected.id)[0] ?? null
    setSelected(nextInQueue); setReplyText(nextInQueue?.replies[0]?.text ?? ''); setCopied(false)
    setLoading(null)
  }

  async function handleRegen(pitchOverride?: boolean) {
    if (!selected || loading) return
    setLoading('regen')
    const body: Record<string, unknown> = {}
    // Use explicit override if passed, otherwise fall back to current toggle state
    const pitch = pitchOverride !== undefined ? pitchOverride : (includePitch !== null ? includePitch : undefined)
    if (pitch !== undefined) body.includePitch = pitch
    const res = await fetch(`/api/opportunities/${selected.id}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const { data } = await res.json()
      const nr: Reply = { id: data.id, text: data.text, toneUsed: data.toneUsed, whyThisWorks: data.whyThisWorks, version: data.version }
      setReplyText(data.text); setCopied(false); setEditMode(false)
      setSelected(s => s ? { ...s, replies: [nr] } : s)
      setAllOpps(os => os.map(o => o.id === selected.id ? { ...o, replies: [nr] } : o))
      router.refresh()
    }
    setLoading(null)
  }

  async function handleScan() {
    setScanning(true); setScanMsg('')
    try {
      // Step 1: get subreddits to scan from server
      const prepRes = await fetch('/api/scan', { method: 'POST' })
      const prep = await prepRes.json().catch(() => ({}))

      if (prep.error && !prep.subreddits) {
        setScanMsg(prep.limitReached ? `Limit reached: ${prep.error}` : `Error: ${prep.error}`)
        setTimeout(() => setScanMsg(''), 7000)
        setScanning(false)
        return
      }

      const subreddits: { subredditId: string; subredditName: string; productId: string }[] = prep.subreddits ?? []
      if (!subreddits.length) {
        setScanMsg('No subreddits configured — add some in Products')
        setTimeout(() => setScanMsg(''), 6000)
        setScanning(false)
        return
      }

      setScanMsg(`Fetching ${subreddits.length} subreddit${subreddits.length !== 1 ? 's' : ''}…`)

      // Step 2: fetch Reddit threads sequentially — parallel bursts trigger Reddit rate limits
      const limit = prep.fetchLimit ?? 15
      const subredditsData: { subredditId: string; productId: string; threads: any[] }[] = []
      for (const { subredditId, subredditName, productId } of subreddits) {
        const res = await fetch(`/api/reddit/threads?subreddit=${encodeURIComponent(subredditName)}&limit=${limit}`)
        const data = await res.json().catch(() => ({ threads: [] }))
        subredditsData.push({ subredditId, productId, threads: data.threads ?? [] })
      }

      const totalFetched = subredditsData.reduce((s, d) => s + d.threads.length, 0)
      if (!totalFetched) {
        setScanMsg('Could not reach Reddit — check your connection')
        setTimeout(() => setScanMsg(''), 6000)
        setScanning(false)
        return
      }

      setScanMsg('Scoring threads…')

      // Step 3: send threads to server for AI scoring + saving
      const processRes = await fetch('/api/scan/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subredditsData }),
      })
      const result = await processRes.json().catch(() => ({}))

      if (result.error) {
        setScanMsg(`Error: ${result.error}`)
        setTimeout(() => setScanMsg(''), 8000)
      } else {
        const n = result.totalCreated ?? 0
        setScanMsg(n > 0 ? `${n} new lead${n !== 1 ? 's' : ''} found!` : `Scanned ${subreddits.length} subreddits — no new high-intent threads`)
        setTimeout(() => setScanMsg(''), 7000)
      }

      router.refresh()
      // Refresh again after 3 minutes so Apify-enriched comments populate
      if (n > 0) setTimeout(() => router.refresh(), 3 * 60 * 1000)
    } catch (e) {
      setScanMsg('Scan failed — try again')
      setTimeout(() => setScanMsg(''), 5000)
    }
    setScanning(false)
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* dangerouslySetInnerHTML prevents React from HTML-escaping CSS content quotes */}
      <style dangerouslySetInnerHTML={{ __html: INBOX_CSS }} />

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', height: '100%', background: S.bg, overflow: 'hidden' }}>

        {/* ── LIST PANEL ──────────────────────────────────────────────── */}
        <div style={{ background: S.panel2, borderRight: `1px solid ${S.line}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* List header */}
          <div style={{ padding: '18px 18px 12px', borderBottom: `1px solid ${S.line}`, background: S.panel2, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Title */}
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.015em', color: S.text }}>Inbox</h2>

            {/* Hero scan button */}
            <button
              onClick={handleScan}
              disabled={scanning}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 9, padding: '11px 16px', borderRadius: 10, cursor: scanning ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', fontSize: 15, fontWeight: 700, letterSpacing: '-.01em',
                background: scanning
                  ? S.orangeSoft
                  : `linear-gradient(135deg, ${S.orange} 0%, #E54B1B 100%)`,
                color: scanning ? S.orange2 : '#fff',
                border: `1px solid ${scanning ? S.orangeLine : 'transparent'}`,
                boxShadow: scanning ? 'none' : 'inset 0 -2px 0 rgba(0,0,0,.2), 0 4px 14px rgba(255,87,34,.35)',
                transition: 'all .15s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                className={scanning ? 'ib-spin' : undefined} style={{ flexShrink: 0 }}>
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              {scanning ? 'Scanning Reddit…' : 'Scan for leads'}
            </button>

            {/* Scan result pill */}
            {scanMsg && (
              <div style={{
                fontSize: 13, fontWeight: 600, padding: '5px 10px', borderRadius: 6,
                background: scanMsg.includes('found') ? S.greenSoft : S.orangeSoft,
                color:      scanMsg.includes('found') ? S.green     : S.orange2,
                border:     `1px solid ${scanMsg.includes('found') ? S.greenLine : S.orangeLine}`,
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {scanMsg}
              </div>
            )}

            {/* Status tabs */}
            <div style={{ display: 'inline-flex', background: S.card, border: `1px solid ${S.line}`, borderRadius: 8, padding: 3, gap: 2 }}>
              {([
                { key: 'QUEUED',  label: 'New' },
                { key: 'POSTED',  label: 'Done' },
                { key: 'SKIPPED', label: 'Dismissed' },
              ] as const).map(tab => {
                const active = activeStatus === tab.key
                return (
                  <button key={tab.key} onClick={() => {
                    setActiveStatus(tab.key)
                    setSelected(allOpps.filter(o => o.status === tab.key)[0] ?? null)
                    setSearch('')
                  }} style={{
                    padding: '7px 12px', fontSize: 14, borderRadius: 6, fontWeight: 500,
                    color: active ? S.text : S.text3,
                    background: active ? S.cardHover : 'transparent',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all .12s',
                  }}>
                    {tab.label}
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                      padding: '2px 6px', borderRadius: 4,
                      background: active ? S.orangeSoft : S.line,
                      color:      active ? S.orange2    : S.text3,
                    }}>
                      {tabCounts[tab.key] ?? 0}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: S.card, border: `1px solid ${S.line}`, borderRadius: 8 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: S.text3, flexShrink: 0 }}>
                <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                placeholder="Search threads…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, fontSize: 15, background: 'transparent', border: 'none', color: S.text, outline: 'none', fontFamily: 'inherit' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: S.text4, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
              )}
            </div>
          </div>

          {/* Thread list */}
          <div className="ib-scroll" style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: S.card, border: `1px solid ${S.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: S.text4 }}><path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
                </div>
                <p style={{ fontSize: 17, fontWeight: 600, color: S.text3, margin: '0 0 6px' }}>
                  {search ? 'No matches' : activeStatus === 'QUEUED' ? 'Inbox empty' : 'Nothing here'}
                </p>
                {!search && activeStatus === 'QUEUED' && (
                  <p style={{ fontSize: 15, color: S.text4, margin: 0 }}>Hit the refresh button to scan for new leads.</p>
                )}
              </div>
            ) : filtered.map(opp => {
              const isActive = selected?.id === opp.id
              const pain = PAIN_STYLE[opp.painType]
              return (
                <div
                  key={opp.id}
                  className="ib-thread"
                  onClick={() => selectOpp(opp)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 8,
                    padding: '14px 18px', borderBottom: `1px solid ${S.line}`,
                    cursor: 'pointer', transition: 'background .15s',
                    background: isActive ? S.card : 'transparent',
                    borderLeft: `2px solid ${isActive ? S.orange : 'transparent'}`,
                    paddingLeft: isActive ? 16 : 18,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 11, padding: '3px 8px',
                      borderRadius: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em',
                      color: pain.text, background: pain.bg, flexShrink: 0,
                    }}>
                      {pain.label}
                    </span>
                    <span style={{
                      marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                      background: opp.intentScore >= 80 ? S.orange : S.orangeSoft,
                      color: opp.intentScore >= 80 ? '#fff' : S.orange2,
                    }}>
                      {opp.intentScore}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 16, fontWeight: 600, color: S.text, lineHeight: 1.35,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  } as React.CSSProperties}>
                    {opp.redditPostTitle}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: S.text3 }}>
                    <span style={{ color: S.text2, fontWeight: 500 }}>r/{opp.subreddit.name}</span>
                    <Dot />
                    <span>u/{opp.redditAuthor}</span>
                    <Dot />
                    <span>{timeAgo(opp.redditPostedAt)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── DETAIL PANEL ─────────────────────────────────────────────── */}
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', background: S.bg }}>

            {/* Detail topbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderBottom: `1px solid ${S.line}`, background: S.bg, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: S.text3, fontSize: 15, flex: 1, minWidth: 0 }}>
                <span style={{ flexShrink: 0 }}>Inbox</span>
                <span style={{ color: S.text4, flexShrink: 0 }}>/</span>
                <span style={{ color: S.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selected.redditPostTitle}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <button className="ib-icbtn" onClick={() => navigateRelative(-1)} disabled={selectedIndex <= 0} title="Previous (↑)" style={{ ...icBtn, opacity: selectedIndex <= 0 ? 0.3 : 1 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button className="ib-icbtn" onClick={() => navigateRelative(1)} disabled={selectedIndex >= filtered.length - 1} title="Next (↓)" style={{ ...icBtn, opacity: selectedIndex >= filtered.length - 1 ? 0.3 : 1 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <span style={{ width: 1, height: 18, background: S.line, margin: '0 4px' }} />
                <button className="ib-icbtn ib-danger" onClick={handleSkip} disabled={!!loading} title="Dismiss (X)" style={icBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div ref={detailRef} className="ib-scroll" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
              <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 32px 140px', display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Thread hero */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <span style={{ width: 42, height: 42, borderRadius: '50%', background: S.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 17, flexShrink: 0 }}>
                    r
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-.015em', color: S.text, display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ flex: 1 }}>{selected.redditPostTitle}</span>
                      <a href={selected.redditPostUrl} target="_blank" rel="noopener noreferrer" className="ib-open"
                        style={{ color: S.text3, display: 'inline-flex', flexShrink: 0, marginTop: 3 }} title="Open on Reddit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: S.text3 }}>
                      <span style={{ color: S.text, fontWeight: 600 }}>r/{selected.subreddit.name}</span>
                      {/* Promo welcome pill */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                        letterSpacing: '.04em', textTransform: 'uppercase',
                        background: selected.subreddit.allowsPromotion ? S.greenSoft : S.redSoft,
                        color: selected.subreddit.allowsPromotion ? S.green : S.red,
                        border: `1px solid ${selected.subreddit.allowsPromotion ? S.greenLine : S.redSoft}`,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
                        {selected.subreddit.allowsPromotion ? 'Promo welcome' : 'No promo'}
                      </span>
                      <Dot /><span style={{ color: S.text2 }}>u/{selected.redditAuthor}</span>
                      <Dot /><span>{timeAgo(selected.redditPostedAt)}</span>
                      <Dot /><span>▲ {selected.redditScore}</span>
                      <Dot /><span>💬 {selected.redditCommentCount} comments</span>
                    </div>
                  </div>
                  {/* Intent score card */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', background: S.card, border: `1px solid ${S.orangeLine}`, borderRadius: 10, boxShadow: `0 0 0 4px ${S.orangeSoft} inset`, minWidth: 80 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: S.orange2, lineHeight: 1, letterSpacing: '-.015em' }}>
                      {selected.intentScore}<small style={{ fontSize: 11, color: S.text3, fontWeight: 500, marginLeft: 1 }}>%</small>
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: S.text3, marginTop: 4 }}>
                      Intent
                    </div>
                  </div>
                </div>

                {/* Signal row */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <SignalChip match icon={<CheckIc />} text={<>Matched <b style={{ color: S.text, fontWeight: 600 }}>{PAIN_STYLE[selected.painType].label.toLowerCase()}</b></>} />
                  <SignalChip icon={<PersonIc />} text={<><b style={{ color: S.text, fontWeight: 600 }}>{PAIN_PERSONA[selected.painType]}</b> · {selected.painType.replace(/_/g, ' ')}</>} />
                  <SignalChip icon={<TrendIc />} text={<>ICP fit · <b style={{ color: S.text, fontWeight: 600 }}>{selected.intentScore >= 75 ? 'high' : selected.intentScore >= 50 ? 'medium' : 'low'}</b></>} />
                  {!selected.shouldPitch && (
                    <SignalChip icon={<AlertIc />} text={<>No pitch — value-only reply</>} />
                  )}
                </div>

                {/* Original post */}
                {selected.redditPostBody && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <SectionHead left="Original post" right={<>Posted <b style={{ color: S.text2, fontWeight: 600 }}>{timeAgo(selected.redditPostedAt)}</b></>} />
                    <div style={{ background: S.card, border: `1px solid ${S.line}`, borderRadius: 14, overflow: 'hidden' }}>
                      <div
                        className={`ib-post-fade${postExpanded ? ' expanded' : ''}`}
                        style={{ padding: '16px 18px', color: S.text2, fontSize: 16, lineHeight: 1.6, maxHeight: postExpanded ? 'none' : 120, overflow: postExpanded ? 'visible' : 'hidden', position: 'relative' }}
                      >
                        {selected.redditPostBody.split('\n').filter(Boolean).map((p, i) => (
                          <p key={i} style={{ margin: i > 0 ? '10px 0 0' : 0 }}>{p}</p>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px', borderTop: `1px solid ${S.line}`, background: S.panel2, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: S.text3 }}>
                        <span>▲ <b style={{ color: S.text2, fontWeight: 500 }}>{selected.redditScore}</b></span>
                        <span>💬 <b style={{ color: S.text2, fontWeight: 500 }}>{selected.redditCommentCount}</b> comments</span>
                        <button className="ib-expand" onClick={() => setPostExpanded(e => !e)} style={{ marginLeft: 'auto', color: S.orange2, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                          {postExpanded ? 'Show less ↑' : 'Read more ↓'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Thread comments — with AI reply generation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <SectionHead
                    left="Comments · reply opportunities"
                    right={
                      commentsLoading ? 'Loading…' :
                      comments.length === 0 ? 'No comments' :
                      `${comments.length} shown`
                    }
                  />
                  {commentsLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', background: S.card, border: `1px solid ${S.line}`, borderRadius: 12, fontSize: 14, color: S.text3 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ib-spin" style={{ color: S.orange, flexShrink: 0 }}>
                        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                      </svg>
                      Loading comments from Reddit…
                    </div>
                  ) : commentsError ? (
                    <div style={{ padding: '14px 18px', background: S.card, border: `1px solid ${S.line}`, borderRadius: 12, fontSize: 13, color: S.text3 }}>
                      No comments available for this thread.
                    </div>
                  ) : comments.length === 0 ? (
                    <div style={{ padding: '14px 18px', background: S.card, border: `1px solid ${S.line}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: S.orange2, flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span style={{ fontSize: 13, color: S.text3 }}>
                        Comments are being fetched in the background — <span style={{ color: S.text2, fontWeight: 500 }}>check back in a few minutes.</span>
                      </span>
                    </div>
                  ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {comments.map((c, i) => {
                          const cr = commentReplies[i]
                          return (
                            <div key={i} style={{ background: S.card, border: `1px solid ${S.line}`, borderRadius: 14, overflow: 'hidden' }}>
                              {/* Comment header */}
                              <div style={{ padding: '11px 16px', borderBottom: `1px solid ${S.line}`, display: 'flex', alignItems: 'center', gap: 8, background: S.panel2 }}>
                                {c.author ? (<>
                                  <div style={{
                                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg,#8B6CFF,#5040C2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 12, fontWeight: 700, color: '#fff',
                                  }}>
                                    {c.author[0]?.toUpperCase() ?? '?'}
                                  </div>
                                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: S.text2 }}>u/{c.author}</span>
                                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: S.text3 }}>▲ {c.score}</span>
                                </>) : (
                                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: S.text3 }}>Comment {i + 1}</span>
                                )}
                                <div style={{ marginLeft: 'auto' }}>
                                  {!cr ? (
                                    <button
                                      onClick={() => generateCommentReply(i, c)}
                                      style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '6px 12px', borderRadius: 7, cursor: 'pointer',
                                        fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                                        background: S.orangeSoft, border: `1px solid ${S.orangeLine}`,
                                        color: S.orange2, transition: 'all .15s',
                                      }}
                                    >
                                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                                      AI Reply
                                    </button>
                                  ) : cr.loading ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: S.orange2, fontFamily: 'JetBrains Mono, monospace' }}>
                                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ib-spin"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                                      Generating…
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => copyCommentReply(i, cr.text)}
                                      style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '6px 12px', borderRadius: 7, cursor: 'pointer',
                                        fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                                        background: cr.copied ? S.greenSoft : S.orange,
                                        border: cr.copied ? `1px solid ${S.greenLine}` : 'none',
                                        color: cr.copied ? S.green : '#fff',
                                        transition: 'all .15s',
                                        boxShadow: cr.copied ? 'none' : 'inset 0 -2px 0 rgba(0,0,0,.18)',
                                      }}
                                    >
                                      {cr.copied ? (
                                        <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
                                      ) : (
                                        <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy reply</>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Comment body */}
                              <div style={{ padding: '12px 16px', fontSize: 14, color: S.text2, lineHeight: 1.55 }}>
                                {c.body.split('\n').filter(Boolean).slice(0, 4).map((p, pi) => (
                                  <p key={pi} style={{ margin: pi > 0 ? '8px 0 0' : 0 }}>{p}</p>
                                ))}
                              </div>

                              {/* AI-generated reply (shown after generation) */}
                              {cr && !cr.loading && cr.text && (
                                <div style={{ borderTop: `1px solid ${S.line}`, background: S.bg }}>
                                  <div style={{ padding: '10px 16px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 5,
                                      padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                                      letterSpacing: '.06em', textTransform: 'uppercase' as const,
                                      background: S.orangeSoft, color: S.orange2,
                                      fontFamily: 'JetBrains Mono, monospace',
                                    }}>
                                      <span>✦</span> AI reply
                                    </span>
                                    <button
                                      onClick={() => setCommentReplies(prev => { const n = { ...prev }; delete n[i]; return n })}
                                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: S.text4, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}
                                    >×</button>
                                  </div>
                                  <div style={{ padding: '8px 16px 14px', fontSize: 14, color: S.text, lineHeight: 1.6 }}>
                                    {cr.text.split('\n').filter(Boolean).map((p, pi) => (
                                      <p key={pi} style={{ margin: pi > 0 ? '8px 0 0' : 0 }}>{p}</p>
                                    ))}
                                  </div>
                                  {cr.whyThisWorks && (
                                    <div style={{ margin: '0 16px 14px', padding: '8px 12px', borderRadius: 8, background: S.purpleSoft, border: `1px solid ${S.purpleLine}`, fontSize: 13, color: S.purple, lineHeight: 1.5 }}>
                                      {cr.whyThisWorks}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                  )}
                </div>

                {/* Why matched */}
                {selected.scoringReasoning && (
                  <div style={{ background: S.card, border: `1px solid ${S.line}`, borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: S.purpleSoft, color: S.purple, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: S.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        Why this matched
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4, background: S.purpleSoft, color: S.purple, fontWeight: 600 }}>
                          AI rationale
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 16, color: S.text2, lineHeight: 1.55 }}>{selected.scoringReasoning}</p>
                    </div>
                  </div>
                )}

                {/* AI Reply */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <SectionHead left="AI-drafted reply" right={reply ? <>Version <b style={{ color: S.text2, fontWeight: 600 }}>V{reply.version}</b></> : undefined} />
                  {reply ? (
                    <div style={{ background: S.card, border: `1px solid ${S.line}`, borderRadius: 14, overflow: 'hidden' }}>
                      {/* Reply header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${S.line}`, background: S.panel2, flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: S.orangeSoft, color: S.orange2, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                          <span>✦</span> AI reply
                        </span>
                        {/* Pitch toggle — auto-regenerates on click */}
                        <button
                          onClick={() => {
                            const next = !effectivePitch
                            setIncludePitch(next)
                            handleRegen(next)
                          }}
                          disabled={loading === 'regen'}
                          title={effectivePitch ? 'Link included — click to remove and regenerate' : 'No link — click to add and regenerate'}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 9px', borderRadius: 6,
                            cursor: loading === 'regen' ? 'not-allowed' : 'pointer',
                            fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                            fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase',
                            border: `1px solid ${effectivePitch ? S.greenLine : S.line}`,
                            background: effectivePitch ? S.greenSoft : S.line,
                            color: effectivePitch ? S.green : S.text4,
                            opacity: loading === 'regen' ? 0.5 : 1,
                            transition: 'all .15s',
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            {effectivePitch
                              ? <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>
                              : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                            }
                          </svg>
                          {effectivePitch ? 'Link on' : 'No link'}
                        </button>
                        {reply.toneUsed && (
                          <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, background: S.card, border: `1px solid ${S.line}`, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: S.text2, letterSpacing: '.04em' }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: S.orange, display: 'inline-block', flexShrink: 0 }} />
                            {reply.toneUsed}
                          </div>
                        )}
                      </div>
                      {/* Reply body */}
                      {editMode ? (
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          rows={9}
                          style={{ width: '100%', padding: '18px 20px', color: S.text, fontSize: 16, lineHeight: 1.65, background: S.card, border: 'none', outline: `1px solid ${S.orange}`, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', display: 'block' }}
                        />
                      ) : (
                        <div style={{ padding: '18px 20px', color: S.text, fontSize: 16, lineHeight: 1.65 }}>
                          {replyText.split('\n').filter(Boolean).map((p, i) => (
                            <p key={i} style={{ margin: i > 0 ? '12px 0 0' : 0 }}>{p}</p>
                          ))}
                        </div>
                      )}
                      {/* Reply footer */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderTop: `1px solid ${S.line}`, background: S.panel2 }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: S.text3 }}>
                          📝 <b style={{ color: S.text2 }}>{wordCount(replyText)}</b> words
                        </span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: S.text3 }}>
                          🎯 <b style={{ color: S.text2 }}>{selected.intentScore}%</b> match
                        </span>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                          <button className="ib-btn-ghost" onClick={() => handleRegen()} disabled={loading === 'regen'} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 7, fontSize: 13, fontWeight: 500, background: S.panel, border: `1px solid ${S.line}`, color: S.text, cursor: loading === 'regen' ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading === 'regen' ? 'ib-spin' : undefined}>
                              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                            </svg>
                            {loading === 'regen' ? 'Generating…' : 'Regenerate'}
                          </button>
                          <button className="ib-btn-ghost" onClick={() => setEditMode(e => !e)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 7, fontSize: 13, fontWeight: 500, background: editMode ? S.orangeSoft : S.panel, border: `1px solid ${editMode ? S.orangeLine : S.line}`, color: editMode ? S.orange2 : S.text, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                            {editMode ? 'Done' : 'Edit'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: S.card, border: `1px solid ${S.line}`, borderRadius: 14, padding: '32px', textAlign: 'center' }}>
                      <p style={{ fontSize: 16, color: S.text3, margin: '0 0 6px' }}>No reply drafted yet.</p>
                      <p style={{ fontSize: 13, color: S.text4, margin: '0 0 18px' }}>Uses 1 reply credit from your monthly limit.</p>
                      <button onClick={() => handleRegen()} disabled={loading === 'regen'} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 7, fontSize: 15, fontWeight: 600, background: S.orange, border: 'none', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.18)' }}>
                        {loading === 'regen' ? (
                          <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ib-spin"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>Drafting…</>
                        ) : (
                          <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Draft reply</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Why this works */}
                  {reply?.whyThisWorks && (
                    <div style={{ padding: '14px 18px', borderRadius: 10, background: S.purpleSoft, border: `1px solid ${S.purpleLine}`, fontSize: 16, color: S.purple, lineHeight: 1.55 }}>
                      {reply.whyThisWorks}
                    </div>
                  )}
                </div>

              </div>

              {/* Sticky action bar */}
              <div style={{ position: 'sticky', bottom: 0, left: 0, right: 0, background: `linear-gradient(180deg, transparent, ${S.bg} 28%)`, padding: '18px 32px 22px', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: S.panel, border: `1px solid ${S.line2}`, borderRadius: 14, boxShadow: '0 16px 40px -10px rgba(0,0,0,.35)', maxWidth: 780, width: '100%' }}>
                  <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                    {/* Copy */}
                    <button onClick={handleCopy} disabled={!reply} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 7, fontSize: 15, fontWeight: 600, background: copied ? S.green : S.orange, color: '#fff', border: 'none', cursor: !reply ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background .15s', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.18)' }}>
                      {copied ? (
                        <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
                      ) : (
                        <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy reply</>
                      )}
                    </button>
                    {/* Open thread */}
                    <a href={selected.redditPostUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 7, fontSize: 15, fontWeight: 500, background: S.panel2, border: `1px solid ${S.line}`, color: S.text, textDecoration: 'none' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Open thread
                    </a>
                  </div>
                  <div style={{ display: 'flex', gap: 6, paddingLeft: 10, borderLeft: `1px solid ${S.line}` }}>
                    {activeStatus === 'QUEUED' && (
                      <button onClick={handleMarkDone} disabled={!!loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 7, fontSize: 15, fontWeight: 600, background: S.greenSoft, border: `1px solid ${S.greenLine}`, color: S.green, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>
                        {loading === 'done' ? 'Marking…' : 'Done'}
                      </button>
                    )}
                    <button onClick={handleSkip} disabled={!!loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 7, fontSize: 15, fontWeight: 500, background: S.panel2, border: `1px solid ${S.line}`, color: S.text, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      {loading === 'skip' ? 'Dismissing…' : 'Dismiss'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: S.bg }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 13, background: S.panel, border: `1px solid ${S.line2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ color: S.text4 }}><path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
              </div>
              <p style={{ fontSize: 18, color: S.text3, fontWeight: 600, margin: '0 0 6px' }}>Select a thread</p>
              <p style={{ fontSize: 15, color: S.text4, margin: 0 }}>Pick one from the inbox list</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function Dot() {
  return <span style={{ width: 3, height: 3, borderRadius: '50%', background: S.text4, display: 'inline-block', flexShrink: 0 }} />
}

function Kbd({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, padding: '2px 5px', borderRadius: 4, background: S.line, border: `1px solid ${S.line}`, color: S.text3, marginLeft: 2, ...style }}>
      {children}
    </span>
  )
}

function CheckIc()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg> }
function PersonIc() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 14 0v1"/></svg> }
function TrendIc()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18"/><polyline points="7 14 11 10 14 13 21 6"/></svg> }
function AlertIc()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
