'use client'

import { useState, FormEvent } from 'react'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        window.location.href = '/admin'
      } else {
        setError('Wrong password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0f0f0f', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{ width: 340, padding: '40px 36px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#f5f5f5', letterSpacing: '-.02em', marginBottom: 6 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#E54B1B', marginRight: 6, verticalAlign: 'middle' }} />
            Redgrow Admin
          </div>
          <div style={{ fontSize: 13, color: '#555' }}>Enter the admin password to continue</div>
        </div>

        <form onSubmit={submit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            required
            style={{
              width: '100%', background: '#111', border: '1px solid #333',
              borderRadius: 8, padding: '11px 14px', color: '#f5f5f5',
              fontSize: 15, boxSizing: 'border-box', outline: 'none',
              marginBottom: 12,
            }}
          />
          {error && <div style={{ fontSize: 13, color: '#ff6b6b', marginBottom: 10 }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '11px', background: '#E54B1B',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {loading ? 'Checking…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
