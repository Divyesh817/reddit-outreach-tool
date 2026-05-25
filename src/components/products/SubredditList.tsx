'use client'

import { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Subreddit {
  id: string
  name: string
  fitScore: number
  fitReason: string | null
  memberCount: number | null
  allowsPromotion: boolean
  isBlacklisted: boolean
  isActive: boolean
}

export function SubredditList({
  productId,
  subreddits: initial,
}: {
  productId: string
  subreddits: Subreddit[]
}) {
  const [subreddits, setSubreddits] = useState(initial)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [discovering, setDiscovering] = useState(false)

  async function addSubreddit() {
    if (!newName.trim()) return
    setLoading('add')
    const res = await fetch(`/api/products/${productId}/subreddits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.replace(/^r\//, '') }),
    })
    if (res.ok) {
      const { data } = await res.json()
      setSubreddits(s => [...s, data])
      setNewName('')
    }
    setLoading(null)
  }

  async function toggleSubreddit(id: string, isActive: boolean) {
    setLoading(id)
    const res = await fetch(`/api/products/${productId}/subreddits`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subredditId: id, isActive }),
    })
    if (res.ok) {
      setSubreddits(s => s.map(sub => sub.id === id ? { ...sub, isActive } : sub))
    }
    setLoading(null)
  }

  async function rediscover() {
    setDiscovering(true)
    const res = await fetch(`/api/products/${productId}/discover`, { method: 'POST' })
    if (res.ok) {
      const { data } = await res.json()
      setSubreddits(data)
    }
    setDiscovering(false)
  }

  const fitBadge = (score: number) => {
    if (score >= 80) return { label: 'High fit', variant: 'green' as const }
    if (score >= 60) return { label: 'Medium fit', variant: 'yellow' as const }
    return { label: 'Low fit', variant: 'default' as const }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Subreddit watchlist</h2>
          <Button variant="secondary" size="sm" onClick={rediscover} loading={discovering}>
            Re-discover
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Add subreddit */}
        <div className="flex gap-2">
          <Input
            placeholder="e.g. SaaS (without r/)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSubreddit()}
            className="max-w-xs"
          />
          <Button size="sm" onClick={addSubreddit} loading={loading === 'add'}>Add</Button>
        </div>

        {/* List */}
        <div className="space-y-2">
          {subreddits.map(sub => {
            const fit = fitBadge(sub.fitScore)
            return (
              <div
                key={sub.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-opacity ${
                  sub.isActive ? 'border-gray-200 bg-white' : 'border-dashed border-gray-200 bg-gray-50 opacity-60'
                } ${sub.isBlacklisted ? 'border-red-200 bg-red-50' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 text-sm">r/{sub.name}</span>
                    <Badge variant={fit.variant}>{fit.label}</Badge>
                    {!sub.allowsPromotion && <Badge variant="orange">No promo</Badge>}
                    {sub.isBlacklisted && <Badge variant="red">Blacklisted</Badge>}
                  </div>
                  {sub.fitReason && (
                    <p className="text-xs text-gray-500 mt-0.5">{sub.fitReason}</p>
                  )}
                </div>
                <button
                  className="text-xs text-gray-400 hover:text-gray-600 shrink-0 pt-0.5"
                  onClick={() => toggleSubreddit(sub.id, !sub.isActive)}
                  disabled={loading === sub.id}
                >
                  {sub.isActive ? 'Pause' : 'Resume'}
                </button>
              </div>
            )
          })}
          {subreddits.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No subreddits yet. Click Re-discover or add one manually.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
