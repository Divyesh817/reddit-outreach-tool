'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${appUrl}/auth/callback` },
    })
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${appUrl}/auth/callback` },
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
      {/* Logo top-left */}
      <div style={s.navLogo}>
        <Link href="/" style={s.logo}>
          <span style={s.dot}><span style={s.dotInner} /></span>
          Redgrow
        </Link>
      </div>

      {/* Card */}
      <div style={s.card}>
        <div style={s.cardTop}>
          <span style={s.dotLg}><span style={s.dotLgInner} /></span>
          <h1 style={s.h1}>Welcome to Redgrow</h1>
          <p style={s.sub}>Sign in to find high-intent Reddit buyers.</p>
        </div>

        {sent ? (
          <div style={s.sentBox}>
            <div style={s.sentIcon}>✉️</div>
            <p style={s.sentTitle}>Check your inbox</p>
            <p style={s.sentDesc}>
              Magic link sent to <strong>{email}</strong>.<br />
              Click it to sign in — no password needed.
            </p>
            <button onClick={() => setSent(false)} style={s.resend}>
              Use a different email
            </button>
          </div>
        ) : (
          <>
            {/* Google */}
            <button onClick={handleGoogle} style={s.googleBtn}
              onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div style={s.divRow}>
              <span style={s.divLine} />
              <span style={s.divText}>or continue with email</span>
              <span style={s.divLine} />
            </div>

            {/* Email */}
            <form onSubmit={handleEmail} style={s.form}>
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
                {loading ? 'Sending…' : 'Send magic link →'}
              </button>
            </form>
          </>
        )}

        <p style={s.terms}>
          By continuing you agree to our{' '}
          <Link href="/terms" style={s.termsLink}>Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" style={s.termsLink}>Privacy Policy</Link>
        </p>
      </div>

      {/* Trust row */}
      <div style={s.trust}>
        {['No credit card required', 'Free 7-day trial', 'Cancel anytime'].map(t => (
          <span key={t} style={s.trustPill}>{t}</span>
        ))}
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
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
  navLogo: {
    position: 'fixed',
    top: 24,
    left: 32,
  },
  logo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 20,
    fontWeight: 800,
    color: '#111',
    textDecoration: 'none',
    letterSpacing: '-.02em',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  dot: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#E54B1B',
    boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.22), 0 0 12px rgba(229,75,27,.35)',
    flexShrink: 0,
    position: 'relative' as const,
  },
  dotInner: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#FDFAF6',
    display: 'block',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    background: '#fff',
    border: '1px solid #e8e4de',
    borderRadius: 20,
    padding: '40px 32px 28px',
    boxShadow: '0 4px 32px rgba(0,0,0,.06)',
  },
  cardTop: {
    textAlign: 'center',
    marginBottom: 28,
  },
  dotLg: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#E54B1B',
    boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.22), 0 0 18px rgba(229,75,27,.4)',
    marginBottom: 16,
    position: 'relative' as const,
    flexShrink: 0,
  },
  dotLgInner: {
    width: 11,
    height: 11,
    borderRadius: '50%',
    background: '#FDFAF6',
    display: 'block',
  },
  h1: {
    fontSize: 21,
    fontWeight: 800,
    color: '#111',
    margin: '0 0 6px',
    letterSpacing: '-.02em',
  },
  sub: {
    fontSize: 14,
    color: '#999',
    margin: 0,
    fontWeight: 400,
  },
  googleBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: 600,
    color: '#111',
    cursor: 'pointer',
    transition: 'background .15s',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  divRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '18px 0',
  },
  divLine: {
    flex: 1,
    height: 1,
    background: '#f0ede8',
    display: 'block',
  },
  divText: {
    fontSize: 12,
    color: '#bbb',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#111',
    background: '#fff',
    outline: 'none',
    transition: 'border-color .15s',
    boxSizing: 'border-box',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    margin: '0',
    fontWeight: 500,
  },
  submitBtn: {
    width: '100%',
    padding: '12px 16px',
    background: '#E54B1B',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    cursor: 'pointer',
    transition: 'background .15s',
  },
  sentBox: {
    textAlign: 'center',
    padding: '8px 0 12px',
  },
  sentIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  sentTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#111',
    margin: '0 0 8px',
  },
  sentDesc: {
    fontSize: 14,
    color: '#777',
    margin: '0 0 16px',
    lineHeight: 1.6,
  },
  resend: {
    background: 'none',
    border: 'none',
    color: '#E54B1B',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    textDecoration: 'underline',
  },
  terms: {
    textAlign: 'center',
    fontSize: 12,
    color: '#ccc',
    marginTop: 20,
    marginBottom: 0,
  },
  termsLink: {
    color: '#aaa',
    textDecoration: 'underline',
  },
  trust: {
    display: 'flex',
    gap: 8,
    marginTop: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  trustPill: {
    fontSize: 12,
    fontWeight: 600,
    color: '#aaa',
    background: '#fff',
    border: '1px solid #e8e4de',
    borderRadius: 20,
    padding: '5px 12px',
  },
}
