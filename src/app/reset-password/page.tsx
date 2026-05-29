'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2000)
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
          <h1 style={s.h1}>Set new password</h1>
          <p style={s.sub}>Choose a strong password for your account.</p>
        </div>

        {done ? (
          <div style={s.sentBox}>
            <div style={s.sentIcon}>✅</div>
            <p style={s.sentTitle}>Password updated</p>
            <p style={s.sentDesc}>Redirecting you to the dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={s.form}>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={s.input}
              onFocus={e => (e.currentTarget.style.borderColor = '#E54B1B')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={s.input}
              onFocus={e => (e.currentTarget.style.borderColor = '#E54B1B')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
            />
            {error && <p style={s.errorText}>{error}</p>}
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              style={{ ...s.submitBtn, opacity: loading || !password || !confirmPassword ? 0.55 : 1 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#cf3f12' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E54B1B' }}
            >
              {loading ? 'Updating…' : 'Update password →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', background: '#FDFAF6', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '24px', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
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
  sentBox: { textAlign: 'center', padding: '8px 0 12px' },
  sentIcon: { fontSize: 40, marginBottom: 12 },
  sentTitle: { fontSize: 17, fontWeight: 700, color: '#111', margin: '0 0 8px' },
  sentDesc: { fontSize: 14, color: '#777', margin: '0 0 16px', lineHeight: 1.6 },
}
