'use client'

import { useState, useEffect } from 'react'
import { S } from '@/lib/theme'

interface Props {
  plan: 'STARTER' | 'GROWTH'
  onClose: () => void
}

const PLAN_META = {
  STARTER: { label: 'Starter', price: '$9/mo', desc: '3 products · 500 opps/mo · 150 replies/mo' },
  GROWTH:  { label: 'Growth',  price: '$19/mo', desc: '5 products · 2,000 opps/mo · 500 replies/mo' },
}

const SPIN_CSS = `@keyframes dodo-spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } } .dodo-spin { animation: dodo-spin 1s linear infinite }`

export function CheckoutModal({ plan, onClose }: Props) {
  const meta = PLAN_META[plan]
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    let active = true

    async function open() {
      try {
        const res = await fetch('/api/dodo/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        })
        if (!res.ok) throw new Error('checkout_failed')
        const { checkout_url } = await res.json()
        if (!active) return

        const { DodoPayments } = await import('dodopayments-checkout')

        DodoPayments.Initialize({
          mode: (process.env.NEXT_PUBLIC_DODO_MODE ?? 'live') as 'test' | 'live',
          displayType: 'inline',
          onEvent: async (event: any) => {
            const t = (event?.event_type ?? event?.type ?? '').toLowerCase()
            console.log('[Dodo event]', t, event)

            const isSuccess =
              t === 'payment.succeeded' ||
              t === 'checkout.completed' ||
              t === 'payment_succeeded' ||
              t === 'checkout_completed' ||
              t.includes('success') ||
              t.includes('complet')

            if (isSuccess) {
              // Activate plan directly — reliable even if webhook fails
              try {
                await fetch('/api/dodo/activate-plan', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ plan }),
                })
              } catch { /* non-fatal — webhook is backup */ }
              setTimeout(() => { window.location.href = '/dashboard' }, 1500)
            }
          },
        })

        DodoPayments.Checkout.open({
          checkoutUrl: checkout_url,
          elementId: 'dodo-inline-checkout',
        })

        if (active) setStatus('ready')
      } catch {
        if (active) { setErrMsg('Failed to load checkout. Please try again.'); setStatus('error') }
      }
    }

    open()

    return () => {
      active = false
      import('dodopayments-checkout')
        .then(({ DodoPayments }) => DodoPayments.Checkout.close())
        .catch(() => {})
    }
  }, [plan])

  // Close on backdrop click
  function onBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SPIN_CSS }} />
      <div
        onClick={onBackdrop}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,.78)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}
      >
        <div style={{
          background: S.panel, borderRadius: 18, border: `1px solid ${S.line2}`,
          width: '100%', maxWidth: 500, overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,.6)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 22px', borderBottom: `1px solid ${S.line}`,
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: S.text }}>{meta.label}</span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700,
                  padding: '3px 9px', borderRadius: 6, background: S.orangeSoft,
                  color: S.orange2, border: `1px solid ${S.orangeLine}`,
                }}>
                  {meta.price}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 13.5, color: S.text3 }}>{meta.desc}</p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: S.card, border: `1px solid ${S.line}`,
                cursor: 'pointer', color: S.text3, flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Checkout area */}
          <div style={{ position: 'relative', minHeight: 440 }}>
            {status === 'loading' && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 14,
              }}>
                <svg className="dodo-spin" width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke={S.orange} strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                <p style={{ fontSize: 14, color: S.text3, margin: 0 }}>Preparing checkout…</p>
              </div>
            )}
            {status === 'error' && (
              <div style={{ padding: '40px 32px', textAlign: 'center' }}>
                <p style={{ fontSize: 15, color: S.red, margin: '0 0 18px', lineHeight: 1.5 }}>{errMsg}</p>
                <button
                  onClick={() => { setStatus('loading'); setErrMsg('') }}
                  style={{
                    padding: '9px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                    background: S.orangeSoft, border: `1px solid ${S.orangeLine}`,
                    color: S.orange2, cursor: 'pointer',
                  }}
                >
                  Try again
                </button>
              </div>
            )}
            <div id="dodo-inline-checkout" style={{ minHeight: 440 }} />
          </div>
        </div>
      </div>
    </>
  )
}
