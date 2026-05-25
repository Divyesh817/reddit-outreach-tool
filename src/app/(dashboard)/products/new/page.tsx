'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Step = 'url' | 'review' | 'subreddits'

interface Profile {
  name: string
  description: string
  targetAudience: string
  keyBenefits: string[]
  competitors: string[]
  summary: string
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
      // Fetch page HTML via server-side proxy
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

      // Create product (scrape + discover subreddits)
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
      setProfile({
        name: data.name,
        description: data.description,
        targetAudience: data.targetAudience,
        keyBenefits: data.keyBenefits,
        competitors: data.competitors,
        summary: data.summary,
      })
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

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add a product</h1>
        <p className="text-gray-500 mt-1">Paste your product URL and we'll extract everything automatically.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {(['url', 'review'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium ${
              step === s ? 'bg-purple-600 text-white' :
              (step === 'review' && s === 'url') ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {(step === 'review' && s === 'url') ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${step === s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {s === 'url' ? 'Enter URL' : 'Review & save'}
            </span>
            {i < 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {step === 'url' && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Input
              label="Product URL"
              type="url"
              placeholder="https://yourproduct.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScrape()}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={handleScrape} loading={loading} disabled={!url.trim()}>
              {loading ? 'Analysing your product…' : 'Analyse product'}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'review' && profile && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Review extracted profile</h2>
            <p className="text-sm text-gray-500">Edit anything that looks off before saving.</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Input
              label="Product name"
              value={profile.name}
              onChange={e => setProfile(p => p ? { ...p, name: e.target.value } : p)}
            />
            <Textarea
              label="Description"
              rows={3}
              value={profile.description}
              onChange={e => setProfile(p => p ? { ...p, description: e.target.value } : p)}
            />
            <Textarea
              label="Target audience"
              rows={2}
              value={profile.targetAudience}
              onChange={e => setProfile(p => p ? { ...p, targetAudience: e.target.value } : p)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key benefits</label>
              <div className="flex flex-wrap gap-2">
                {profile.keyBenefits.map((b, i) => (
                  <Badge key={i} variant="purple">{b}</Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Competitors detected</label>
              <div className="flex flex-wrap gap-2">
                {profile.competitors.length > 0
                  ? profile.competitors.map((c, i) => <Badge key={i}>{c}</Badge>)
                  : <span className="text-sm text-gray-400">None detected</span>
                }
              </div>
            </div>
            <Textarea
              label="AI summary (used for all reply generation)"
              rows={4}
              value={profile.summary}
              onChange={e => setProfile(p => p ? { ...p, summary: e.target.value } : p)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSaveProfile} loading={loading}>
                Save and view subreddits
              </Button>
              <Button variant="ghost" onClick={() => setStep('url')}>Back</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
