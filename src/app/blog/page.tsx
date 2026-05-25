import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'

export const metadata: Metadata = {
  title: 'Blog — Leaddit | Reddit Marketing Guides & Strategies',
  description: 'Learn how to find high-intent leads on Reddit, warm up accounts safely, and build a sustainable Reddit outreach strategy.',
}

const posts = [
  {
    slug: 'reddit-marketing-guide',
    title: 'The Complete Reddit Marketing Guide for SaaS Founders (2025)',
    desc: 'How to find your buyers on Reddit without getting banned — a step-by-step playbook.',
    tag: 'Guide',
    date: 'May 2025',
    readTime: '12 min read',
  },
  {
    slug: 'intent-scoring',
    title: 'What is Intent Scoring and Why Keyword Matching is Dead',
    desc: 'Why "mentioned your keyword" is the worst way to find leads on Reddit — and what actually works.',
    tag: 'Deep dive',
    date: 'May 2025',
    readTime: '8 min read',
  },
  {
    slug: 'account-warmup',
    title: 'How to Warm Up a Reddit Account Without Getting Banned',
    desc: 'The exact warmup sequence we use before any promotional posting — and why skipping it gets accounts flagged.',
    tag: 'Safety',
    date: 'April 2025',
    readTime: '6 min read',
  },
  {
    slug: 'case-studies',
    title: '3 Founders Who Got Their First 50 Customers from Reddit',
    desc: 'Real stories from SaaS founders who used Reddit outreach as their primary acquisition channel.',
    tag: 'Case study',
    date: 'April 2025',
    readTime: '10 min read',
  },
  {
    slug: 'reddit-shadowban-guide',
    title: 'Reddit Shadowbans: How to Detect, Prevent, and Recover',
    desc: 'Everything you need to know about shadowbans — what triggers them, how to check, and how to come back.',
    tag: 'Safety',
    date: 'March 2025',
    readTime: '7 min read',
  },
  {
    slug: 'subreddit-selection',
    title: 'How to Pick the Right Subreddits for Your Product',
    desc: 'A scoring framework for finding subreddits with high audience fit and low ban risk.',
    tag: 'Strategy',
    date: 'March 2025',
    readTime: '9 min read',
  },
]

const tagColors: Record<string, string> = {
  Guide: 'bg-violet-100 text-violet-700',
  'Deep dive': 'bg-blue-100 text-blue-700',
  Safety: 'bg-red-100 text-red-700',
  'Case study': 'bg-green-100 text-green-700',
  Strategy: 'bg-orange-100 text-orange-700',
}

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-14">
            <h1 className="text-4xl font-extrabold text-gray-900">Blog</h1>
            <p className="text-gray-500 mt-3 text-lg">Guides, strategy, and deep dives on Reddit marketing.</p>
          </div>

          <div className="space-y-4">
            {posts.map(({ slug, title, desc, tag, date, readTime }) => (
              <Link
                key={slug}
                href={`/blog/${slug}`}
                className="block bg-white border border-gray-200 rounded-2xl p-6 hover:border-violet-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColors[tag]}`}>{tag}</span>
                      <span className="text-xs text-gray-400">{date} · {readTime}</span>
                    </div>
                    <h2 className="font-bold text-gray-900 group-hover:text-violet-700 transition-colors">{title}</h2>
                    <p className="text-gray-500 text-sm mt-1">{desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-violet-500 transition-colors shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
