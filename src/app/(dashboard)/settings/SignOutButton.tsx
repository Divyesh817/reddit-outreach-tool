'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { S } from '@/lib/theme'
import { useT } from '@/lib/i18n'

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const t = useT()

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      style={{
        padding: '8px 16px', borderRadius: 8, fontSize: 16, fontWeight: 600,
        background: 'transparent', border: '1px solid rgba(255,237,210,.18)',
        color: '#C9BFAE', cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? .6 : 1, transition: 'opacity .15s',
      }}
    >
      {loading ? t.settings.signingOut : t.settings.signOut}
    </button>
  )
}
