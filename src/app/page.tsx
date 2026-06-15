import type { Metadata } from 'next'
import { LandingContent } from '@/components/landing/LandingContent'
import './landing.css'

export const metadata: Metadata = {
  title: 'Redgrow — Find Reddit Leads & Show Up in AI Search',
  description:
    'Redgrow finds Reddit threads where people ask about your product. AI scores intent and drafts a reply. You paste it yourself. No bots, no ban risk. Free to start.',
  keywords: [
    'reddit marketing tool', 'reddit lead generation', 'reddit outreach',
    'geo marketing', 'generative engine optimization', 'reddit ai search',
    'reddit leads', 'saas marketing', 'redgrow', 'reddit growth tool',
  ],
  openGraph: {
    title: 'Redgrow — Reddit Leads + GEO in One Tool',
    description: 'AI finds Reddit threads where people want to buy. Get a reply draft in seconds. Paste it yourself — no bots, no ban risk. Free to start.',
    type: 'website',
    url: 'https://redgrow.app',
    images: [{ url: 'https://redgrow.app/og-image.png', width: 1200, height: 628 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Redgrow — Reddit Leads + GEO in One Tool',
    description: 'AI finds Reddit threads where people want to buy. Paste the reply yourself. No bots, no ban risk. Free to start.',
  },
  alternates: { canonical: 'https://redgrow.app' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Redgrow',
  url: 'https://redgrow.app',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Any',
  browserRequirements: 'Requires JavaScript. Requires a modern browser.',
  description: 'Redgrow finds Reddit threads where people are ready to buy. AI scores buying intent 0–100, classifies pain type, and drafts a contextual reply. You paste it yourself — no bots, no ban risk.',
  screenshot: 'https://redgrow.app/og-image.png',
  softwareVersion: '2.0',
  datePublished: '2025-01-01',
  inLanguage: 'en',
  audience: {
    '@type': 'Audience',
    audienceType: 'SaaS founders, indie hackers, growth marketers',
  },
  offers: [
    { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free plan', description: '100 opportunities per month, 10 reply drafts, 1 product' },
    { '@type': 'Offer', price: '9', priceCurrency: 'USD', name: 'Starter plan', description: '500 opportunities per month, 150 reply drafts, 3 products', billingIncrement: 'P1M' },
    { '@type': 'Offer', price: '19', priceCurrency: 'USD', name: 'Growth plan', description: '2000 opportunities per month, 300 reply drafts, 5 products', billingIncrement: 'P1M' },
  ],
  creator: {
    '@type': 'Person',
    name: 'Div Patel',
    email: 'div@redgrow.app',
    url: 'https://redgrow.app',
  },
  featureList: [
    'Reddit buying-intent scoring (0–100)',
    'AI reply drafting by pain type',
    'Subreddit auto-discovery',
    'GEO (Generative Engine Optimization) scoring',
    'Daily opportunity digest email',
    'Comment thread reply opportunities',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '47',
    bestRating: '5',
    worstRating: '1',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does Redgrow use bots or automation on Reddit?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Redgrow never accesses your Reddit account. It scans public threads and writes a draft. You paste it yourself — Reddit sees a human, because it is one.' },
    },
    {
      '@type': 'Question',
      name: 'Can I get banned from Reddit for using Redgrow?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Redgrow has zero access to your account. You paste every reply by hand. That is fully within Reddit\'s Terms of Service.' },
    },
    {
      '@type': 'Question',
      name: 'How is Redgrow different from Replymer or Beno?',
      acceptedAnswer: { '@type': 'Answer', text: 'Redgrow starts at $9/mo vs Replymer at $99/mo. We classify intent into 5 pain types so drafts are contextual, not generic. And we never auto-post — your account stays safe.' },
    },
    {
      '@type': 'Question',
      name: 'What is GEO and why does it matter?',
      acceptedAnswer: { '@type': 'Answer', text: 'GEO stands for Generative Engine Optimization. ChatGPT, Claude, and Perplexity cite Reddit threads in their answers. Replies you post today become AI citations tomorrow. Redgrow shows you the highest-GEO-signal threads.' },
    },
    {
      '@type': 'Question',
      name: 'Is there a free plan?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The free plan gives you 100 thread opportunities and 10 reply drafts per month. No credit card needed. Upgrade when you are ready.' },
    },
  ],
}

export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <LandingContent />

    </>
  )
}
