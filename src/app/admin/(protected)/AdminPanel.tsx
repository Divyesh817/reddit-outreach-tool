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
    activeSubCount: number
    totalPayments: number
    recentPayments: { id: string; amount: number; currency: string; status: string; createdAt: string }[]
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
  const [tab, setTab] = useState<'emails' | 'users' | 'payments' | 'prompts'>('emails')
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
        {(['emails', 'users', 'payments', 'prompts'] as const).map(t => (
          <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'emails' && <EmailsTab />}
      {tab === 'users' && <UsersTab data={data} loading={dataLoading} />}
      {tab === 'payments' && <PaymentsTab data={data} loading={dataLoading} />}
      {tab === 'prompts' && <PromptsTab />}
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

  const revenue = (p.totalRevenue / 100).toFixed(2)

  return (
    <div>
      <div style={{ ...s.statGrid, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div style={s.statCard}>
          <div style={s.statNum}>${revenue}</div>
          <div style={s.statLabel}>Total revenue</div>
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

      <div style={s.card}>
        <div style={s.label}>Recent payments</div>
        {p.recentPayments.length === 0 && <div style={{ color: '#555', fontSize: 14 }}>No payments yet</div>}
        {p.recentPayments.map(pay => (
          <div key={pay.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e1e1e' }}>
            <div>
              <div style={{ fontSize: 13, color: '#aaa', fontFamily: 'monospace' }}>{pay.id}</div>
              <div style={{ fontSize: 12, color: '#555' }}>{new Date(pay.createdAt).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#f5f5f5' }}>
                ${(pay.amount / 100).toFixed(2)} {pay.currency?.toUpperCase()}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                background: pay.status === 'succeeded' ? '#1a2e1a' : '#2a1515',
                color: pay.status === 'succeeded' ? '#4caf50' : '#ff6b6b',
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
