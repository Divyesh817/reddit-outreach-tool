import type { MetadataRoute } from 'next'

const BASE = 'https://redgrow.app'

const BLOG_SLUGS = [
  'reddit-marketing-guide',
  'intent-scoring',
  'account-warmup',
  'subreddit-discovery',
  'replymer-vs-redgrow',
  'reddit-reply-framework',
]

const COMPARE_SLUGS = [
  'vs-replymer',
  'vs-beno',
  'vs-redditgrow',
  'vs-manual',
]

const HOW_TO_SLUGS = [
  'find-customers-on-reddit-without-getting-banned',
  'promote-saas-on-reddit-organically',
  'reply-to-reddit-threads-to-get-signups',
  'find-buying-intent-threads-on-reddit',
]

const BEST_SLUGS = [
  'reddit-marketing-tools-for-saas-founders',
  'tools-to-find-leads-on-reddit',
  'reddit-monitoring-tool-for-startups',
]

const REDDIT_MARKETING_SLUGS = [
  'why-you-keep-getting-banned-on-reddit',
  'reddit-marketing-without-shadowban',
]

const GEO_SLUGS = [
  'how-to-get-saas-recommended-by-chatgpt',
  'how-to-appear-in-perplexity-ai-search',
  'what-is-geo-and-why-saas-founders-need-it',
]

const FOR_SLUGS = [
  'how-to-find-first-100-customers-on-reddit',
  'reddit-comments-into-paying-customers',
  'reddit-marketing-strategy-early-stage-startups',
  'saas-founders',
  'reddit-lead-generation-for-agencies',
  'reddit-keyword-monitoring',
  'reddit-marketing-tool',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const contentDate = new Date('2026-05-28')

  const static_pages: MetadataRoute.Sitemap = [
    { url: BASE,                     lastModified: now,         changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/blog`,           lastModified: contentDate, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/about`,          lastModified: contentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/changelog`,      lastModified: now,         changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE}/roadmap`,        lastModified: now,         changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE}/contact`,        lastModified: contentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/docs`,           lastModified: contentDate, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/guide`,          lastModified: contentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/privacy`,        lastModified: contentDate, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/terms`,          lastModified: contentDate, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  const makePages = (slugs: string[], prefix: string, priority = 0.8): MetadataRoute.Sitemap =>
    slugs.map(slug => ({
      url: `${BASE}/${prefix}/${slug}`,
      lastModified: contentDate,
      changeFrequency: 'monthly' as const,
      priority,
    }))

  return [
    ...static_pages,
    ...makePages(BLOG_SLUGS, 'blog'),
    ...makePages(COMPARE_SLUGS, 'compare'),
    ...makePages(HOW_TO_SLUGS, 'how-to'),
    ...makePages(BEST_SLUGS, 'best'),
    ...makePages(REDDIT_MARKETING_SLUGS, 'reddit-marketing'),
    ...makePages(GEO_SLUGS, 'generative-engine'),
    ...makePages(FOR_SLUGS, 'for'),
  ]
}
