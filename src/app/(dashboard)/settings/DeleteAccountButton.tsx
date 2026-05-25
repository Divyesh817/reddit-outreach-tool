'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { S } from '@/lib/theme'

export function DeleteAccountButton() {
  const [phase, setPhase] = useState<'idle' | 'confirm' | 'deleting'>('idle')
  const [error, setError] = useState('')

  async function handleDelete() {
    setPhase('deleting')
    setError('')
    try {
      const r = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!r.ok) {
        const body = await r.json().catch(() => ({}))
        throw new Error(body.error || `Error ${r.status}`)
      }
      await createClient().auth.signOut()
      window.location.href = '/'
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
      setPhase('confirm')
    }
  }

  if (phase === 'idle') {
    return (
      <button
        onClick={() => setPhase('confirm')}
        style={{
          padding: '8px 16px', borderRadius: 8, fontSize: 15, fontWeight: 600,
          background: 'transparent', border: `1px solid rgba(229,83,83,.35)`,
          color: S.red, cursor: 'pointer', transition: 'background .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(229,83,83,.08)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        Delete account
      </button>
    )
  }

  return (
    <div style={{
      background: 'rgba(229,83,83,.07)', border: `1px solid rgba(229,83,83,.25)`,
      borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: S.red }}>
        Are you sure? This permanently deletes your account, all products, and all data. This cannot be undone.
      </p>
      {error && (
        <p style={{ margin: 0, fontSize: 13, color: S.red, fontWeight: 500 }}>⚠ {error}</p>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={handleDelete}
          disabled={phase === 'deleting'}
          style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 700,
            background: S.red, color: '#fff', border: 'none', cursor: phase === 'deleting' ? 'not-allowed' : 'pointer',
            opacity: phase === 'deleting' ? .6 : 1,
          }}
        >
          {phase === 'deleting' ? 'Deleting…' : 'Yes, delete everything'}
        </button>
        <button
          onClick={() => { setPhase('idle'); setError('') }}
          disabled={phase === 'deleting'}
          style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: 'transparent', border: `1px solid ${S.line2}`, color: S.text2,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
