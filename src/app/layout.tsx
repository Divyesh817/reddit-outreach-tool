import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const APP_URL = 'https://redgrow.app'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400','500','600','700','800'] })

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: 'Redgrow — Find High-Intent Reddit Buyers Automatically',
    template: '%s | Redgrow',
  },
  description: 'AI monitors Reddit 24/7, scores threads by buying intent, and drafts contextual replies. You approve — it posts from your own account. Find customers on Reddit from $9/mo.',

  keywords: [
    'reddit marketing', 'reddit outreach', 'reddit lead generation',
    'reddit automation', 'find customers on reddit', 'reddit reply tool',
    'reddit sales tool', 'SaaS marketing reddit', 'reddit intent monitoring',
    'reddit growth tool',
  ],

  authors: [{ name: 'Div', url: APP_URL }],
  creator: 'Redgrow',
  publisher: 'Redgrow',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'Redgrow',
    title: 'Redgrow — Find High-Intent Reddit Buyers Automatically',
    description: 'AI monitors Reddit 24/7, scores threads by buying intent, and drafts contextual replies. You approve — it posts from your own account. From $9/mo.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Redgrow — Reddit outreach powered by AI',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Redgrow — Find High-Intent Reddit Buyers Automatically',
    description: 'AI monitors Reddit 24/7, scores threads by buying intent, and drafts contextual replies. You approve — it posts from your own account.',
    images: ['/og-image.png'],
    creator: '@redgrowapp',
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },

  manifest: '/manifest.json',

  alternates: {
    canonical: APP_URL,
  },
}

export const viewport: Viewport = {
  themeColor: '#E54B1B',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={jakarta.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
