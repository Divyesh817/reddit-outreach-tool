'use client'

import { useState } from 'react'

interface Props {
  name: string
  logoUrl?: string | null
  size?: number
  radius?: number
}

export function ProductLogo({ name, logoUrl, size = 26, radius = 7 }: Props) {
  const [failed, setFailed] = useState(false)

  const letter = (
    <span style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: 'linear-gradient(135deg,#FFA070,#E54B1B)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.52), fontWeight: 700, color: '#fff',
    }}>
      {name[0]?.toUpperCase() ?? '?'}
    </span>
  )

  if (!logoUrl || failed) return letter

  return (
    <span style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        style={{ objectFit: 'contain', width: size - 4, height: size - 4 }}
        onError={() => setFailed(true)}
      />
    </span>
  )
}
