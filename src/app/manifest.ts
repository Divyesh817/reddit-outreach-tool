import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Redgrow',
    short_name: 'Redgrow',
    description: 'AI monitors Reddit 24/7 for high-intent buyers and drafts contextual replies.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f0f',
    theme_color: '#E54B1B',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
