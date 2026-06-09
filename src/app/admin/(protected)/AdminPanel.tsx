'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailTemplate {
  id: string | null
  key: string
  name: string
  subject: string
  html: string
  variables: string
  isCustomised: boolean
}

interface AiPrompt {
  id: string | null
  key: string
  name: string
  content: string
  isCustomised: boolean
}

interface AdminData {
  users: {
    total: number
    byPlan: Record<string, number>
    recent: { id: string; email: string; name: string | null; plan: string; createdAt: string }[]
  }
  products: { total: number }
  opportunities: { total: number }
  posted: { total: number }
  payments: {
    totalRevenue: number
    revenueIsMrr: boolean
    activeSubCount: number
    totalPayments: number
    recentPayments: { id: string; amount: number; currency: string; status: string; email: string; createdAt: string }[]
    paidCustomers: { email: string; name: string; plan: string; subscriptionId: string; createdAt: string }[]
  } | null
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  wrap: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' } as React.CSSProperties,
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 } as React.CSSProperties,
  logo: { fontSize: 20, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-.02em' } as React.CSSProperties,
  dot: { display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#E54B1B', marginRight: 6, verticalAlign: 'middle' } as React.CSSProperties,
  badge: { fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' as const, color: '#E54B1B', background: '#2a1510', padding: '3px 8px', borderRadius: 4 },
  tabs: { display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid #222' } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 600,
    color: active ? '#f5f5f5' : '#666',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid #E54B1B' : '2px solid transparent',
    cursor: 'pointer',
    marginBottom: -1,
  }),
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px 24px', marginBottom: 16 } as React.CSSProperties,
  label: { fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' as const, color: '#666', marginBottom: 8 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 } as React.CSSProperties,
  statCard: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '16px 20px' } as React.CSSProperties,
  statNum: { fontSize: 28, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-.02em', lineHeight: 1 } as React.CSSProperties,
  statLabel: { fontSize: 13, color: '#666', marginTop: 4 } as React.CSSProperties,
  input: { width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#f5f5f5', fontSize: 14, boxSizing: 'border-box' as const, outline: 'none' },
  textarea: { width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#f5f5f5', fontSize: 13, boxSizing: 'border-box' as const, outline: 'none', fontFamily: '"SF Mono", "Fira Code", monospace', resize: 'vertical' as const },
  btn: (variant: 'primary' | 'ghost' | 'danger'): React.CSSProperties => ({
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 700,
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    background: variant === 'primary' ? '#E54B1B' : variant === 'danger' ? '#3a1515' : '#222',
    color: variant === 'danger' ? '#ff6b6b' : '#f5f5f5',
  }),
  row: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 } as React.CSSProperties,
  planPill: (plan: string): React.CSSProperties => ({
    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
    background: plan === 'GROWTH' ? '#1a2e1a' : plan === 'STARTER' ? '#1a1a2e' : '#222',
    color: plan === 'GROWTH' ? '#4caf50' : plan === 'STARTER' ? '#7b8de8' : '#888',
  }),
  splitPane: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 } as React.CSSProperties,
  listItem: (active: boolean): React.CSSProperties => ({
    padding: '10px 14px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
    background: active ? '#2a2a2a' : 'transparent',
    border: active ? '1px solid #333' : '1px solid transparent',
  }),
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [tab, setTab] = useState<'emails' | 'users' | 'payments' | 'prompts' | 'support'>('emails')
  const [data, setData] = useState<AdminData | null>(null)
  const [dataLoading, setDataLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (data) return
    setDataLoading(true)
    try {
      const res = await fetch('/api/admin/data')
      if (res.ok) setData(await res.json())
    } finally {
      setDataLoading(false)
    }
  }, [data])

  useEffect(() => {
    if (tab === 'users' || tab === 'payments') loadData()
  }, [tab, loadData])

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.logo}><span style={s.dot} />Redgrow</span>
        <span style={s.badge}>Admin</span>
        <a
          href="/dashboard"
          style={{ marginLeft: 'auto', padding: '7px 16px', background: '#222', color: '#f5f5f5', border: '1px solid #333', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
        >
          Go to app →
        </a>
      </div>

      <div style={s.tabs}>
        {(['emails', 'users', 'payments', 'prompts', 'support'] as const).map(t => (
          <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'emails' && <EmailsTab />}
      {tab === 'users' && <UsersTab data={data} loading={dataLoading} />}
      {tab === 'payments' && <PaymentsTab data={data} loading={dataLoading} />}
      {tab === 'prompts' && <PromptsTab />}
      {tab === 'support' && <SupportTab />}
    </div>
  )
}

// ─── Emails Tab ───────────────────────────────────────────────────────────────

function EmailsTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selected, setSelected] = useState<EmailTemplate | null>(null)
  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [msg, setMsg] = useState('')
  const [previewMode, setPreviewMode] = useState<'code' | 'preview'>('code')

  useEffect(() => {
    fetch('/api/admin/email-templates').then(r => r.json()).then((t: unknown) => {
      if (!Array.isArray(t)) return
      setTemplates(t)
      if (t.length > 0) select(t[0])
    })
  }, [])

  function select(t: EmailTemplate) {
    setSelected(t)
    setSubject(t.subject)
    setHtml(t.html)
    setMsg('')
  }

  async function save() {
    if (!selected) return
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/email-templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: selected.key, subject, html }),
      })
      if (res.ok) {
        setMsg('Saved ✓')
        setTemplates(prev => prev.map(t => t.key === selected.key ? { ...t, subject, html, isCustomised: true } : t))
        setSelected(s => s ? { ...s, subject, html, isCustomised: true } : s)
      } else {
        setMsg('Save failed')
      }
    } finally {
      setSaving(false)
    }
  }

  async function reset() {
    if (!selected || !confirm('Reset to default?')) return
    await fetch('/api/admin/email-templates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: selected.key }),
    })
    const res = await fetch('/api/admin/email-templates')
    const t: EmailTemplate[] = await res.json()
    setTemplates(t)
    const fresh = t.find(x => x.key === selected.key)
    if (fresh) select(fresh)
    setMsg('Reset to default')
  }

  async function sendTest() {
    setTesting(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, html }),
      })
      const j = await res.json()
      setMsg(res.ok ? `Test sent ✓ (${j.id})` : `Failed: ${j.error}`)
    } finally {
      setTesting(false)
    }
  }

  const vars = selected ? (() => { try { return JSON.parse(selected.variables) } catch { return [] } })() : []

  return (
    <div style={s.splitPane}>
      {/* Sidebar */}
      <div>
        <div style={s.label}>Templates</div>
        {templates.map(t => (
          <div key={t.key} style={s.listItem(selected?.key === t.key)} onClick={() => select(t)}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f5f5f5' }}>{t.name}</div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
              {t.isCustomised ? <span style={{ color: '#E54B1B' }}>Customised</span> : 'Default'}
            </div>
          </div>
        ))}
      </div>

      {/* Editor */}
      {selected && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f5f5f5' }}>{selected.name}</div>
              {vars.length > 0 && (
                <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                  Variables: {vars.map((v: any) => <code key={v.name} style={{ background: '#222', padding: '1px 5px', borderRadius: 3, color: '#aaa', marginRight: 4 }}>{'{{' + v.name + '}}'}</code>)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={s.btn('ghost')} onClick={() => setPreviewMode(m => m === 'code' ? 'preview' : 'code')}>
                {previewMode === 'code' ? 'Preview' : 'Code'}
              </button>
              <button style={s.btn('ghost')} onClick={sendTest} disabled={testing}>
                {testing ? 'Sending…' : 'Send test'}
              </button>
              {selected.isCustomised && <button style={s.btn('danger')} onClick={reset}>Reset</button>}
              <button style={s.btn('primary')} onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          <div style={s.label}>Subject</div>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{ ...s.input, marginBottom: 16 }}
          />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <div style={s.label}>HTML</div>
          </div>

          {previewMode === 'code' ? (
            <textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              rows={28}
              style={s.textarea}
            />
          ) : (
            <div style={{ border: '1px solid #333', borderRadius: 8, overflow: 'hidden', height: 560 }}>
              <iframe
                srcDoc={html}
                style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                sandbox="allow-same-origin"
                title="Email preview"
              />
            </div>
          )}

          {msg && (
            <div style={{ marginTop: 10, fontSize: 13, color: msg.includes('fail') || msg.includes('Failed') ? '#ff6b6b' : '#4caf50' }}>
              {msg}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ data, loading }: { data: AdminData | null; loading: boolean }) {
  if (loading) return <div style={{ color: '#555', padding: 24 }}>Loading…</div>
  if (!data) return <div style={{ color: '#555', padding: 24 }}>No data</div>

  const plans = ['FREE', 'STARTER', 'GROWTH']

  return (
    <div>
      <div style={s.statGrid}>
        <div style={s.statCard}>
          <div style={s.statNum}>{data.users.total}</div>
          <div style={s.statLabel}>Total users</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statNum}>{data.products.total}</div>
          <div style={s.statLabel}>Products</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statNum}>{data.opportunities.total}</div>
          <div style={s.statLabel}>Opportunities</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statNum}>{data.posted.total}</div>
          <div style={s.statLabel}>Replies posted</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={s.card}>
          <div style={s.label}>Users by plan</div>
          {plans.map(plan => (
            <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #222' }}>
              <span style={s.planPill(plan)}>{plan}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#f5f5f5' }}>{data.users.byPlan[plan] ?? 0}</span>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <div style={s.label}>Recent signups</div>
          {data.users.recent.map(u => (
            <div key={u.id} style={{ padding: '8px 0', borderBottom: '1px solid #1e1e1e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#f5f5f5' }}>{u.name ?? u.email}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>{u.email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={s.planPill(u.plan)}>{u.plan}</span>
                  <span style={{ fontSize: 12, color: '#444' }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────

function PaymentsTab({ data, loading }: { data: AdminData | null; loading: boolean }) {
  if (loading) return <div style={{ color: '#555', padding: 24 }}>Loading…</div>
  if (!data) return <div style={{ color: '#555', padding: 24 }}>No data</div>

  const p = data.payments

  if (!p) {
    return (
      <div style={s.card}>
        <div style={{ color: '#666', fontSize: 14 }}>
          Dodo Payments data unavailable. Check <code style={{ color: '#aaa' }}>DODO_API_KEY</code> env var.
        </div>
      </div>
    )
  }

  const revenue = p.totalRevenue.toFixed(2)

  return (
    <div>
      <div style={{ ...s.statGrid, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div style={s.statCard}>
          <div style={s.statNum}>${revenue}</div>
          <div style={s.statLabel}>{p.revenueIsMrr ? 'MRR (est.)' : 'Total revenue'}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statNum}>{p.activeSubCount}</div>
          <div style={s.statLabel}>Active subscriptions</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statNum}>{p.totalPayments}</div>
          <div style={s.statLabel}>Total payments</div>
        </div>
      </div>

      {/* Paid customers from Dodo */}
      <div style={s.card}>
        <div style={s.label}>Active subscribers (from Dodo)</div>
        {p.paidCustomers.length === 0 && <div style={{ color: '#555', fontSize: 14 }}>No active subscriptions found</div>}
        {p.paidCustomers.map(c => (
          <div key={c.subscriptionId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e1e1e' }}>
            <div>
              <div style={{ fontSize: 14, color: '#f5f5f5', fontWeight: 500 }}>{c.email}</div>
              {c.name && <div style={{ fontSize: 12, color: '#666' }}>{c.name}</div>}
              <div style={{ fontSize: 11, color: '#444', fontFamily: 'monospace', marginTop: 2 }}>{c.subscriptionId}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={s.planPill(c.plan)}>{c.plan}</span>
              {c.createdAt && <span style={{ fontSize: 12, color: '#444' }}>{new Date(c.createdAt).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <div style={s.label}>Recent payments</div>
        {p.recentPayments.length === 0 && <div style={{ color: '#555', fontSize: 14 }}>No payments yet</div>}
        {p.recentPayments.map(pay => (
          <div key={pay.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e1e1e' }}>
            <div>
              {pay.email && <div style={{ fontSize: 13, color: '#d0d0d0', fontWeight: 500 }}>{pay.email}</div>}
              <div style={{ fontSize: 12, color: '#555', fontFamily: 'monospace' }}>{pay.id}</div>
              <div style={{ fontSize: 12, color: '#444' }}>{new Date(pay.createdAt).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f5' }}>
                ${pay.amount.toFixed(2)} {pay.currency?.toUpperCase()}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                background: ['succeeded','paid','captured'].includes(pay.status) ? '#1a2e1a' : '#2a1515',
                color: ['succeeded','paid','captured'].includes(pay.status) ? '#4caf50' : '#ff6b6b',
              }}>
                {pay.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Prompts Tab ──────────────────────────────────────────────────────────────

function PromptsTab() {
  const [prompts, setPrompts] = useState<AiPrompt[]>([])
  const [selected, setSelected] = useState<AiPrompt | null>(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/admin/prompts').then(r => r.json()).then((p: unknown) => {
      if (!Array.isArray(p)) return
      setPrompts(p)
      if (p.length > 0) select(p[0])
    })
  }, [])

  function select(p: AiPrompt) {
    setSelected(p)
    setContent(p.content)
    setMsg('')
  }

  async function save() {
    if (!selected) return
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: selected.key, content }),
      })
      if (res.ok) {
        setMsg('Saved ✓')
        setPrompts(prev => prev.map(p => p.key === selected.key ? { ...p, content, isCustomised: true } : p))
        setSelected(s => s ? { ...s, content, isCustomised: true } : s)
      } else {
        setMsg('Save failed')
      }
    } finally {
      setSaving(false)
    }
  }

  async function reset() {
    if (!selected || !confirm('Reset to default?')) return
    await fetch('/api/admin/prompts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: selected.key }),
    })
    const res = await fetch('/api/admin/prompts')
    const p: AiPrompt[] = await res.json()
    setPrompts(p)
    const fresh = p.find(x => x.key === selected.key)
    if (fresh) select(fresh)
    setMsg('Reset to default')
  }

  return (
    <div style={s.splitPane}>
      {/* Sidebar */}
      <div>
        <div style={s.label}>AI Prompts</div>
        {prompts.map(p => (
          <div key={p.key} style={s.listItem(selected?.key === p.key)} onClick={() => select(p)}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f5f5f5' }}>{p.name}</div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
              {p.isCustomised ? <span style={{ color: '#E54B1B' }}>Customised</span> : 'Default'}
            </div>
          </div>
        ))}
      </div>

      {/* Editor */}
      {selected && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f5f5f5' }}>{selected.name}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {selected.isCustomised && <button style={s.btn('danger')} onClick={reset}>Reset</button>}
              <button style={s.btn('primary')} onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          <div style={s.label}>Prompt content</div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={32}
            style={s.textarea}
          />

          {msg && (
            <div style={{ marginTop: 10, fontSize: 13, color: msg.includes('fail') || msg.includes('Failed') ? '#ff6b6b' : '#4caf50' }}>
              {msg}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Support Tab ──────────────────────────────────────────────────────────────

interface AdminTicket {
  id: string
  subject: string
  status: string
  createdAt: string
  updatedAt: string
  user: { email: string; name: string | null; plan: string }
  messages: { id: string; content: string; isAdmin: boolean; createdAt: string }[]
}

const TICKET_STATUS_COLORS: Record<string, string> = {
  open: '#E54B1B', in_progress: '#D69B14', resolved: '#4caf50',
}

function SupportTab() {
  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<AdminTicket | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => { loadTickets() }, [])

  async function loadTickets() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/tickets')
      if (res.ok) {
        const data: AdminTicket[] = await res.json()
        setTickets(data)
        setActive(prev => {
          if (!prev) return null
          return data.find(t => t.id === prev.id) ?? null
        })
      }
    } finally {
      setLoading(false)
    }
  }

  async function sendAdminReply() {
    if (!reply.trim() || !active) return
    setSending(true)
    try {
      const res = await fetch(`/api/admin/tickets/${active.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reply }),
      })
      if (res.ok) { setReply(''); await loadTickets() }
    } finally { setSending(false) }
  }

  async function updateStatus(status: string) {
    if (!active) return
    setStatusUpdating(true)
    try {
      await fetch(`/api/admin/tickets/${active.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await loadTickets()
    } finally { setStatusUpdating(false) }
  }

  const openCount = tickets.filter(t => t.status === 'open').length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h3 style={{ color: '#f5f5f5', margin: 0, fontWeight: 700, fontSize: 16 }}>Support Tickets</h3>
        {openCount > 0 && (
          <span style={{ background: '#3a1510', color: '#E54B1B', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
            {openCount} open
          </span>
        )}
        <button onClick={loadTickets} style={{ ...s.btn('ghost'), marginLeft: 'auto', fontSize: 12 }}>Refresh</button>
      </div>

      {loading ? (
        <p style={{ color: '#666', fontSize: 14 }}>Loading…</p>
      ) : tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#555' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
          <p style={{ margin: 0, fontSize: 14 }}>No tickets yet.</p>
        </div>
      ) : (
        <div style={s.splitPane}>
          <div>
            {tickets.map(t => (
              <div key={t.id} onClick={() => setActive(t)} style={s.listItem(active?.id === t.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f5', lineHeight: 1.3, flex: 1 }}>{t.subject}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                    background: `${TICKET_STATUS_COLORS[t.status]}22`,
                    color: TICKET_STATUS_COLORS[t.status],
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}>{t.status.replace('_', ' ')}</span>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: '#666', fontFamily: 'monospace' }}>{t.user.email}</p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#555' }}>
                  {t.messages.length} msg{t.messages.length !== 1 ? 's' : ''} · {new Date(t.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          <div>
            {active ? (
              <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 700, color: '#f5f5f5' }}>{active.subject}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{active.user.email} · {active.user.plan}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['open', 'in_progress', 'resolved'] as const).map(st => (
                      <button key={st} onClick={() => updateStatus(st)} disabled={statusUpdating || active.status === st}
                        style={{
                          padding: '5px 10px', fontSize: 11, borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600,
                          background: active.status === st ? TICKET_STATUS_COLORS[st] : '#222',
                          color: active.status === st ? '#fff' : '#888',
                          opacity: statusUpdating ? 0.5 : 1,
                        }}>
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
                  {active.messages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: msg.isAdmin ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '80%', padding: '10px 14px', borderRadius: 10,
                        background: msg.isAdmin ? '#E54B1B' : '#1a1a1a',
                        border: msg.isAdmin ? 'none' : '1px solid #2a2a2a',
                      }}>
                        <p style={{ margin: 0, fontSize: 13, color: msg.isAdmin ? '#fff' : '#d0d0d0', lineHeight: 1.5 }}>{msg.content}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 10, color: msg.isAdmin ? 'rgba(255,255,255,.6)' : '#555', textAlign: 'right' }}>
                          {msg.isAdmin ? 'You · ' : `${active.user.email.split('@')[0]} · `}
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {active.status !== 'resolved' && (
                  <div style={{ padding: '12px 16px', borderTop: '1px solid #2a2a2a' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <textarea
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        placeholder="Type your reply… (⌘+Enter to send)"
                        rows={2}
                        style={{ ...s.textarea, flex: 1, resize: 'none' }}
                        onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) sendAdminReply() }}
                      />
                      <button onClick={sendAdminReply} disabled={sending || !reply.trim()}
                        style={{ ...s.btn('primary'), opacity: sending || !reply.trim() ? 0.5 : 1, alignSelf: 'flex-end' }}>
                        {sending ? '…' : 'Reply'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#555', fontSize: 14 }}>
                Select a ticket to view the thread
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
