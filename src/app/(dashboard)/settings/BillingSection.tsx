'use client'

import { useState } from 'react'
import { S } from '@/lib/theme'
import { CheckoutModal } from '@/components/billing/CheckoutModal'
import { PLAN_LIMITS } from '@/types'
import type { Plan } from '@/types'

interface Props {
  plan: Plan
  oppsThisMonth: number
  repliesThisMonth: number
  upgradeOnly?: boolean
  hasSubscription?: boolean
}

const PLAN_DISPLAY: Record<Plan, { label: string; price: string; color: string }> = {
  FREE:    { label: 'Free',    price: '$0/mo',  color: '#888' },
  STARTER: { label: 'Starter', price: '$9/mo',  color: '#E54B1B' },
  GROWTH:  { label: 'Growth',  price: '$19/mo', color: '#9B8BF4' },
}

export function BillingSection({ plan, oppsThisMonth, repliesThisMonth, upgradeOnly, hasSubscription }: Props) {
  const [checkoutPlan, setCheckoutPlan] = useState<'STARTER' | 'GROWTH' | null>(null)
  const [showCancel, setShowCancel] = useState(false)
  const limits = PLAN_LIMITS[plan]
  const display = PLAN_DISPLAY[plan]

  const oppPct   = Math.min(100, Math.round((oppsThisMonth   / limits.opportunitiesPerMonth) * 100))
  const replyPct = Math.min(100, Math.round((repliesThisMonth / limits.repliesPerMonth) * 100))

  return (
    <>
      {checkoutPlan && (
        <CheckoutModal plan={checkoutPlan} onClose={() => setCheckoutPlan(null)} />
      )}

      {showCancel && (
        <CancelConfirmModal plan={plan} onClose={() => setShowCancel(false)} />
      )}

      {!upgradeOnly && (
        <>
          {/* Current plan */}
          <div style={{ padding: '14px 0', borderBottom: `1px solid ${S.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 16, color: S.text3, fontWeight: 500 }}>Current plan</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 13, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
                background: plan === 'FREE' ? S.line : S.orangeSoft,
                color: plan === 'FREE' ? S.text3 : S.orange2,
                letterSpacing: '.04em', textTransform: 'uppercase' as const,
                fontFamily: 'JetBrains Mono, monospace',
                border: `1px solid ${plan === 'FREE' ? S.line2 : S.orangeLine}`,
              }}>
                {display.label}
              </span>
              <span style={{ fontSize: 16, fontWeight: 600, color: S.text }}>{display.price}</span>
            </div>
          </div>

          {/* Usage bars */}
          <div style={{ padding: '14px 0', borderBottom: `1px solid ${S.line}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <UsageBar label="Opportunities" used={oppsThisMonth} max={limits.opportunitiesPerMonth} pct={oppPct} />
            <UsageBar label="Reply drafts"  used={repliesThisMonth} max={limits.repliesPerMonth}     pct={replyPct} />
          </div>
        </>
      )}

      {/* Always show both paid plan cards */}
      <div style={{ paddingTop: upgradeOnly ? 0 : 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' as const, color: S.text3, fontFamily: 'JetBrains Mono, monospace' }}>
          Plans
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <PlanCard
            name="Starter" price="$9/mo"
            features={['3 products', '500 opps/mo', '150 replies/mo', '10 scans/day']}
            isCurrent={plan === 'STARTER'}
            highlight={false}
            canCancel={plan === 'STARTER' && !!hasSubscription}
            onUpgrade={plan === 'FREE' ? () => setCheckoutPlan('STARTER') : undefined}
            onCancel={plan === 'STARTER' && hasSubscription ? () => setShowCancel(true) : undefined}
          />
          <PlanCard
            name="Growth" price="$19/mo"
            features={['5 products', '2,000 opps/mo', '500 replies/mo', 'Unlimited scans']}
            isCurrent={plan === 'GROWTH'}
            highlight={true}
            canCancel={plan === 'GROWTH' && !!hasSubscription}
            onUpgrade={plan !== 'GROWTH' ? () => setCheckoutPlan('GROWTH') : undefined}
            onCancel={plan === 'GROWTH' && hasSubscription ? () => setShowCancel(true) : undefined}
          />
        </div>
      </div>
    </>
  )
}

function CancelConfirmModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleCancel() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/dodo/cancel', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Unknown error')
      setDone(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: S.panel, border: `1px solid ${S.line}`,
        borderRadius: 16, padding: '28px 28px 24px',
        maxWidth: 420, width: '90%',
        boxShadow: '0 24px 80px rgba(0,0,0,.5)',
      }}>
        {done ? (
          <>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: S.greenSoft, border: `1px solid rgba(63,176,122,.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3FB07A" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: S.text }}>Subscription cancelled</p>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: S.text3, lineHeight: 1.6 }}>
              You&apos;ll keep access to {plan === 'STARTER' ? 'Starter' : 'Growth'} features until the end of your billing period. After that, your account will revert to Free.
            </p>
            <button
              onClick={() => { onClose(); window.location.reload() }}
              style={{ width: '100%', padding: '10px 0', borderRadius: 10, fontSize: 15, fontWeight: 700, background: S.orange, color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Got it
            </button>
          </>
        ) : (
          <>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(226,85,85,.12)', border: '1px solid rgba(226,85,85,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF8A8A" strokeWidth="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: S.text }}>Cancel {plan === 'STARTER' ? 'Starter' : 'Growth'}?</p>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: S.text3, lineHeight: 1.6 }}>
              You&apos;ll keep full access until your current billing period ends. After that, your account will revert to Free (1 product, 100 opps/mo).
            </p>

            {error && (
              <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(226,85,85,.1)', border: '1px solid rgba(226,85,85,.25)', fontSize: 13.5, color: '#FF8A8A' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={onClose}
                disabled={loading}
                style={{ padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 600, background: S.card, border: `1px solid ${S.line}`, color: S.text, cursor: 'pointer' }}
              >
                Keep plan
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                style={{ padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'rgba(226,85,85,.15)', border: '1px solid rgba(226,85,85,.3)', color: '#FF8A8A', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Cancelling…' : 'Yes, cancel'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function UsageBar({ label, used, max, pct }: { label: string; used: number; max: number; pct: number }) {
  const warn = pct >= 80
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 14, color: S.text3, fontWeight: 500 }}>{label}</span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600,
          color: warn ? S.amber : S.text2,
        }}>
          {used.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: S.line, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999, width: `${pct}%`,
          background: pct >= 95 ? S.red : pct >= 80 ? S.amber : S.orange,
          transition: 'width .3s ease',
        }} />
      </div>
    </div>
  )
}

function PlanCard({ name, price, features, isCurrent, highlight, onUpgrade, onCancel }: {
  name: string; price: string; features: string[];
  isCurrent: boolean; highlight: boolean; canCancel?: boolean;
  onUpgrade?: () => void; onCancel?: () => void;
}) {
  return (
    <div style={{
      borderRadius: 12, padding: '16px 18px', position: 'relative' as const,
      border: `1.5px solid ${isCurrent ? S.orange : highlight ? S.line2 : S.line}`,
      background: isCurrent ? S.orangeSoft : highlight ? S.card : S.card,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {isCurrent && (
        <span style={{
          position: 'absolute' as const, top: -10, right: 14,
          fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
          textTransform: 'uppercase' as const, padding: '3px 9px', borderRadius: 99,
          background: S.orange, color: '#fff',
          fontFamily: 'JetBrains Mono, monospace',
        }}>Current</span>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: isCurrent ? S.orange2 : S.text }}>{name}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: isCurrent ? S.orange2 : S.text2 }}>{price}</span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {features.map(f => (
          <li key={f} style={{ fontSize: 13.5, color: S.text3, display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isCurrent ? S.orange : S.green} strokeWidth="2.8">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
        {onUpgrade && (
          <button onClick={onUpgrade} style={{
            padding: '8px 0', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            background: highlight ? S.orange : S.panel,
            border: highlight ? 'none' : `1px solid ${S.line2}`,
            color: highlight ? '#fff' : S.text,
            boxShadow: highlight ? 'inset 0 -2px 0 rgba(0,0,0,.18)' : 'none',
          }}>
            Upgrade to {name}
          </button>
        )}
        {isCurrent && !onCancel && (
          <div style={{ padding: '8px 0', textAlign: 'center' as const, fontSize: 13, color: S.orange2, fontWeight: 600 }}>
            ✓ Active plan
          </div>
        )}
        {onCancel && (
          <button onClick={onCancel} style={{
            padding: '7px 0', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: 'transparent', border: `1px solid rgba(226,85,85,.3)`,
            color: '#FF8A8A',
          }}>
            Cancel plan
          </button>
        )}
      </div>
    </div>
  )
}
