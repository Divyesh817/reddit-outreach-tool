'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { S } from '@/lib/theme'


type Step = 'url' | 'review'

interface Profile {
  name: string
  description: string
  targetAudience: string
  keyBenefits: string[]
  competitors: string[]
  summary: string
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: 'block', fontSize: 14, fontWeight: 700, color: S.text4,
      textTransform: 'uppercase', letterSpacing: '.06em',
      fontFamily: 'JetBrains Mono, monospace', marginBottom: 6,
    }}>
      {children}
    </label>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 14, fontWeight: 600, padding: '3px 9px', borderRadius: 6,
      background: S.orangeSoft, border: `1px solid ${S.orangeLine}`, color: S.orange2,
    }}>
      {children}
    </span>
  )
}

export default function NewProductPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('url')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [productId, setProductId] = useState<string | null>(null)

  async function handleScrape() {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    try {
      const proxyRes = await fetch('/api/products/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!proxyRes.ok) {
        const err = await proxyRes.json()
        throw new Error(err.error || 'Failed to fetch URL')
      }
      const { html } = await proxyRes.json()
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, html }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create product')
      }
      const { data } = await res.json()
      setProductId(data.id)
      setProfile({ name: data.name, description: data.description, targetAudience: data.targetAudience, keyBenefits: data.keyBenefits, competitors: data.competitors, summary: data.summary })
      setStep('review')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile() {
    if (!productId || !profile) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error('Failed to save')
      router.push(`/products/${productId}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 16,
    background: S.card, border: `1px solid ${S.line2}`, color: S.text,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 23, fontWeight: 700, color: S.text, margin: 0, letterSpacing: '-.02em' }}>
          Add a product
        </h1>
        <p style={{ fontSize: 16, color: S.text3, margin: '4px 0 0' }}>
          Paste your product URL and we'll extract everything automatically.
        </p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        {(['url', 'review'] as Step[]).map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
              background: step === s ? S.orange : (step === 'review' && s === 'url') ? S.green : S.panel2,
              color: (step === s || (step === 'review' && s === 'url')) ? '#fff' : S.text4,
              border: `1px solid ${step === s ? S.orangeLine : S.line2}`,
            }}>
              {(step === 'review' && s === 'url') ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: step === s ? S.text : S.text4 }}>
              {s === 'url' ? 'Enter URL' : 'Review & save'}
            </span>
            {i < 1 && <div style={{ width: 24, height: 1, background: S.line2, margin: '0 4px' }} />}
          </div>
        ))}
      </div>

      {step === 'url' && (
        <div style={{ background: S.panel, borderRadius: 14, border: `1px solid ${S.line2}`, padding: '24px' }}>
          <Label>Product URL</Label>
          <input
            type="url"
            placeholder="https://yourproduct.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScrape()}
            style={{ ...inputStyle, marginBottom: 16 }}
          />
          {error && (
            <div style={{ background: S.redSoft, border: `1px solid rgba(229,83,83,.3)`, borderRadius: 8, padding: '10px 14px', fontSize: 15, color: S.red, marginBottom: 14 }}>
              {error}
            </div>
          )}
          <button
            onClick={handleScrape}
            disabled={loading || !url.trim()}
            style={{
              padding: '10px 22px', background: (loading || !url.trim()) ? S.panel2 : S.orange,
              color: (loading || !url.trim()) ? S.text4 : '#fff', border: 'none',
              borderRadius: 8, fontSize: 16, fontWeight: 700,
              cursor: (loading || !url.trim()) ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Analysing your product…' : 'Analyse product'}
          </button>
        </div>
      )}

      {step === 'review' && profile && (
        <div style={{ background: S.panel, borderRadius: 14, border: `1px solid ${S.line2}`, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ fontSize: 17, fontWeight: 700, color: S.text, margin: '0 0 2px' }}>Review extracted profile</p>
            <p style={{ fontSize: 15, color: S.text3, margin: 0 }}>Edit anything that looks off before saving.</p>
          </div>

          <div>
            <Label>Product name</Label>
            <input value={profile.name} onChange={e => setProfile(p => p ? { ...p, name: e.target.value } : p)} style={inputStyle} />
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              rows={3}
              value={profile.description}
              onChange={e => setProfile(p => p ? { ...p, description: e.target.value } : p)}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <Label>Target audience</Label>
            <textarea
              rows={2}
              value={profile.targetAudience}
              onChange={e => setProfile(p => p ? { ...p, targetAudience: e.target.value } : p)}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <Label>Key benefits</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.keyBenefits.map((b, i) => <Chip key={i}>{b}</Chip>)}
            </div>
          </div>

          <div>
            <Label>Competitors detected</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.competitors.length > 0
                ? profile.competitors.map((c, i) => (
                  <span key={i} style={{ fontSize: 14, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: S.panel2, border: `1px solid ${S.line2}`, color: S.text3 }}>{c}</span>
                ))
                : <span style={{ fontSize: 15, color: S.text4 }}>None detected</span>
              }
            </div>
          </div>

          <div>
            <Label>AI summary (used for all reply generation)</Label>
            <textarea
              rows={4}
              value={profile.summary}
              onChange={e => setProfile(p => p ? { ...p, summary: e.target.value } : p)}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {error && (
            <div style={{ background: S.redSoft, border: `1px solid rgba(229,83,83,.3)`, borderRadius: 8, padding: '10px 14px', fontSize: 15, color: S.red }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              style={{
                padding: '10px 22px', background: loading ? S.panel2 : S.orange,
                color: loading ? S.text4 : '#fff', border: 'none', borderRadius: 8,
                fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Saving…' : 'Save and view subreddits'}
            </button>
            <button
              onClick={() => setStep('url')}
              style={{
                padding: '10px 16px', background: 'transparent', border: `1px solid ${S.line2}`,
                borderRadius: 8, fontSize: 16, fontWeight: 600, color: S.text3,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
