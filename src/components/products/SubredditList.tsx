'use client'

import { useState } from 'react'
import { S } from '@/lib/theme'


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

  function fitPill(score: number) {
    if (score >= 80) return { label: 'High fit', color: S.green, bg: S.greenSoft, border: 'rgba(63,176,122,.3)' }
    if (score >= 60) return { label: 'Mid fit', color: S.amber, bg: S.amberSoft, border: 'rgba(229,160,74,.3)' }
    return { label: 'Low fit', color: S.text4, bg: S.panel2, border: S.line2 }
  }

  return (
    <div style={{ background: S.panel, borderRadius: 14, border: `1px solid ${S.line2}`, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 24px', borderBottom: `1px solid ${S.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: S.text3, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'JetBrains Mono, monospace' }}>
          Subreddit watchlist
        </p>
        <button
          onClick={rediscover}
          disabled={discovering}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            background: discovering ? S.panel2 : S.orangeSoft,
            border: `1px solid ${discovering ? S.line2 : S.orangeLine}`,
            color: discovering ? S.text4 : S.orange2, borderRadius: 7,
            fontSize: 14, fontWeight: 700, cursor: discovering ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'all .12s',
          }}
        >
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
          </svg>
          {discovering ? 'Discovering…' : 'Re-discover'}
        </button>
      </div>

      <div style={{ padding: '16px 24px' }}>
        {/* Add input */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSubreddit()}
            placeholder="Add subreddit (e.g. SaaS)"
            style={{
              flex: 1, maxWidth: 280, padding: '8px 12px', borderRadius: 8, fontSize: 16,
              background: S.card, border: `1px solid ${S.line2}`, color: S.text,
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={addSubreddit}
            disabled={loading === 'add' || !newName.trim()}
            style={{
              padding: '8px 16px', background: S.orange, color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: (loading === 'add' || !newName.trim()) ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: (loading === 'add' || !newName.trim()) ? .6 : 1,
            }}
          >
            {loading === 'add' ? '…' : 'Add'}
          </button>
        </div>

        {/* List */}
        {subreddits.length === 0 ? (
          <p style={{ fontSize: 16, color: S.text4, textAlign: 'center', padding: '20px 0' }}>
            No subreddits yet. Click Re-discover or add one manually.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {subreddits.map(sub => {
              const fit = fitPill(sub.fitScore)
              return (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 16px', borderRadius: 10,
                    background: sub.isBlacklisted ? S.redSoft : sub.isActive ? S.card : S.panel2,
                    border: `1px solid ${sub.isBlacklisted ? 'rgba(229,83,83,.3)' : sub.isActive ? S.line : S.line}`,
                    opacity: sub.isActive ? 1 : .6,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: S.text, fontFamily: 'JetBrains Mono, monospace' }}>
                        r/{sub.name}
                      </span>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        color: fit.color, background: fit.bg, border: `1px solid ${fit.border}`,
                        fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '.04em',
                      }}>
                        {fit.label}
                      </span>
                      {!sub.allowsPromotion && (
                        <span style={{
                          fontSize: 12, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                          color: S.amber, background: S.amberSoft, border: `1px solid rgba(229,160,74,.3)`,
                          fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '.04em',
                        }}>
                          No promo
                        </span>
                      )}
                      {sub.isBlacklisted && (
                        <span style={{
                          fontSize: 12, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                          color: S.red, background: S.redSoft, border: `1px solid rgba(229,83,83,.3)`,
                          fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '.04em',
                        }}>
                          Blacklisted
                        </span>
                      )}
                    </div>
                    {sub.fitReason && (
                      <p style={{ fontSize: 15, color: S.text4, margin: '4px 0 0', lineHeight: 1.5 }}>
                        {sub.fitReason}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleSubreddit(sub.id, !sub.isActive)}
                    disabled={loading === sub.id}
                    style={{
                      fontSize: 14, fontWeight: 600, color: sub.isActive ? S.text4 : S.text3,
                      background: 'none', border: 'none', cursor: loading === sub.id ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', flexShrink: 0, padding: '2px 0',
                    }}
                  >
                    {loading === sub.id ? '…' : sub.isActive ? 'Pause' : 'Resume'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
