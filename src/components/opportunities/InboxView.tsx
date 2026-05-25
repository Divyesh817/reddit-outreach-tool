'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PAIN_TYPE_LABELS, type PainType } from '@/types'
import { S } from '@/lib/theme'


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
  subreddit: { name: string }
  replies: Reply[]
  product: { id: string; name: string }
}

const PAIN_COLORS: Record<PainType, { text: string; bg: string }> = {
  switching_intent: { text: S.red, bg: S.redSoft },
  competitor_frustration: { text: S.orange, bg: S.orangeSoft },
  active_tool_search: { text: S.blue, bg: S.blueSoft },
  roi_frustration: { text: S.amber, bg: S.amberSoft },
  workflow_pain: { text: S.purple, bg: S.purpleSoft },
}

const STATUS_TABS = [
  { key: 'QUEUED', label: 'New' },
  { key: 'POSTED', label: 'Done' },
  { key: 'SKIPPED', label: 'Dismissed' },
]

function timeAgo(date: string) {
  const h = Math.floor((Date.now() - new Date(date).getTime()) / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function IntentBadge({ score }: { score: number }) {
  const color = score >= 80 ? S.green : score >= 60 ? S.amber : S.text4
  const bg = score >= 80 ? S.greenSoft : score >= 60 ? S.amberSoft : 'rgba(94,84,74,.15)'
  return (
    <span style={{
      fontSize: 13, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
      color, background: bg, fontFamily: 'JetBrains Mono, monospace',
      border: `1px solid ${color}33`,
    }}>
      {score}
    </span>
  )
}

export function InboxView({
  opportunities: initial,
  total,
  currentStatus,
  productName,
}: {
  opportunities: Opportunity[]
  total: number
  currentStatus: string
  productName: string
}) {
  const router = useRouter()
  const [opps, setOpps] = useState(initial)
  const [painFilter, setPainFilter] = useState<PainType | 'all'>('all')
  const [selected, setSelected] = useState<Opportunity | null>(initial[0] ?? null)
  const [replyText, setReplyText] = useState(initial[0]?.replies[0]?.text ?? '')
  const [loading, setLoading] = useState<'done' | 'skip' | 'regen' | null>(null)
  const [copied, setCopied] = useState(false)
  const [scanning, setScanning] = useState(false)

  const filteredOpps = painFilter === 'all' ? opps : opps.filter(o => o.painType === painFilter)

  function selectOpp(opp: Opportunity) {
    setSelected(opp)
    setReplyText(opp.replies[0]?.text ?? '')
    setCopied(false)
  }

  function switchTab(status: string) {
    router.push(`/opportunities?status=${status}`)
  }

  async function handleCopy() {
    if (!replyText) return
    await navigator.clipboard.writeText(replyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleMarkDone() {
    if (!selected) return
    setLoading('done')
    await fetch(`/api/opportunities/${selected.id}/approve`, { method: 'POST' })
    const next = opps.filter(o => o.id !== selected.id)
    setOpps(next)
    setSelected(next[0] ?? null)
    setReplyText(next[0]?.replies[0]?.text ?? '')
    setCopied(false)
    setLoading(null)
  }

  async function handleSkip() {
    if (!selected) return
    setLoading('skip')
    await fetch(`/api/opportunities/${selected.id}/skip`, { method: 'POST' })
    const next = opps.filter(o => o.id !== selected.id)
    setOpps(next)
    setSelected(next[0] ?? null)
    setReplyText(next[0]?.replies[0]?.text ?? '')
    setCopied(false)
    setLoading(null)
  }

  async function handleRegen() {
    if (!selected) return
    setLoading('regen')
    const res = await fetch(`/api/opportunities/${selected.id}/regenerate`, { method: 'POST' })
    if (res.ok) {
      const { data } = await res.json()
      const newReply: Reply = { id: data.id, text: data.text, toneUsed: data.toneUsed, whyThisWorks: data.whyThisWorks, version: data.version }
      setReplyText(data.text)
      setCopied(false)
      setSelected(s => s ? { ...s, replies: [newReply] } : s)
      setOpps(os => os.map(o => o.id === selected.id ? { ...o, replies: [newReply] } : o))
    }
    setLoading(null)
  }

  async function handleScan() {
    setScanning(true)
    await fetch('/api/scan', { method: 'POST' }).catch(() => null)
    setTimeout(() => {
      setScanning(false)
      router.refresh()
    }, 1500)
  }

  const reply = selected?.replies[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: S.bg }}>

      {/* Toolbar */}
      <div style={{
        padding: '14px 24px', borderBottom: `1px solid ${S.line2}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: S.panel, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: S.text, margin: 0, letterSpacing: '-.02em' }}>
            Inbox
          </h1>
          <span style={{
            fontSize: 14, color: S.text3, background: S.panel2, padding: '2px 10px',
            borderRadius: 20, fontWeight: 600, border: `1px solid ${S.line2}`,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {productName}
          </span>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
            background: scanning ? S.panel2 : S.orange,
            color: scanning ? S.text3 : '#fff', border: 'none',
            borderRadius: 8, fontSize: 15, fontWeight: 700,
            cursor: scanning ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'background .12s',
          }}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          {scanning ? 'Scanning…' : 'Scan now'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', borderBottom: `1px solid ${S.line2}`,
        background: S.panel, padding: '0 24px', flexShrink: 0,
      }}>
        {STATUS_TABS.map(tab => {
          const active = currentStatus === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              style={{
                padding: '10px 0', marginRight: 22, fontSize: 15, fontWeight: 600,
                color: active ? S.orange : S.text3, background: 'none', border: 'none',
                borderBottom: active ? `2px solid ${S.orange}` : '2px solid transparent',
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1,
                transition: 'color .12s',
              }}
            >
              {tab.label}
              {tab.key === 'QUEUED' && total > 0 && (
                <span style={{
                  marginLeft: 6, background: S.orange, color: '#fff',
                  fontSize: 12, fontWeight: 800, borderRadius: 10, padding: '1px 5px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {total}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Pain-type filter chips */}
      {currentStatus === 'QUEUED' && opps.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 24px',
          background: S.panel, borderBottom: `1px solid ${S.line}`, flexShrink: 0,
          overflowX: 'auto',
        }}>
          {([
            { key: 'all',                    label: 'All' },
            { key: 'competitor_frustration', label: 'Competitor' },
            { key: 'switching_intent',       label: 'Switching' },
            { key: 'active_tool_search',     label: 'Tool search' },
            { key: 'roi_frustration',        label: 'ROI pain' },
            { key: 'workflow_pain',          label: 'Workflow' },
          ] as { key: PainType | 'all'; label: string }[]).map(f => {
            const active = painFilter === f.key
            const pain = f.key !== 'all' ? PAIN_COLORS[f.key] : null
            const count = f.key === 'all' ? opps.length : opps.filter(o => o.painType === f.key).length
            if (f.key !== 'all' && count === 0) return null
            return (
              <button
                key={f.key}
                onClick={() => {
                  setPainFilter(f.key)
                  const first = f.key === 'all' ? opps[0] : opps.find(o => o.painType === f.key) ?? null
                  if (first) { setSelected(first); setReplyText(first.replies[0]?.text ?? ''); setCopied(false) }
                }}
                style={{
                  padding: '4px 11px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                  border: `1px solid ${active ? (pain?.text ?? S.orange) : S.line2}`,
                  background: active ? (pain ? pain.bg : S.orangeSoft) : 'transparent',
                  color: active ? (pain?.text ?? S.orange) : S.text3,
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  transition: 'all .12s', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                {f.label}
                <span style={{
                  fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                  color: active ? 'inherit' : S.text4,
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Split panel */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* Left list */}
        <div style={{
          width: 340, flexShrink: 0, borderRight: `1px solid ${S.line2}`,
          overflowY: 'auto', background: S.panel,
        }}>
          {filteredOpps.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: S.panel2,
                border: `1px solid ${S.line2}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 14px',
              }}>
                <svg width="22" height="22" fill="none" stroke={S.text4} strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2.5"/>
                  <path d="M2 8l10 7 10-7"/>
                </svg>
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: S.text3, margin: '0 0 6px' }}>
                {currentStatus === 'QUEUED' ? 'Inbox empty' : 'Nothing here yet'}
              </p>
              {currentStatus === 'QUEUED' && (
                <p style={{ fontSize: 15, color: S.text4, lineHeight: 1.5 }}>
                  Hit "Scan now" to find new threads.
                </p>
              )}
            </div>
          ) : filteredOpps.map(opp => {
            const isSelected = selected?.id === opp.id
            const pain = PAIN_COLORS[opp.painType]
            return (
              <button
                key={opp.id}
                onClick={() => selectOpp(opp)}
                style={{
                  width: '100%', textAlign: 'left', padding: '13px 18px',
                  background: isSelected ? S.panel2 : 'transparent',
                  border: 'none', borderBottom: `1px solid ${S.line}`,
                  cursor: 'pointer', fontFamily: 'inherit',
                  borderLeft: isSelected ? `2px solid ${S.orange}` : `2px solid transparent`,
                  transition: 'background .1s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    color: pain.text, background: pain.bg,
                    textTransform: 'uppercase', letterSpacing: '.04em',
                    fontFamily: 'JetBrains Mono, monospace', flexShrink: 0,
                  }}>
                    {PAIN_TYPE_LABELS[opp.painType]}
                  </span>
                  <IntentBadge score={opp.intentScore} />
                  <span style={{ fontSize: 13, color: S.text4, marginLeft: 'auto', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>
                    {timeAgo(opp.redditPostedAt)}
                  </span>
                </div>
                <p style={{
                  fontSize: 15, fontWeight: 600, color: S.text, margin: 0, lineHeight: 1.4,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {opp.redditPostTitle}
                </p>
                <p style={{ fontSize: 13, color: S.text4, marginTop: 5, fontFamily: 'JetBrains Mono, monospace' }}>
                  r/{opp.subreddit.name} · u/{opp.redditAuthor}
                </p>
              </button>
            )
          })}
        </div>

        {/* Right detail */}
        {selected ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '22px 28px', background: S.bg }}>

            {/* Post card */}
            <div style={{
              background: S.panel, borderRadius: 12, border: `1px solid ${S.line2}`,
              padding: '18px 22px', marginBottom: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 13, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
                  color: PAIN_COLORS[selected.painType].text, background: PAIN_COLORS[selected.painType].bg,
                  textTransform: 'uppercase', letterSpacing: '.04em', fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {PAIN_TYPE_LABELS[selected.painType]}
                </span>
                <IntentBadge score={selected.intentScore} />
                {!selected.shouldPitch && (
                  <span style={{
                    fontSize: 13, fontWeight: 700, color: S.red, background: S.redSoft,
                    padding: '3px 8px', borderRadius: 5, fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    ⚠ no pitch
                  </span>
                )}
              </div>

              <a
                href={selected.redditPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 18, fontWeight: 700, color: S.text, textDecoration: 'none', lineHeight: 1.4, display: 'block' }}
              >
                {selected.redditPostTitle}
                <span style={{ fontSize: 14, color: S.text4, fontWeight: 400, marginLeft: 6 }}>↗</span>
              </a>

              <p style={{ fontSize: 14, color: S.text4, marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                r/{selected.subreddit.name} · u/{selected.redditAuthor} · {timeAgo(selected.redditPostedAt)} · ▲ {selected.redditScore} · {selected.redditCommentCount} comments
              </p>

              {selected.redditPostBody && (
                <p style={{
                  fontSize: 15, color: S.text3, marginTop: 12, lineHeight: 1.6,
                  background: S.card, borderRadius: 8, padding: '10px 14px',
                  display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {selected.redditPostBody}
                </p>
              )}

              {selected.scoringReasoning && (
                <p style={{
                  fontSize: 15, color: S.purple, marginTop: 10, fontStyle: 'italic',
                  background: S.purpleSoft, borderRadius: 8, padding: '8px 12px',
                }}>
                  {selected.scoringReasoning}
                </p>
              )}
            </div>

            {/* Reply draft */}
            <div style={{
              background: S.panel, borderRadius: 12, border: `1px solid ${S.line2}`,
              padding: '18px 22px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: S.text, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  AI Reply {reply && reply.version > 1 ? `(v${reply.version})` : ''}
                </span>
                {reply?.toneUsed && (
                  <span style={{
                    fontSize: 13, color: S.text3, background: S.card,
                    padding: '3px 8px', borderRadius: 6, border: `1px solid ${S.line2}`,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>
                    {reply.toneUsed}
                  </span>
                )}
              </div>

              {reply ? (
                <>
                  <textarea
                    value={replyText}
                    onChange={e => { setReplyText(e.target.value); setCopied(false) }}
                    rows={6}
                    style={{
                      width: '100%', fontSize: 16, lineHeight: 1.65, color: S.text2,
                      background: S.card, border: `1px solid ${S.line2}`, borderRadius: 8,
                      padding: '12px 14px', fontFamily: 'inherit', resize: 'vertical',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  {reply.whyThisWorks && (
                    <p style={{
                      fontSize: 15, color: S.purple, marginTop: 10,
                      background: S.purpleSoft, borderRadius: 8, padding: '10px 14px',
                      border: `1px solid rgba(155,139,244,.2)`,
                    }}>
                      {reply.whyThisWorks}
                    </p>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', background: S.card, borderRadius: 8 }}>
                  <p style={{ fontSize: 16, color: S.text4 }}>No reply generated yet.</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${S.line}`, alignItems: 'center' }}>
                {/* Copy */}
                <button
                  onClick={handleCopy}
                  disabled={!reply || loading !== null}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', background: copied ? S.green : S.orange,
                    color: '#fff', border: 'none', borderRadius: 8, fontSize: 15,
                    fontWeight: 700, cursor: (!reply || loading !== null) ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'background .15s',
                  }}
                >
                  {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy reply</>}
                </button>

                {/* Open thread */}
                <a
                  href={selected.redditPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                    background: S.panel2, border: `1px solid ${S.line2}`, borderRadius: 8,
                    fontSize: 15, fontWeight: 600, color: S.text2, textDecoration: 'none',
                  }}
                >
                  <RedditIcon /> Open thread
                </a>

                {/* Regen */}
                <button
                  onClick={handleRegen}
                  disabled={loading !== null}
                  style={{
                    padding: '9px 12px', background: 'transparent', border: `1px solid ${S.line2}`,
                    borderRadius: 8, fontSize: 16, fontWeight: 600, color: S.text3,
                    cursor: loading !== null ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {loading === 'regen' ? '…' : '↺'}
                </button>

                {/* Mark done / Skip */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  {currentStatus === 'QUEUED' && (
                    <button
                      onClick={handleMarkDone}
                      disabled={loading !== null}
                      style={{
                        padding: '9px 12px', background: S.greenSoft, border: `1px solid rgba(63,176,122,.3)`,
                        borderRadius: 8, fontSize: 14, fontWeight: 700, color: S.green,
                        cursor: loading !== null ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                        fontFamily_mono: 'JetBrains Mono, monospace',
                      } as any}
                    >
                      {loading === 'done' ? '…' : '✓ Done'}
                    </button>
                  )}
                  <button
                    onClick={handleSkip}
                    disabled={loading !== null}
                    style={{
                      padding: '9px 12px', background: 'transparent', border: 'none',
                      fontSize: 14, fontWeight: 600, color: S.text4,
                      cursor: loading !== null ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {loading === 'skip' ? '…' : 'Dismiss'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: S.bg }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, background: S.panel,
                border: `1px solid ${S.line2}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 14px',
              }}>
                <svg width="24" height="24" fill="none" stroke={S.text4} strokeWidth="1.4" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2.5"/>
                  <path d="M2 8l10 7 10-7"/>
                </svg>
              </div>
              <p style={{ fontSize: 16, color: S.text3, fontWeight: 600 }}>Select an opportunity</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CopyIcon() {
  return <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
}
function CheckIcon() {
  return <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
}
function RedditIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .379-.239l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/></svg>
}
