import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/opportunities',
          '/products',
          '/settings',
          '/onboarding',
          '/admin',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://redgrow.app/sitemap.xml',
    host: 'https://redgrow.app',
  }
}
