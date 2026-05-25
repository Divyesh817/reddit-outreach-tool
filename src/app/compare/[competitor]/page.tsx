import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/landing/Navbar'

const competitors: Record<string, {
  name: string
  slug: string
  price: string
  headline: string
  summary: string
  rows: [string, string, string][]
  verdict: string
}> = {
  'vs-replymer': {
    name: 'Replymer',
    slug: 'vs-replymer',
    price: '$99/mo',
    headline: 'Leaddit vs Replymer — 11× cheaper, safer, and smarter.',
    summary: 'Replymer is the most expensive Reddit marketing tool on the market at $99/mo. It posts from a shared network of accounts (not yours), has no intent scoring, no warmup system, and no shadowban protection. Leaddit does all of this for $9/mo.',
    verdict: 'If you\'re on Replymer and your account hasn\'t been flagged yet, it\'s a matter of time. Leaddit posts from your own account with warmup, safety rails, and 5× better intent detection — at 11× the price saving.',
    rows: [
      ['Starting price', '$9/mo', '$99/mo'],
      ['Posts from your own account', '✓ Yes', '✗ Shared network'],
      ['Intent scoring', '✓ 0–100 + 5 pain types', '✗ None'],
      ['Account warmup', '✓ 7–14 days built in', '✗ None'],
      ['Shadowban detection', '✓ After every post', '✗ None'],
      ['You approve before posting', '✓ Required', '✗ Fully automatic'],
      ['Subreddit rules scanner', '✓ Automatic', '✗ None'],
      ['Reply quality', '✓ Claude claude-sonnet-4-20250514 per thread', '✗ Generic GPT-3.5'],
      ['Daily posting cap', '✓ Enforced for safety', '✗ None'],
    ],
  },
  'vs-beno': {
    name: 'Beno',
    slug: 'vs-beno',
    price: 'Credits (~$30+/mo)',
    headline: 'Leaddit vs Beno — predictable pricing, better intent detection.',
    summary: 'Beno uses a credit-based pricing model that becomes expensive fast. It posts from their own account network (not yours), and the intent matching is basic keyword-level — no 0–100 scoring, no pain type classification.',
    verdict: 'Beno is fine for dipping your toes in Reddit marketing. But if you want to scale, the credit model eats budget fast and the lack of safety rails means you\'ll burn through accounts. Leaddit gives you a fixed monthly cost and full safety infrastructure.',
    rows: [
      ['Starting price', '$9/mo flat', 'Credits ($30+ typical)'],
      ['Predictable pricing', '✓ Fixed monthly', '✗ Credit burn'],
      ['Posts from your own account', '✓ Yes', '✗ Their network'],
      ['Intent scoring', '✓ 0–100 + 5 types', '✗ Keyword matching'],
      ['Account warmup', '✓ Built in', '✗ None'],
      ['Shadowban detection', '✓ Yes', '✗ None'],
      ['You approve before posting', '✓ Required', '~ Optional'],
      ['Reply quality', '✓ Claude claude-sonnet-4-20250514', '✗ GPT-3.5'],
    ],
  },
  'vs-redditgrow': {
    name: 'RedditGrow',
    slug: 'vs-redditgrow',
    price: '$19.50/mo',
    headline: 'Leaddit vs RedditGrow — same price tier, completely different depth.',
    summary: 'RedditGrow posts from your own account like Leaddit does, which is a good start. But it stops there. No intent scoring, no pain type classification, no warmup system, and replies are template-style GPT-4 completions without thread-specific context.',
    verdict: 'RedditGrow has the right idea (your own account) but not the execution. Leaddit adds the intent intelligence layer that makes the difference between replying to the right thread at the right time vs. spraying replies and hoping.',
    rows: [
      ['Starting price', '$9/mo', '$19.50/mo'],
      ['Posts from your own account', '✓ Yes', '✓ Yes'],
      ['Intent scoring (0–100)', '✓ Yes', '✗ No'],
      ['Pain type classification', '✓ 5 types', '✗ No'],
      ['Account warmup', '✓ 7–14 days', '~ Basic'],
      ['Shadowban detection', '✓ Real-time', '✗ No'],
      ['Subreddit rules scanner', '✓ Yes', '✗ No'],
      ['Reply quality', '✓ Context-specific Claude', '~ Template GPT-4'],
      ['Daily safety caps', '✓ Enforced', '~ Basic'],
    ],
  },
  'vs-manual': {
    name: 'Manual Outreach',
    slug: 'vs-manual',
    price: '~2–3 hrs/day',
    headline: 'Leaddit vs Manual Reddit Outreach — 10 minutes vs 3 hours.',
    summary: 'Manual Reddit outreach means reading subreddits by hand, judging intent yourself, writing replies from scratch, and remembering which subreddits you\'ve already posted in. It works — but it doesn\'t scale, and one bad day means zero leads.',
    verdict: 'Manual outreach is how every successful Reddit marketer starts. Leaddit is what you upgrade to when you want the results without the daily grind. You still control every reply — you just don\'t spend 3 hours finding the right threads.',
    rows: [
      ['Time investment', '~10 min/day review', '2–3 hours/day'],
      ['Scanning speed', 'Every 30 minutes, 24/7', 'When you remember'],
      ['Intent accuracy', 'AI-scored 0–100', 'Gut feeling'],
      ['Reply consistency', 'Always drafted, always reviewed', 'Depends on your energy'],
      ['Subreddit coverage', 'All watchlist subs, every 30 min', 'What you can manually open'],
      ['Safety tracking', '✓ Automated', '✗ Spreadsheet if you\'re lucky'],
      ['Scales to 10 products', '✓ Yes', '✗ Not without hiring'],
    ],
  },
}

export async function generateMetadata({ params }: { params: { competitor: string } }): Promise<Metadata> {
  const c = competitors[params.competitor]
  if (!c) return {}
  return {
    title: `${c.headline} | Leaddit`,
    description: c.summary,
    alternates: { canonical: `https://leaddit.ai/compare/${c.slug}` },
  }
}

export default function ComparePage({ params }: { params: { competitor: string } }) {
  const c = competitors[params.competitor]
  if (!c) notFound()

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Header */}
          <div>
            <Link href="/#compare" className="text-sm text-violet-600 hover:underline">← Back to comparison</Link>
            <h1 className="text-4xl font-extrabold text-gray-900 mt-4 leading-tight">{c.headline}</h1>
            <p className="text-gray-500 mt-4 text-lg leading-relaxed max-w-3xl">{c.summary}</p>
          </div>

          {/* Quick stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Leaddit price', value: '$9/mo' },
              { label: `${c.name} price`, value: c.price },
              { label: 'You save', value: c.name === 'Replymer' ? '$90/mo' : c.name === 'RedditGrow' ? '$10.50/mo' : 'Time + money' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-extrabold text-violet-600 mt-1">{value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-6 py-4 font-semibold">Feature</th>
                  <th className="px-6 py-4 font-semibold text-center text-violet-400">Leaddit</th>
                  <th className="px-6 py-4 font-semibold text-center text-gray-400">{c.name}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {c.rows.map(([feature, leaddit, competitor]) => (
                  <tr key={feature} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-700">{feature}</td>
                    <td className="px-6 py-4 text-center text-violet-700 font-semibold bg-violet-50/50">{leaddit}</td>
                    <td className="px-6 py-4 text-center text-gray-400">{competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Verdict */}
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-8">
            <h2 className="font-bold text-gray-900 text-lg mb-3">Bottom line</h2>
            <p className="text-gray-700 leading-relaxed">{c.verdict}</p>
            <Link
              href="/login"
              className="inline-block mt-6 bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Try Leaddit free for 7 days →
            </Link>
          </div>

          {/* Other comparisons */}
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-3">Also compare:</p>
            <div className="flex flex-wrap gap-3">
              {Object.values(competitors)
                .filter(x => x.slug !== c.slug)
                .map(x => (
                  <Link
                    key={x.slug}
                    href={`/compare/${x.slug}`}
                    className="text-sm text-violet-600 hover:underline font-medium"
                  >
                    Leaddit vs {x.name} →
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
