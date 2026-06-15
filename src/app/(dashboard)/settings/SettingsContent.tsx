'use client'

import { useState, useRef } from 'react'
import { S } from '@/lib/theme'
import { BillingSection } from './BillingSection'
import { DeleteAccountButton } from './DeleteAccountButton'
import { SignOutButton } from './SignOutButton'
import { PLAN_LIMITS } from '@/types'
import type { Plan } from '@/types'
import { useT, useLanguage } from '@/lib/i18n'

interface NotifPrefs {
  highIntent: boolean
  dailyDigest: boolean
  weeklySummary: boolean
  productNews: boolean
}

interface Props {
  user: {
    name: string | null
    email: string | null
    avatarUrl: string | null
    plan: string
    redditUsername: string | null
    hasSubscription: boolean
  }
  oppsThisMonth: number
  repliesThisMonth: number
  notifPrefs: NotifPrefs
  banner?: { ok: boolean; text: string } | null
  initialTab?: Tab
}

type Tab = 'account' | 'billing' | 'notifications' | 'danger'

export function SettingsContent({ user, oppsThisMonth, repliesThisMonth, notifPrefs, banner, initialTab = 'account' }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const t = useT()
  const ts = t.settings
  const plan = user.plan as Plan
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS['FREE']
  const PLAN_DISPLAY: Record<string, { label: string; price: string }> = {
    FREE:    { label: t.plans.FREE,    price: '$0/mo' },
    STARTER: { label: t.plans.STARTER, price: '$9/mo' },
    GROWTH:  { label: t.plans.GROWTH,  price: '$19/mo' },
  }
  const planDisplay = PLAN_DISPLAY[plan] ?? PLAN_DISPLAY['FREE']
  const initial = (user.name ?? user.email ?? 'U')[0].toUpperCase()
  const TABS: { key: Tab; label: string }[] = [
    { key: 'account',       label: ts.tabs.account },
    { key: 'billing',       label: ts.tabs.billing },
    { key: 'notifications', label: ts.tabs.notifications },
    { key: 'danger',        label: ts.tabs.danger },
  ]

  return (
    <div style={{ padding: '40px 44px 100px', width: '100%', maxWidth: 900, margin: '0 auto' }}>

      {banner && (
        <div style={{
          marginBottom: 28, padding: '15px 20px', borderRadius: 10, fontSize: 16, fontWeight: 600,
          background: banner.ok ? S.greenSoft : S.redSoft,
          border: `1px solid ${banner.ok ? 'rgba(63,176,122,.3)' : 'rgba(229,83,83,.3)'}`,
          color: banner.ok ? S.green : S.red,
        }}>
          {banner.text}
        </div>
      )}

      {/* Page head */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', color: S.text }}>{ts.header}</h1>
        <p style={{ margin: '8px 0 0', color: S.text3, fontSize: 16 }}>{ts.desc}</p>
      </div>

      {/* Horizontal tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 32, borderBottom: `1px solid ${S.line}` }}>
        {TABS.map(tb => {
          const active = tab === tb.key
          const isDanger = tb.key === 'danger'
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              style={{
                padding: '12px 22px', fontSize: 15, fontWeight: active ? 600 : 500,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: active ? (isDanger ? '#E84040' : S.orange2) : isDanger ? '#C04040' : S.text3,
                borderBottom: active ? `2px solid ${isDanger ? '#E84040' : S.orange}` : '2px solid transparent',
                marginBottom: -1,
                transition: 'color .15s, border-color .15s',
                fontFamily: 'inherit',
                letterSpacing: '-.01em',
              }}
            >
              {tb.label}
            </button>
          )
        })}
      </div>

      {/* Tab panels */}
      {tab === 'account'       && <AccountPanel user={user} initial={initial} />}
      {tab === 'billing'       && <BillingPanel plan={plan} planDisplay={planDisplay} limits={limits} oppsThisMonth={oppsThisMonth} repliesThisMonth={repliesThisMonth} hasSubscription={user.hasSubscription} />}
      {tab === 'notifications' && <NotificationsPanel email={user.email} initialPrefs={notifPrefs} />}
      {tab === 'danger'        && <DangerPanel />}

      {/* Sign out — always at bottom */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '22px 32px', marginTop: 28,
        background: S.panel, border: `1px solid ${S.line}`, borderRadius: 14,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: S.text }}>{ts.signOutTitle}</p>
          <p style={{ margin: '4px 0 0', fontSize: 15, color: S.text3 }}>{ts.signOutDesc}</p>
        </div>
        <SignOutButton />
      </div>

    </div>
  )
}

// ─── Account panel ────────────────────────────────────────────────────────────

function AccountPanel({ user, initial }: { user: Props['user']; initial: string }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name ?? '')
  const [saving, setSaving] = useState(false)
  const [savedName, setSavedName] = useState(user.name ?? '')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const t = useT()
  const { account: ta, language: tl } = t.settings
  const { lang, setLang } = useLanguage()

  async function save() {
    if (!name.trim()) { setError(ta.nameEmpty); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSavedName(json.name)
      setEditing(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function startEdit() {
    setEditing(true); setError('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <Panel title={ta.title} subtitle={ta.subtitle}>
      {/* Avatar + name hero */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingBottom: 28, borderBottom: `1px solid ${S.line}`, marginBottom: 4 }}>
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" style={{ width: 72, height: 72, borderRadius: '50%', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg,#E879F9,#A21CAF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 28, flexShrink: 0,
          }}>
            {initial}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.02em', color: S.text, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const }}>
            {savedName || ta.noNameSet}
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, letterSpacing: '.08em',
              textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: 4,
              background: S.greenSoft, color: S.green, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              {ta.verified}
            </span>
          </div>
          <div style={{ fontSize: 15, color: S.text3, marginTop: 5 }}>{user.email}</div>
        </div>
        {!editing && (
          <GhostBtn onClick={startEdit}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
            {ta.editProfile}
          </GhostBtn>
        )}
      </div>

      {/* Name field */}
      <Row label={ta.displayName} hint={ta.displayNameHint}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={inputRef}
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setEditing(false); setName(savedName) } }}
                style={{
                  padding: '10px 14px', borderRadius: 8, fontSize: 15, fontWeight: 500,
                  background: S.card, border: `1.5px solid ${error ? S.red : S.orange}`,
                  color: S.text, outline: 'none', width: 220, fontFamily: 'inherit',
                }}
              />
              <button onClick={save} disabled={saving} style={{
                padding: '10px 18px', borderRadius: 8, fontSize: 15, fontWeight: 600,
                background: S.orange, color: '#fff', border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
              }}>
                {saving ? ta.saving : ta.save}
              </button>
              <button onClick={() => { setEditing(false); setName(savedName); setError('') }} style={{
                padding: '10px 16px', borderRadius: 8, fontSize: 15, fontWeight: 500,
                background: S.card, border: `1px solid ${S.line}`, color: S.text3, cursor: 'pointer',
              }}>
                {ta.cancel}
              </button>
            </div>
            {error && <span style={{ fontSize: 14, color: S.red }}>{error}</span>}
          </div>
        ) : (
          <span style={{ fontSize: 16, fontWeight: 500, color: S.text }}>{savedName || '—'}</span>
        )}
      </Row>

      {/* Email */}
      <Row label={ta.email} hint={ta.emailHint}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: S.text }}>{user.email}</span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.06em',
            textTransform: 'uppercase' as const, padding: '3px 8px', borderRadius: 4,
            background: S.card, color: S.text4, border: `1px solid ${S.line}`,
          }}>
            Google
          </span>
        </div>
      </Row>

      {/* Language */}
      <Row label={tl.label} hint={tl.hint} last>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['en', 'de'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: lang === l ? S.orange : 'transparent',
                color: lang === l ? '#fff' : S.text3,
                border: `1.5px solid ${lang === l ? S.orange : S.line2}`,
                cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
              }}
            >
              {l === 'en' ? tl.en : tl.de}
            </button>
          ))}
        </div>
      </Row>

    </Panel>
  )
}

// ─── Billing panel ────────────────────────────────────────────────────────────

function BillingPanel({ plan, planDisplay, limits, oppsThisMonth, repliesThisMonth, hasSubscription }: {
  plan: Plan; planDisplay: { label: string; price: string }; limits: ReturnType<typeof Object.values<typeof PLAN_LIMITS[Plan]>>[number];
  oppsThisMonth: number; repliesThisMonth: number; hasSubscription: boolean;
}) {
  const { billing: tb } = useT().settings
  const now = new Date()
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const resetStr = resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <Panel title={tb.title} subtitle={tb.subtitle}>
      <Row label={tb.currentPlan}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: 6,
            background: plan === 'FREE' ? S.card : S.orange,
            color: plan === 'FREE' ? S.text3 : '#fff',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700,
            letterSpacing: '.08em', textTransform: 'uppercase' as const,
            border: plan === 'FREE' ? `1px solid ${S.line}` : 'none',
            boxShadow: plan !== 'FREE' ? 'inset 0 -2px 0 rgba(0,0,0,.18)' : 'none',
          }}>
            {planDisplay.label}
          </span>
          <span style={{ fontSize: 17, fontWeight: 600, color: S.text }}>{planDisplay.price}</span>
        </div>
      </Row>

      <div style={{ padding: '22px 0', borderBottom: `1px solid ${S.line}` }}>
        <div style={{ fontSize: 15, color: S.text3, fontWeight: 500, marginBottom: 16 }}>
          {tb.usageCycle(resetStr)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <UsageCard
            label={tb.opportunities} used={oppsThisMonth} max={limits.opportunitiesPerMonth}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          />
          <UsageCard
            label={tb.replyDrafts} used={repliesThisMonth} max={limits.repliesPerMonth}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/></svg>}
          />
        </div>
      </div>

      <div style={{ paddingTop: 22 }}>
        <BillingSection
          plan={plan} oppsThisMonth={oppsThisMonth} repliesThisMonth={repliesThisMonth}
          upgradeOnly hasSubscription={hasSubscription}
        />
      </div>
    </Panel>
  )
}

// ─── Notifications panel ──────────────────────────────────────────────────────

function NotificationsPanel({ email, initialPrefs }: { email: string | null; initialPrefs: NotifPrefs }) {
  const [prefs, setPrefs] = useState<NotifPrefs>(initialPrefs)
  const [saving, setSaving] = useState<keyof NotifPrefs | null>(null)
  const { notifications: tn } = useT().settings
  const NOTIF_ITEMS = tn.items as { key: keyof NotifPrefs; label: string; hint: string }[]

  async function toggle(key: keyof NotifPrefs) {
    const next = !prefs[key]
    setPrefs(prev => ({ ...prev, [key]: next }))
    setSaving(key)
    try {
      await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: next }),
      })
    } catch {
      setPrefs(prev => ({ ...prev, [key]: !next }))
    } finally {
      setSaving(null)
    }
  }

  return (
    <Panel title={tn.title} subtitle={tn.subtitle(email ?? '')}>
      {NOTIF_ITEMS.map((item, i) => (
        <Row key={item.key} label={item.label} hint={item.hint} last={i === NOTIF_ITEMS.length - 1}>
          <Toggle on={prefs[item.key]} disabled={saving === item.key} onToggle={() => toggle(item.key)} />
        </Row>
      ))}
    </Panel>
  )
}

// ─── Danger panel ─────────────────────────────────────────────────────────────

function DangerPanel() {
  const { danger: td } = useT().settings
  return (
    <div style={{ background: S.panel, border: '1px solid rgba(220,60,60,.45)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '24px 32px 20px', borderBottom: '1px solid rgba(220,60,60,.3)', background: 'rgba(200,40,40,.08)' }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.015em', color: '#F05050' }}>{td.title}</div>
        <div style={{ fontSize: 15, color: S.text3, marginTop: 5 }}>{td.subtitle}</div>
      </div>
      <div style={{ padding: '12px 32px 28px' }}>
        <Row label={td.deleteAccount} hint={td.deleteAccountHint} last>
          <DeleteAccountButton />
        </Row>
      </div>
    </div>
  )
}

// ─── Shared components ────────────────────────────────────────────────────────

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: S.panel, border: `1px solid ${S.line}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '24px 32px 20px', borderBottom: `1px solid ${S.line}` }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.015em', color: S.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 15, color: S.text3, marginTop: 5 }}>{subtitle}</div>}
      </div>
      <div style={{ padding: '12px 32px 28px' }}>{children}</div>
    </div>
  )
}

function Row({ label, hint, last, children }: {
  label: string; hint?: string; last?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center',
      padding: '20px 0', borderBottom: last ? 'none' : `1px solid ${S.line}`,
    }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 500, color: S.text2 }}>{label}</div>
        {hint && <div style={{ fontSize: 14, color: S.text3, marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '10px 18px', borderRadius: 8,
      fontSize: 15, fontWeight: 500,
      background: S.card, border: `1px solid ${S.line}`,
      color: S.text, cursor: 'pointer',
      whiteSpace: 'nowrap' as const, fontFamily: 'inherit',
    }}>
      {children}
    </button>
  )
}

function Toggle({ on, disabled, onToggle }: { on: boolean; disabled?: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-checked={on}
      role="switch"
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center',
        width: 52, height: 30, borderRadius: 999, border: 'none',
        background: on ? S.orange : S.line,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'background .2s ease',
        flexShrink: 0, padding: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        left: on ? 24 : 3,
        width: 24, height: 24, borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,.25)',
        transition: 'left .2s ease',
        display: 'block',
      }} />
    </button>
  )
}

function UsageCard({ label, icon, used, max }: { label: string; icon: React.ReactNode; used: number; max: number }) {
  const pct = Math.min(100, Math.round((used / max) * 100))
  const warn = pct >= 80
  return (
    <div style={{ background: S.card, border: `1px solid ${S.line}`, borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, letterSpacing: '.04em', textTransform: 'uppercase' as const, color: S.text3, fontWeight: 600 }}>
          <span style={{ width: 15, height: 15, display: 'flex', color: S.text3 }}>{icon}</span>
          {label}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: warn ? S.amber : S.text3, fontWeight: 600 }}>
          {pct}%
        </span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 7, color: S.text }}>
        {used.toLocaleString()}
        <span style={{ fontSize: 16, color: S.text3, fontWeight: 400 }}>/ {max.toLocaleString()}</span>
      </div>
      <div style={{ marginTop: 14, height: 6, background: S.line, borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999, width: `${Math.max(pct, 0.5)}%`,
          background: pct >= 95 ? S.red : pct >= 80 ? S.amber : `linear-gradient(90deg, ${S.orange2}, ${S.orange})`,
          transition: 'width .3s ease',
        }} />
      </div>
    </div>
  )
}
