'use client'

import { useState } from 'react'

const LEADS = [
  {
    id: 1,
    num: '01',
    sub: 'r/SaaS',
    time: '12m ago',
    title: "Tired of Loom pricing going up again — anyone switched to a cheaper screen recorder that still works well?",
    tags: [{ label: 'Competitor', cls: 'red' }, { label: 'Switching', cls: 'orange' }],
    score: 94,
    reply: "Same boat. Moved our team to ScreenPilot about 3 months back — it's roughly a fifth of Loom's cost and the async comment threads work better IMO. No sign-up required for viewers either, which removes so much friction. Free tier is solid if you want to test it first.",
  },
  {
    id: 2,
    num: '02',
    sub: 'r/Entrepreneur',
    time: '38m ago',
    title: "What's the best screen recording tool for client demos? Mine have terrible completion rates.",
    tags: [{ label: 'Workflow pain', cls: 'orange' }, { label: 'Tool search', cls: 'blue' }],
    score: 88,
    reply: "Short chapters + auto-trimmed silence made the biggest difference for us. ScreenPilot does both automatically and adds click highlights so viewers can follow without getting lost. Our completion rate went from ~25% to over 70% almost immediately after switching.",
  },
  {
    id: 3,
    num: '03',
    sub: 'r/indiehackers',
    time: '2h ago',
    title: "How are you handling async communication with remote clients — recordings, docs, or something else?",
    tags: [{ label: 'Tool search', cls: 'blue' }],
    score: 79,
    reply: null,
  },
  {
    id: 4,
    num: '04',
    sub: 'r/startups',
    time: '3h ago',
    title: "Is anyone successfully using screen recordings for sales demos? ROI worth it?",
    tags: [{ label: 'ROI pain', cls: 'orange' }],
    score: 74,
    reply: null,
  },
]

export function InteractiveDemo() {
  const [activeReply, setActiveReply] = useState<number | null>(null)
  const [shown, setShown] = useState<Set<number>>(new Set())

  function handleGenerate(id: number) {
    if (activeReply === id) {
      setActiveReply(null)
    } else {
      setActiveReply(id)
      setShown(prev => new Set([...prev, id]))
    }
  }

  return (
    <div style={{
      background: 'var(--paper)', border: '1px solid var(--line-2)', borderRadius: 16,
      overflow: 'hidden', boxShadow: '0 32px 64px -32px rgba(60,40,20,.18)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--cream)',
      }}>
        <div style={{ fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', fontSize: 17, fontWeight: 600 }}>
          Fresh leads · last 24h
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '.1em',
          textTransform: 'uppercase', color: 'var(--orange)', fontWeight: 600,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--orange)', display: 'inline-block', animation: 'pulse 1.4s ease infinite' }} />
          Live · 18 new
        </div>
      </div>

      {/* Lead list */}
      <div style={{ padding: '8px 8px 12px' }}>
        {LEADS.map(lead => {
          const isOpen = activeReply === lead.id
          const wasShown = shown.has(lead.id)
          return (
            <div key={lead.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'start',
                padding: '14px 12px', borderRadius: 8, transition: 'background .15s ease',
              }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--ink-3)', width: 22, textAlign: 'right', paddingTop: 3 }}>
                  {lead.num}
                </span>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
                    {lead.sub}
                    <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>· {lead.time}</span>
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--ink)' }}>{lead.title}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {lead.tags.map(tag => (
                      <span key={tag.label} style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5,
                        padding: '3px 9px', borderRadius: 4, fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '.04em',
                        background: tag.cls === 'red' ? 'var(--red-soft)' : tag.cls === 'blue' ? '#E3EAF6' : 'var(--orange-soft)',
                        color: tag.cls === 'red' ? 'var(--red)' : tag.cls === 'blue' ? 'var(--blue)' : '#9c2f0d',
                      }}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, fontWeight: 700,
                    color: 'var(--orange)', background: 'var(--orange-soft)', padding: '3px 9px', borderRadius: 4,
                  }}>{lead.score}%</span>
                  {lead.reply ? (
                    <button
                      onClick={() => handleGenerate(lead.id)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600,
                        border: isOpen ? '1px solid var(--orange)' : '1px solid var(--line-2)',
                        padding: '6px 13px', borderRadius: 6,
                        color: isOpen ? 'var(--orange)' : 'var(--ink-2)',
                        background: isOpen ? 'var(--orange-soft)' : 'var(--cream)',
                        cursor: 'pointer', transition: 'all .15s ease', whiteSpace: 'nowrap',
                      }}
                    >
                      {wasShown && !isOpen ? '✓ Draft ready' : isOpen ? '✕ Close' : '⚡ AI reply'}
                    </button>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600,
                      border: '1px solid var(--line-2)', padding: '6px 13px', borderRadius: 6,
                      color: 'var(--ink-3)', background: 'var(--cream)',
                    }}>
                      ⚡ Draft ready
                    </span>
                  )}
                </div>
              </div>

              {/* Reply panel */}
              {lead.reply && (
                <div style={{
                  maxHeight: isOpen ? 240 : 0,
                  overflow: 'hidden',
                  transition: 'max-height .35s ease',
                }}>
                  <div style={{ padding: '0 12px 16px 46px' }}>
                    <div style={{
                      background: 'var(--cream)', border: '1px solid var(--line)',
                      borderRadius: 10, padding: '14px 16px',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.1em',
                        textTransform: 'uppercase', color: 'var(--orange)', fontWeight: 600,
                      }}>
                        <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--orange)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                        </span>
                        AI-drafted reply · ready to copy
                      </div>
                      <p style={{ fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
                        {lead.reply}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '.08em' }}>
                          You paste this on Reddit · no API access
                        </span>
                        <button style={{
                          background: 'var(--green-soft)', color: 'var(--green)', border: '1px solid rgba(31,107,63,.2)',
                          borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700,
                          fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', letterSpacing: '.04em',
                        }}>
                          ⊕ Copy reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px', borderTop: '1px solid var(--line)', background: 'var(--cream)',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, color: 'var(--ink-3)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>Leads from last 24h · always warm</span>
        <span>Showing 4 / 18 · <span style={{ color: 'var(--orange)', fontWeight: 600 }}>click ⚡ to see AI draft</span></span>
      </div>
    </div>
  )
}
