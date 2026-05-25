'use client'

import Link from 'next/link'
import { useState } from 'react'
import { S } from '@/lib/theme'


function ProductAvatar({ name }: { name: string }) {
  const letters = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const hue = name.charCodeAt(0) * 13 % 360
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},60%,35%), hsl(${(hue + 40) % 360},50%,25%))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-.01em',
    }}>
      {letters || '?'}
    </div>
  )
}

function Sparkline() {
  return (
    <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
      <polyline
        points="0,18 10,14 20,16 30,8 40,10 50,4 64,6"
        stroke={S.orange} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

interface ProductCardProps {
  id: string
  name: string
  description: string | null
  url: string
  subreddits: { id: string; name: string }[]
  counts: {
    subreddits: number
    opportunities: number
  }
}

export function ProductCard({ id, name, description, url, subreddits, counts }: ProductCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={`/products/${id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? S.panel2 : S.panel,
          borderRadius: 14,
          border: `1px solid ${hovered ? S.orangeLine : S.line2}`,
          padding: '20px 24px',
          cursor: 'pointer',
          transition: 'border-color .15s, background .15s',
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <ProductAvatar name={name} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: S.text, letterSpacing: '-.01em' }}>
                {name}
              </span>
              <span style={{
                fontSize: 13, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                background: S.greenSoft, color: S.green, letterSpacing: '.04em',
                textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: S.green, display: 'inline-block' }} />
                Live
              </span>
            </div>
            <p style={{ fontSize: 17, color: S.text3, margin: 0, lineHeight: 1.5 }}>
              {description?.slice(0, 100)}{description && description.length > 100 ? '…' : ''}
            </p>
          </div>
          <div style={{ flexShrink: 0, opacity: .7 }}>
            <Sparkline />
          </div>
        </div>

        {/* Subreddit chips */}
        {subreddits.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {subreddits.slice(0, 7).map(sub => (
              <span key={sub.id} style={{
                fontSize: 16, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                background: S.panel2, border: `1px solid ${S.line2}`, color: S.text3,
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                r/{sub.name}
              </span>
            ))}
            {subreddits.length > 7 && (
              <span style={{
                fontSize: 16, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                background: S.panel2, border: `1px solid ${S.line2}`, color: S.text4,
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                +{subreddits.length - 7}
              </span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, background: S.line, borderRadius: 10, overflow: 'hidden',
          marginTop: 16, border: `1px solid ${S.line}`,
        }}>
          {[
            { label: 'Subreddits', val: counts.subreddits },
            { label: 'Threads found', val: counts.opportunities },
            { label: 'High-intent', val: Math.floor(counts.opportunities * 0.3) },
            { label: 'Copied', val: 0 },
          ].map((stat, i) => (
            <div key={i} style={{ background: S.card, padding: '10px 14px' }}>
              <p style={{ fontSize: 15, color: S.text4, margin: '0 0 3px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 21, fontWeight: 700, color: S.text, margin: 0, letterSpacing: '-.02em' }}>
                {stat.val}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <span style={{ fontSize: 16, color: S.text4, fontFamily: 'JetBrains Mono, monospace' }}>
            {url}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{
              fontSize: 16, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
              border: `1px solid ${S.line2}`, color: S.text3,
            }}>
              Edit
            </span>
            <span style={{
              fontSize: 16, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
              background: S.orangeSoft, border: `1px solid ${S.orangeLine}`,
              color: S.orange2,
            }}>
              View threads →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
