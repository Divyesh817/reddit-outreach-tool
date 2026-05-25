import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { FAQAccordion } from '@/components/landing/FAQAccordion'

export const metadata: Metadata = {
  title: 'Leaddit — Find High-Intent Reddit Leads Automatically | AI Reddit Outreach Tool',
  description:
    'AI monitors Reddit 24/7, scores threads by buying intent, and drafts contextual replies. You approve, it posts from your own account. Cheaper, safer and smarter than Replymer. From $9/mo.',
  keywords: [
    'reddit marketing tool', 'reddit outreach', 'reddit lead generation',
    'reddit automation', 'reddit reply tool', 'reddit leads', 'saas marketing',
  ],
  openGraph: {
    title: 'Leaddit — Find High-Intent Reddit Leads Automatically',
    description: 'AI scans Reddit 24/7, scores every thread by buying intent, and drafts a perfect reply. You approve. It posts from your own account. From $9/mo.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leaddit — Find High-Intent Reddit Leads Automatically',
    description: 'AI scans Reddit 24/7, scores threads by buying intent, drafts replies. You approve. Posts from your account. From $9/mo.',
  },
  alternates: { canonical: 'https://leaddit.ai' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Leaddit',
  applicationCategory: 'BusinessApplication',
  description: 'AI-powered Reddit outreach tool that finds high-intent leads and posts contextual replies from your own Reddit account.',
  offers: [
    { '@type': 'Offer', price: '9', priceCurrency: 'USD', name: 'Starter' },
    { '@type': 'Offer', price: '19', priceCurrency: 'USD', name: 'Growth' },
    { '@type': 'Offer', price: '49', priceCurrency: 'USD', name: 'Agency' },
  ],
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative pt-24 pb-20 overflow-hidden bg-[#0d0d14]">
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-violet-700/20 rounded-full blur-[120px]" />
            <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-purple-800/15 rounded-full blur-[80px]" />
            <div className="absolute top-20 right-1/4 w-[350px] h-[350px] bg-indigo-800/15 rounded-full blur-[80px]" />
          </div>

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-violet-300 text-sm font-medium">Smarter than keyword matching · 5 intent signals</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight max-w-4xl mx-auto">
              Find the Reddit threads
              <span className="block mt-2 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                where people want to buy.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              AI monitors your target subreddits 24/7, scores every thread by buying intent,
              and drafts a contextual reply. You approve it. It posts from{' '}
              <span className="text-white font-medium">your own Reddit account</span>.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-violet-900/50 hover:shadow-violet-700/50 hover:-translate-y-0.5"
              >
                Start finding leads — free 7 days →
              </Link>
              <Link
                href="#how-it-works"
                className="w-full sm:w-auto border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium px-8 py-4 rounded-xl text-base transition-all"
              >
                See how it works
              </Link>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              No credit card required · 7-day money-back guarantee · Cancel anytime
            </p>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
              {[
                { n: '5', label: 'Intent signals scored' },
                { n: '$9', label: 'Starting price per month' },
                { n: '30m', label: 'Subreddit scan interval' },
              ].map(({ n, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-extrabold text-white">{n}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mock UI preview */}
          <div className="relative max-w-3xl mx-auto mt-16 px-4 sm:px-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-1 shadow-2xl">
              <div className="bg-[#12121f] rounded-xl overflow-hidden">
                {/* Fake browser bar */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  <div className="flex-1 mx-4 bg-white/5 rounded-md h-5" />
                </div>
                {/* Mock opportunity card */}
                <div className="p-4 space-y-3">
                  {[
                    { badge: '🔥 Ready to switch', color: 'bg-red-500/15 text-red-400', score: 94, sub: 'r/SaaS', title: '"Tired of paying $99/mo for Replymer with zero results. What do people actually use?"', why: 'Direct competitor complaint with active switching intent — highest priority lead.' },
                    { badge: 'Competitor frustration', color: 'bg-orange-500/15 text-orange-400', score: 81, sub: 'r/Entrepreneur', title: '"Is there a Reddit marketing tool that doesn\'t post from fake accounts? Got burned twice."', why: 'Explicitly asking for your exact differentiator — posts from your own account.' },
                    { badge: 'Looking for a tool', color: 'bg-blue-500/15 text-blue-400', score: 76, sub: 'r/startups', title: '"Best way to find potential customers on Reddit without getting banned?"', why: 'Research-mode buyer asking the exact question your tool answers.' },
                  ].map((card, i) => (
                    <div key={i} className="bg-white/[0.04] border border-white/8 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${card.color}`}>{card.badge}</span>
                            <span className="text-green-400 text-xs font-bold">{card.score}% intent</span>
                            <span className="text-gray-500 text-xs">{card.sub}</span>
                          </div>
                          <p className="text-white/90 text-sm font-medium">{card.title}</p>
                          <p className="text-violet-400 text-xs mt-1.5 bg-violet-500/10 rounded-lg px-2.5 py-1.5">💡 {card.why}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <div className="bg-violet-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold">Approve</div>
                          <div className="bg-white/5 text-gray-400 text-xs px-3 py-1.5 rounded-lg">Skip</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY REDDIT ──────────────────────────────────────────────────── */}
        <section className="bg-gray-50 py-16 border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { stat: '1.7B+', label: 'Monthly active Reddit users', sub: 'Your buyers are already there.' },
                { stat: '#3', label: 'Most linked domain in Google results', sub: 'Reddit answers rank above your ads.' },
                { stat: '91', label: 'Reddit domain authority score', sub: 'Your reply inherits that authority.' },
              ].map(({ stat, label, sub }) => (
                <div key={label} className="space-y-2">
                  <p className="text-4xl font-extrabold text-violet-600">{stat}</p>
                  <p className="font-semibold text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROBLEM ─────────────────────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl">
              <span className="text-violet-600 text-sm font-semibold uppercase tracking-widest">The problem</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-3 leading-tight">
                Reddit marketing without intent detection is just noise.
              </h2>
              <p className="text-gray-500 mt-4 text-lg leading-relaxed">
                Most tools find threads by keyword. They surface a thread where someone mentioned "CRM"
                — without knowing if they're complaining, curious, or about to buy. You waste hours
                reading dead-end threads.
              </p>
            </div>

            <div className="mt-14 grid md:grid-cols-2 gap-6">
              {/* Without */}
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8">
                <p className="text-red-600 font-bold text-sm uppercase tracking-widest mb-5">❌ Without Leaddit</p>
                <ul className="space-y-3.5 text-sm text-gray-700">
                  {[
                    '2–3 hours/day manually scanning subreddits',
                    'Keyword alerts with no context or intent',
                    'Reply to threads that aren\'t even looking for a solution',
                    'Get removed for tone-deaf pitching',
                    'No idea which subreddits actually convert',
                    'Account banned because you posted too fast',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* With */}
              <div className="bg-violet-50 border border-violet-100 rounded-2xl p-8">
                <p className="text-violet-600 font-bold text-sm uppercase tracking-widest mb-5">✓ With Leaddit</p>
                <ul className="space-y-3.5 text-sm text-gray-700">
                  {[
                    'AI scans every 30 minutes, you spend 10 mins reviewing',
                    'Every thread scored 0–100 by buying intent',
                    'Pain type classified: ready-to-switch, competitor frustration, and 3 more',
                    'AI reply tailored to their exact situation — not a template',
                    'Safety rails: warmup, daily caps, shadowban detection',
                    'Post from your own account — permanent trust, not rented',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="text-violet-500 mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-violet-600 text-sm font-semibold uppercase tracking-widest">How it works</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-3">From URL to lead in 3 steps.</h2>
              <p className="text-gray-500 mt-4">Set up takes under 5 minutes. Results start within 24 hours.</p>
            </div>

            <div className="mt-16 grid md:grid-cols-3 gap-8 relative">
              {/* Connector line (desktop only) */}
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-violet-200 via-purple-300 to-violet-200" />

              {[
                {
                  step: '01',
                  title: 'Paste your product URL',
                  desc: 'AI scrapes your landing page and extracts your product name, audience, key benefits, competitors, and a summary optimised for reply generation. Review and edit in seconds.',
                  icon: '🔗',
                },
                {
                  step: '02',
                  title: 'AI finds your buyers',
                  desc: 'We suggest 8–12 subreddits, scan them every 30 minutes, and score every new thread. Threads hitting 60+ intent score with a matching pain type appear in your queue.',
                  icon: '🎯',
                },
                {
                  step: '03',
                  title: 'Approve and post',
                  desc: 'Each thread comes with an AI-drafted reply explaining why it works. Edit if you want, then click Approve. It posts from your own account at a randomised human-like delay.',
                  icon: '✅',
                },
              ].map(({ step, title, desc, icon }) => (
                <div key={step} className="relative bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center text-2xl mb-6">
                    {icon}
                  </div>
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Step {step}</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INTENT SCORING ──────────────────────────────────────────────── */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-violet-600 text-sm font-semibold uppercase tracking-widest">The differentiator</span>
                <h2 className="text-4xl font-extrabold text-gray-900 mt-3 leading-tight">
                  5 intent signals. Not just keywords.
                </h2>
                <p className="text-gray-500 mt-4 leading-relaxed">
                  Every thread is classified into one of five buying intent signals. Each signal
                  unlocks a different reply strategy — because "I'm switching away from Competitor X"
                  needs a completely different response than "What tools do you use for Y?"
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    { type: '🔥 Ready to switch', desc: 'Actively looking to switch tools right now. Your highest-priority lead.', color: 'border-red-200 bg-red-50' },
                    { type: 'Competitor frustration', desc: 'Mentions a competitor negatively. Emotionally primed for an alternative.', color: 'border-orange-200 bg-orange-50' },
                    { type: 'Looking for a tool', desc: 'Asking for recommendations. Comparison-stage buyer.', color: 'border-blue-200 bg-blue-50' },
                    { type: 'ROI frustration', desc: 'Using something but getting no results. Ready to hear how you\'re different.', color: 'border-yellow-200 bg-yellow-50' },
                    { type: 'Workflow pain', desc: 'Struggling with the exact problem your product solves.', color: 'border-violet-200 bg-violet-50' },
                  ].map(({ type, desc, color }) => (
                    <div key={type} className={`flex items-start gap-3 p-4 rounded-xl border ${color}`}>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{type}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">How we score intent</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Thread title + body analysis', score: 40 },
                      { label: 'Top comment sentiment', score: 30 },
                      { label: 'Competitor mention detection', score: 20 },
                      { label: 'Solution-seeking language', score: 10 },
                    ].map(({ label, score }) => (
                      <div key={label}>
                        <div className="flex justify-between text-gray-600 mb-1">
                          <span>{label}</span>
                          <span className="font-medium text-violet-600">{score}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full">
                          <div className="h-1.5 rounded-full bg-violet-500" style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Threads below 60 are filtered out automatically</span>
                    <span className="text-violet-600 font-bold text-sm">60+ = queued</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURE GRID ────────────────────────────────────────────────── */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-violet-600 text-sm font-semibold uppercase tracking-widest">Everything you need</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-3">Built for founders who move fast.</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: '🛡️', title: 'Post from your own account', desc: 'Every reply comes from your Reddit identity. Builds real karma, real trust, and a real presence that compounds over time.' },
                { icon: '🤖', title: 'Claude-powered reply drafts', desc: 'Each reply is written from scratch using the thread context, your product profile, and the specific pain type. Zero template fingerprint.' },
                { icon: '🔥', title: '7–14 day account warmup', desc: 'New accounts post 2–3 helpful non-promo comments daily before any promotional reply. Identical to how a real human would warm up.' },
                { icon: '👁️', title: 'Shadowban detection', desc: 'We check visibility after every post. First sign of a shadowban triggers instant pause and alerts you — before you waste more replies.' },
                { icon: '📊', title: 'Subreddit safety scanner', desc: 'Auto-reads subreddit rules before adding to watchlist. Flags no-promo subreddits. Auto-blacklists if removal rate exceeds 30%.' },
                { icon: '⏱️', title: 'Human-pace posting', desc: 'Approved replies post after a randomised 5–45 minute delay. No pattern, no burst, no spam flags.' },
                { icon: '🔁', title: '1:3 ratio enforcer', desc: 'For every promotional reply, we auto-post 3 genuinely helpful comments to other threads. Keeps your ratio Reddit-safe.' },
                { icon: '📬', title: 'Daily opportunity digest', desc: 'One email every morning with new high-intent threads found overnight. Start your day knowing exactly where to show up.' },
                { icon: '🔄', title: 'Regenerate in one click', desc: 'Don\'t like the draft? Hit regenerate for a fresh take. Each version is structurally different so your replies never look scripted.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-violet-200 hover:shadow-md transition-all">
                  <div className="text-3xl mb-4">{icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────────────────────── */}
        <section id="pricing" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-violet-600 text-sm font-semibold uppercase tracking-widest">Pricing</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-3">Cheaper than one bad hire.</h2>
              <p className="text-gray-500 mt-4">All plans include the full feature set. No artificial limits on the AI quality.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  name: 'Starter',
                  price: 9,
                  desc: 'Solo founders testing Reddit as a channel.',
                  features: ['1 product profile', '200 opportunities/mo', '60 replies/mo', 'Full intent scoring', 'Account warmup', 'Email digest'],
                  cta: 'Start with Starter',
                  highlight: false,
                },
                {
                  name: 'Growth',
                  price: 19,
                  desc: 'Growing teams doubling down on Reddit.',
                  features: ['3 product profiles', '1,000 opportunities/mo', '300 replies/mo', 'Everything in Starter', 'Priority scanning', 'Slack alerts'],
                  cta: 'Start with Growth',
                  highlight: true,
                },
                {
                  name: 'Agency',
                  price: 49,
                  desc: 'Agencies managing multiple clients.',
                  features: ['10 product profiles', '5,000 opportunities/mo', 'Unlimited replies', 'Everything in Growth', 'Backup account support', 'White-label reports'],
                  cta: 'Start with Agency',
                  highlight: false,
                },
              ].map(({ name, price, desc, features, cta, highlight }) => (
                <div
                  key={name}
                  className={`relative rounded-2xl p-8 flex flex-col ${
                    highlight
                      ? 'bg-violet-600 text-white shadow-2xl shadow-violet-200 scale-105'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                      MOST POPULAR
                    </div>
                  )}
                  <div>
                    <h3 className={`font-bold text-lg ${highlight ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
                    <p className={`text-sm mt-1 ${highlight ? 'text-violet-200' : 'text-gray-500'}`}>{desc}</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className={`text-5xl font-extrabold ${highlight ? 'text-white' : 'text-gray-900'}`}>${price}</span>
                      <span className={`text-sm ${highlight ? 'text-violet-200' : 'text-gray-400'}`}>/mo</span>
                    </div>
                  </div>

                  <ul className="mt-8 space-y-3 flex-1">
                    {features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <svg className={`w-4 h-4 mt-0.5 shrink-0 ${highlight ? 'text-violet-200' : 'text-violet-500'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={highlight ? 'text-violet-100' : 'text-gray-600'}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login"
                    className={`mt-8 block text-center font-bold py-3 rounded-xl transition-all ${
                      highlight
                        ? 'bg-white text-violet-700 hover:bg-violet-50'
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                    }`}
                  >
                    {cta}
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-400 text-sm mt-8">
              All plans include a 7-day money-back guarantee. No contracts, cancel anytime.
            </p>
          </div>
        </section>

        {/* ── COMPARISON TABLE ─────────────────────────────────────────────── */}
        <section id="compare" className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-violet-600 text-sm font-semibold uppercase tracking-widest">Compare</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-3">Why founders switch to Leaddit.</h2>
              <p className="text-gray-500 mt-4">We're not the only Reddit marketing tool. But we're the only one built for safety-first, intent-first outreach.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="text-left px-6 py-5 font-semibold">Feature</th>
                    {[
                      { name: 'Leaddit', highlight: true },
                      { name: 'Replymer', highlight: false },
                      { name: 'Beno', highlight: false },
                      { name: 'RedditGrow', highlight: false },
                    ].map(({ name, highlight }) => (
                      <th key={name} className={`px-6 py-5 font-semibold text-center ${highlight ? 'text-violet-400' : 'text-gray-400'}`}>
                        {name}
                        {highlight && <span className="ml-1.5 text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">← you</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {[
                    ['Starting price', '$9/mo', '$99/mo', 'Credits (~$30+)', '$19.50/mo'],
                    ['Posts from your account', '✓', '✗', '✗', '✓'],
                    ['Intent scoring (0–100)', '✓', '✗', '✗', '✗'],
                    ['Pain type classification', '✓ (5 types)', '✗', '✗', '✗'],
                    ['Account warmup system', '✓', '✗', '✗', 'Basic'],
                    ['Shadowban detection', '✓', '✗', '✗', '✗'],
                    ['Subreddit rules scanner', '✓', '✗', '✗', '✗'],
                    ['Human-pace delay', '✓', '✗', '✗', 'Basic'],
                    ['Reply quality', 'Claude claude-sonnet-4-20250514', 'GPT-3.5', 'GPT-3.5', 'GPT-4'],
                    ['You approve before posting', '✓', '✗', 'Optional', '✓'],
                  ].map(([feature, leaddit, replymer, beno, redditgrow]) => (
                    <tr key={feature} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-700">{feature}</td>
                      <td className="px-6 py-4 text-center text-violet-700 font-semibold bg-violet-50/50">{leaddit}</td>
                      <td className="px-6 py-4 text-center text-gray-400">{replymer}</td>
                      <td className="px-6 py-4 text-center text-gray-400">{beno}</td>
                      <td className="px-6 py-4 text-center text-gray-400">{redditgrow}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {[
                { label: 'Leaddit vs Replymer', href: '/compare/vs-replymer' },
                { label: 'Leaddit vs Beno', href: '/compare/vs-beno' },
                { label: 'Leaddit vs RedditGrow', href: '/compare/vs-redditgrow' },
                { label: 'Leaddit vs Manual outreach', href: '/compare/vs-manual' },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-violet-600 hover:text-violet-800 hover:underline font-medium"
                >
                  {label} →
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-violet-600 text-sm font-semibold uppercase tracking-widest">Social proof</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-3">Founders see results fast.</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: "I approved 4 replies on my first day. Two of them turned into demo calls. The intent scoring is genuinely impressive — it only surfaced threads where people were clearly ready to switch.",
                  name: 'Marcus T.',
                  role: 'Founder, B2B SaaS',
                  stars: 5,
                },
                {
                  quote: "Replymer got my previous account flagged within a week. With Leaddit I've been posting for 2 months — warmup worked perfectly, karma is growing, zero bans. The safety rails alone are worth $9/mo.",
                  name: 'Priya K.',
                  role: 'Growth Lead, Early-stage startup',
                  stars: 5,
                },
                {
                  quote: "As an agency we manage 6 client products. The multi-product setup works exactly as expected and our clients love the daily digest. Saves us about 15 hours a week across the team.",
                  name: 'Daniel R.',
                  role: 'Founder, Growth Agency',
                  stars: 5,
                },
              ].map(({ quote, name, role, stars }) => (
                <div key={name} className="bg-gray-50 border border-gray-200 rounded-2xl p-7 flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: stars }).map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed flex-1">"{quote}"</p>
                  <div className="mt-5 pt-5 border-t border-gray-200">
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section id="faq" className="py-24 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <span className="text-violet-600 text-sm font-semibold uppercase tracking-widest">FAQ</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-3">Questions we get a lot.</h2>
            </div>
            <FAQAccordion />
          </div>
        </section>

        {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
        <section className="py-24 bg-[#0d0d14] relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-700/20 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Your next 10 customers are already on Reddit.
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              The question is whether you find them before your competitor does.
            </p>
            <Link
              href="/login"
              className="mt-10 inline-block bg-violet-600 hover:bg-violet-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-xl shadow-violet-900/50 hover:-translate-y-0.5"
            >
              Find my first lead →
            </Link>
            <p className="mt-4 text-sm text-gray-600">7-day money-back guarantee. No credit card required to start.</p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
                  </svg>
                </div>
                <span className="font-bold text-white text-lg">Leaddit</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                AI-powered Reddit outreach that finds high-intent leads and posts contextual replies from your own account.
              </p>
              <div className="flex gap-3">
                {['Twitter / X', 'LinkedIn'].map(s => (
                  <a key={s} href="#" className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors">{s}</a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  ['Features', '#features'],
                  ['Pricing', '#pricing'],
                  ['How it works', '#how-it-works'],
                  ['Changelog', '/changelog'],
                  ['Roadmap', '/roadmap'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  ['Blog', '/blog'],
                  ['Reddit Marketing Guide', '/blog/reddit-marketing-guide'],
                  ['Intent Scoring Explained', '/blog/intent-scoring'],
                  ['Account Warmup Guide', '/blog/account-warmup'],
                  ['Case Studies', '/blog/case-studies'],
                  ['Documentation', '/docs'],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compare + Company */}
            <div className="space-y-8">
              <div>
                <h4 className="font-semibold text-white text-sm mb-4">Compare</h4>
                <ul className="space-y-2.5 text-sm">
                  {[
                    ['vs Replymer', '/compare/vs-replymer'],
                    ['vs Beno', '/compare/vs-beno'],
                    ['vs RedditGrow', '/compare/vs-redditgrow'],
                    ['vs Manual outreach', '/compare/vs-manual'],
                  ].map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm mb-4">Company</h4>
                <ul className="space-y-2.5 text-sm">
                  {[
                    ['About', '/about'],
                    ['Contact', '/contact'],
                    ['Privacy Policy', '/privacy'],
                    ['Terms of Service', '/terms'],
                  ].map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} Leaddit. All rights reserved.</p>
            <p>Made for founders who don't have time to scroll Reddit all day.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
