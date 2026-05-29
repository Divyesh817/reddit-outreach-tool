'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.navLogo}>
        <Link href="/" style={s.logo}>
          <span style={s.dot}><span style={s.dotInner} /></span>
          Redgrow
        </Link>
      </div>

      <div style={s.card}>
        <div style={s.cardTop}>
          <span style={s.dotLg}><span style={s.dotLgInner} /></span>
          <h1 style={s.h1}>Reset your password</h1>
          <p style={s.sub}>We'll send you a link to reset it.</p>
        </div>

        {sent ? (
          <div style={s.sentBox}>
            <div style={s.sentIcon}>✉️</div>
            <p style={s.sentTitle}>Check your inbox</p>
            <p style={s.sentDesc}>
              Password reset link sent to <strong>{email}</strong>.
            </p>
            <Link href="/login" style={s.backLink}>Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={s.form}>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={s.input}
              onFocus={e => (e.currentTarget.style.borderColor = '#E54B1B')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
            />
            {error && <p style={s.errorText}>{error}</p>}
            <button
              type="submit"
              disabled={loading || !email}
              style={{ ...s.submitBtn, opacity: loading || !email ? 0.55 : 1 }}
              onMouseEnter={e => { if (!loading && email) e.currentTarget.style.background = '#cf3f12' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E54B1B' }}
            >
              {loading ? 'Sending…' : 'Send reset link →'}
            </button>
            <p style={s.back}>
              <Link href="/login" style={s.backLink}>Back to sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#FDFAF6',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  navLogo: { position: 'fixed', top: 24, left: 32 },
  logo: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontSize: 20, fontWeight: 800, color: '#111', textDecoration: 'none',
    letterSpacing: '-.02em', fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  dot: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 22, height: 22, borderRadius: '50%', background: '#E54B1B',
    boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.22), 0 0 12px rgba(229,75,27,.35)',
    flexShrink: 0, position: 'relative' as const,
  },
  dotInner: { width: 7, height: 7, borderRadius: '50%', background: '#FDFAF6', display: 'block' },
  card: {
    width: '100%', maxWidth: 400, background: '#fff',
    border: '1px solid #e8e4de', borderRadius: 20, padding: '40px 32px 28px',
    boxShadow: '0 4px 32px rgba(0,0,0,.06)',
  },
  cardTop: { textAlign: 'center', marginBottom: 28 },
  dotLg: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 40, height: 40, borderRadius: '50%', background: '#E54B1B',
    boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.22), 0 0 18px rgba(229,75,27,.4)',
    marginBottom: 16, position: 'relative' as const, flexShrink: 0,
  },
  dotLgInner: { width: 11, height: 11, borderRadius: '50%', background: '#FDFAF6', display: 'block' },
  h1: { fontSize: 21, fontWeight: 800, color: '#111', margin: '0 0 6px', letterSpacing: '-.02em' },
  sub: { fontSize: 14, color: '#999', margin: 0, fontWeight: 400 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: {
    width: '100%', padding: '11px 14px', border: '1px solid #e5e7eb',
    borderRadius: 10, fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#111', background: '#fff', outline: 'none',
    transition: 'border-color .15s', boxSizing: 'border-box',
  },
  errorText: { fontSize: 12, color: '#dc2626', margin: '0', fontWeight: 500 },
  submitBtn: {
    width: '100%', padding: '12px 16px', background: '#E54B1B', color: '#fff',
    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer', transition: 'background .15s',
  },
  back: { textAlign: 'center', marginTop: 4 },
  backLink: { fontSize: 13, color: '#E54B1B', fontWeight: 600, textDecoration: 'none' },
  sentBox: { textAlign: 'center', padding: '8px 0 12px' },
  sentIcon: { fontSize: 40, marginBottom: 12 },
  sentTitle: { fontSize: 17, fontWeight: 700, color: '#111', margin: '0 0 8px' },
  sentDesc: { fontSize: 14, color: '#777', margin: '0 0 16px', lineHeight: 1.6 },
}
