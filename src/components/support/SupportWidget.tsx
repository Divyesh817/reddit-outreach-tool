'use client'

import { useState, useEffect, useRef } from 'react'
import { S } from '@/lib/theme'

interface Message {
  id: string
  content: string
  isAdmin: boolean
  createdAt: string
}

interface Ticket {
  id: string
  subject: string
  status: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}

type View = 'list' | 'thread' | 'new'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  open:        { label: 'Open',        color: '#E54B1B' },
  in_progress: { label: 'In progress', color: '#D69B14' },
  resolved:    { label: 'Resolved',    color: '#1F6B3F' },
}

export function SupportWidget() {
  const [open, setOpen]           = useState(false)
  const [view, setView]           = useState<View>('list')
  const [tickets, setTickets]     = useState<Ticket[]>([])
  const [active, setActive]       = useState<Ticket | null>(null)
  const [loading, setLoading]     = useState(false)
  const [reply, setReply]         = useState('')
  const [sending, setSending]     = useState(false)
  const [subject, setSubject]     = useState('')
  const [firstMsg, setFirstMsg]   = useState('')
  const [creating, setCreating]   = useState(false)
  const [unread, setUnread]       = useState(0)
  const bottomRef                 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) loadTickets()
  }, [open])

  useEffect(() => {
    if (active) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.messages.length])

  async function loadTickets() {
    setLoading(true)
    try {
      const res = await fetch('/api/support/tickets')
      if (res.ok) {
        const data: Ticket[] = await res.json()
        setTickets(data)
        const u = data.filter(t => t.messages.some(m => m.isAdmin)).length
        setUnread(u)
      }
    } finally {
      setLoading(false)
    }
  }

  async function createTicket() {
    if (!subject.trim() || !firstMsg.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message: firstMsg }),
      })
      if (res.ok) {
        const ticket: Ticket = await res.json()
        setTickets(prev => [ticket, ...prev])
        setActive(ticket)
        setView('thread')
        setSubject('')
        setFirstMsg('')
      }
    } finally {
      setCreating(false)
    }
  }

  async function sendReply() {
    if (!reply.trim() || !active) return
    setSending(true)
    try {
      const res = await fetch(`/api/support/tickets/${active.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reply }),
      })
      if (res.ok) {
        const msg: Message = await res.json()
        const updated = { ...active, messages: [...active.messages, msg] }
        setActive(updated)
        setTickets(prev => prev.map(t => t.id === active.id ? updated : t))
        setReply('')
      }
    } finally {
      setSending(false)
    }
  }

  const panelStyle: React.CSSProperties = {
    position: 'fixed', bottom: 88, right: 24, width: 360, maxHeight: '70vh',
    background: S.panel, border: `1px solid ${S.line2}`, borderRadius: 16,
    boxShadow: '0 20px 60px rgba(0,0,0,.25)', display: 'flex', flexDirection: 'column',
    zIndex: 200, overflow: 'hidden',
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Support"
        style={{
          position: 'fixed', bottom: 24, right: 24, width: 52, height: 52,
          borderRadius: '50%', background: S.orange2, border: 'none',
          cursor: 'pointer', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(229,75,27,.45)',
          transition: 'transform .15s ease',
        }}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4, width: 16, height: 16,
                borderRadius: '50%', background: '#fff', fontSize: 10, fontWeight: 700,
                color: S.orange2, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{unread}</span>
            )}
          </>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={panelStyle}>
          {/* Panel header */}
          <div style={{
            padding: '14px 18px', borderBottom: `1px solid ${S.line}`,
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            {(view === 'thread' || view === 'new') && (
              <button
                onClick={() => { setView('list'); setActive(null) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.text3, padding: 0, display: 'flex' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            )}
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: S.text }}>
                {view === 'new' ? 'New ticket' : view === 'thread' && active ? active.subject : 'Support'}
              </p>
              {view === 'thread' && active && (
                <p style={{ margin: 0, fontSize: 11, color: S.text4, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {STATUS_LABEL[active.status]?.label}
                </p>
              )}
              {view === 'list' && (
                <p style={{ margin: 0, fontSize: 12, color: S.text4 }}>We typically reply within 24h</p>
              )}
            </div>
            {view === 'list' && (
              <button
                onClick={() => setView('new')}
                style={{
                  marginLeft: 'auto', padding: '5px 12px', background: S.orange2, color: '#fff',
                  border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                + New
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>

            {/* List view */}
            {view === 'list' && (
              loading ? (
                <p style={{ textAlign: 'center', color: S.text4, fontSize: 13, marginTop: 24 }}>Loading…</p>
              ) : tickets.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 32 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: S.text3, margin: '0 0 6px' }}>No tickets yet</p>
                  <p style={{ fontSize: 13, color: S.text4, margin: 0 }}>Got a question? Tap + New to raise one.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tickets.map(t => {
                    const st = STATUS_LABEL[t.status]
                    const last = t.messages[t.messages.length - 1]
                    return (
                      <button
                        key={t.id}
                        onClick={() => { setActive(t); setView('thread') }}
                        style={{
                          background: S.panel2, border: `1px solid ${S.line}`, borderRadius: 10,
                          padding: '10px 12px', textAlign: 'left', cursor: 'pointer', width: '100%',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: S.text, lineHeight: 1.3 }}>{t.subject}</p>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                            background: t.status === 'resolved' ? 'rgba(31,107,63,.15)' : t.status === 'in_progress' ? 'rgba(214,155,20,.15)' : 'rgba(229,75,27,.12)',
                            color: st?.color, whiteSpace: 'nowrap', flexShrink: 0,
                            fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '.05em',
                          }}>{st?.label}</span>
                        </div>
                        {last && (
                          <p style={{ margin: '5px 0 0', fontSize: 12, color: S.text4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {last.isAdmin ? '← ' : ''}{last.content}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            )}

            {/* New ticket view */}
            {view === 'new' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: S.text3, textTransform: 'uppercase', letterSpacing: '.06em' }}>Subject</p>
                  <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="What do you need help with?"
                    style={{
                      width: '100%', background: S.card, border: `1px solid ${S.line2}`,
                      borderRadius: 8, padding: '9px 12px', color: S.text, fontSize: 13,
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: S.text3, textTransform: 'uppercase', letterSpacing: '.06em' }}>Message</p>
                  <textarea
                    value={firstMsg}
                    onChange={e => setFirstMsg(e.target.value)}
                    placeholder="Describe your issue in detail…"
                    rows={5}
                    style={{
                      width: '100%', background: S.card, border: `1px solid ${S.line2}`,
                      borderRadius: 8, padding: '9px 12px', color: S.text, fontSize: 13,
                      outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                    }}
                  />
                </div>
                <button
                  onClick={createTicket}
                  disabled={creating || !subject.trim() || !firstMsg.trim()}
                  style={{
                    padding: '10px', background: S.orange2, color: '#fff', border: 'none',
                    borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    opacity: creating || !subject.trim() || !firstMsg.trim() ? 0.5 : 1,
                  }}
                >
                  {creating ? 'Sending…' : 'Send ticket'}
                </button>
              </div>
            )}

            {/* Thread view */}
            {view === 'thread' && active && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {active.messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.isAdmin ? 'flex-start' : 'flex-end',
                    }}
                  >
                    <div style={{
                      maxWidth: '82%', padding: '9px 13px', borderRadius: 10,
                      background: msg.isAdmin ? S.panel2 : S.orange2,
                      border: msg.isAdmin ? `1px solid ${S.line}` : 'none',
                    }}>
                      {msg.isAdmin && (
                        <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: S.orange2, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'JetBrains Mono, monospace' }}>
                          Redgrow Support
                        </p>
                      )}
                      <p style={{ margin: 0, fontSize: 13, color: msg.isAdmin ? S.text : '#fff', lineHeight: 1.5 }}>
                        {msg.content}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: 10, color: msg.isAdmin ? S.text4 : 'rgba(255,255,255,.6)', textAlign: 'right' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Reply input for thread view */}
          {view === 'thread' && active && active.status !== 'resolved' && (
            <div style={{ padding: '10px 12px', borderTop: `1px solid ${S.line}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                  placeholder="Reply…"
                  style={{
                    flex: 1, background: S.card, border: `1px solid ${S.line2}`,
                    borderRadius: 8, padding: '8px 12px', color: S.text, fontSize: 13,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                  style={{
                    background: S.orange2, color: '#fff', border: 'none',
                    borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700,
                    opacity: sending || !reply.trim() ? 0.5 : 1,
                  }}
                >
                  {sending ? '…' : '→'}
                </button>
              </div>
            </div>
          )}
          {view === 'thread' && active?.status === 'resolved' && (
            <div style={{ padding: '10px 14px', borderTop: `1px solid ${S.line}`, background: S.greenSoft, flexShrink: 0, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 12, color: S.green, fontWeight: 600 }}>✓ Ticket resolved</p>
            </div>
          )}
        </div>
      )}
    </>
  )
}
