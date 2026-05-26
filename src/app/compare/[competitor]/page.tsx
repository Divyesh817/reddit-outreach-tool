import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import '../../landing.css'

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
    headline: 'Redgrow vs Replymer — 11× cheaper, safer, and smarter.',
    summary: 'Replymer is the most expensive Reddit marketing tool on the market at $99/mo. It posts from a shared network of accounts (not yours), has no intent scoring, no warmup system, and no shadowban protection. Redgrow does all of this for $9/mo.',
    verdict: "If you're on Replymer and your account hasn't been flagged yet, it's a matter of time. Redgrow posts from your own account with warmup, safety rails, and 5× better intent detection — at 11× the price saving.",
    rows: [
      ['Starting price', '$9/mo', '$99/mo'],
      ['Posts from your own account', '✓ Yes', '✗ Shared network'],
      ['Intent scoring', '✓ 0–100 + 5 pain types', '✗ None'],
      ['Account warmup', '✓ 7–14 days built in', '✗ None'],
      ['Shadowban detection', '✓ After every post', '✗ None'],
      ['You approve before posting', '✓ Required', '✗ Fully automatic'],
      ['Subreddit safety scanner', '✓ Automatic', '✗ None'],
      ['Reply quality', '✓ Claude AI per thread', '✗ Generic GPT-3.5'],
      ['Daily posting cap', '✓ Enforced for safety', '✗ None'],
    ],
  },
  'vs-beno': {
    name: 'Beno',
    slug: 'vs-beno',
    price: 'Credits (~$30+/mo)',
    headline: 'Redgrow vs Beno — predictable pricing, better intent detection.',
    summary: 'Beno uses a credit-based pricing model that becomes expensive fast. It posts from their own account network (not yours), and the intent matching is basic keyword-level — no 0–100 scoring, no pain type classification.',
    verdict: "Beno is fine for dipping your toes in Reddit marketing. But if you want to scale, the credit model eats budget fast and the lack of safety rails means you'll burn through accounts. Redgrow gives you a fixed monthly cost and full safety infrastructure.",
    rows: [
      ['Starting price', '$9/mo flat', 'Credits ($30+ typical)'],
      ['Predictable pricing', '✓ Fixed monthly', '✗ Credit burn'],
      ['Posts from your own account', '✓ Yes', '✗ Their network'],
      ['Intent scoring', '✓ 0–100 + 5 types', '✗ Keyword matching'],
      ['Account warmup', '✓ Built in', '✗ None'],
      ['Shadowban detection', '✓ Yes', '✗ None'],
      ['You approve before posting', '✓ Required', '~ Optional'],
      ['Reply quality', '✓ Claude AI', '✗ GPT-3.5'],
    ],
  },
  'vs-redditgrow': {
    name: 'RedditGrow',
    slug: 'vs-redditgrow',
    price: '$19.50/mo',
    headline: 'Redgrow vs RedditGrow — same price tier, completely different depth.',
    summary: "RedditGrow posts from your own account, which is the right approach. But it stops there. No intent scoring, no pain type classification, no warmup system, and replies are template-style GPT-4 completions without thread-specific context.",
    verdict: "RedditGrow has the right idea (your own account) but not the execution. Redgrow adds the intent intelligence layer that makes the difference between replying to the right thread at the right time vs. spraying replies and hoping.",
    rows: [
      ['Starting price', '$9/mo', '$19.50/mo'],
      ['Posts from your own account', '✓ Yes', '✓ Yes'],
      ['Intent scoring (0–100)', '✓ Yes', '✗ No'],
      ['Pain type classification', '✓ 5 types', '✗ No'],
      ['Account warmup', '✓ 7–14 days', '~ Basic'],
      ['Shadowban detection', '✓ Real-time', '✗ No'],
      ['Subreddit safety scanner', '✓ Yes', '✗ No'],
      ['Reply quality', '✓ Context-specific Claude', '~ Template GPT-4'],
      ['Daily safety caps', '✓ Enforced', '~ Basic'],
    ],
  },
  'vs-manual': {
    name: 'Manual Outreach',
    slug: 'vs-manual',
    price: '~2–3 hrs/day',
    headline: 'Redgrow vs Manual Reddit Outreach — 10 minutes vs 3 hours.',
    summary: "Manual Reddit outreach means reading subreddits by hand, judging intent yourself, writing replies from scratch, and remembering which subreddits you've already posted in. It works — but it doesn't scale, and one bad day means zero leads.",
    verdict: "Manual outreach is how every successful Reddit marketer starts. Redgrow is what you upgrade to when you want the results without the daily grind. You still control every reply — you just don't spend 3 hours finding the right threads.",
    rows: [
      ['Time investment', '~10 min/day review', '2–3 hours/day'],
      ['Scanning speed', 'Every 30 minutes, 24/7', 'When you remember'],
      ['Intent accuracy', 'AI-scored 0–100', 'Gut feeling'],
      ['Reply consistency', 'Always drafted, always reviewed', 'Depends on your energy'],
      ['Subreddit coverage', 'All watchlist subs, every 30 min', 'What you can manually open'],
      ['Safety tracking', '✓ Automated', '✗ Spreadsheet if lucky'],
      ['Scales to 10 products', '✓ Yes', '✗ Not without hiring'],
    ],
  },
}

export async function generateMetadata({ params }: { params: { competitor: string } }): Promise<Metadata> {
  const c = competitors[params.competitor]
  if (!c) return {}
  return {
    title: `${c.headline} | Redgrow`,
    description: c.summary,
    alternates: { canonical: `https://redgrow.app/compare/${c.slug}` },
  }
}

export default function ComparePage({ params }: { params: { competitor: string } }) {
  const c = competitors[params.competitor]
  if (!c) notFound()

  const savings = c.name === 'Replymer' ? '$90/mo' : c.name === 'RedditGrow' ? '$10.50/mo' : c.name === 'Beno' ? '$21+/mo' : '3 hrs/day'

  return (
    <div className="lp">
      <nav className="nav" style={{ position: 'relative', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap nav-row">
          <Link href="/" className="logo"><span className="logo-mark"></span><span>Redgrow</span></Link>
          <div className="nav-links">
            <Link href="/#features">Features</Link>
            <Link href="/compare/vs-replymer">vs Replymer</Link>
            <Link href="/compare/vs-beno">vs Beno</Link>
          </div>
          <div className="nav-cta">
            <Link href="/login" className="login">Login</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Get started <span className="arr">→</span></Link>
          </div>
        </div>
      </nav>

      <section>
        <div className="narrow">
          <Link href="/" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--orange)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>← Back</Link>
          <div className="section-num"><span><strong>Compare</strong> — Redgrow vs {c.name}</span></div>
          <h1 style={{ fontSize: 'clamp(32px,4.5vw,60px)', marginTop: '12px', letterSpacing: '-.03em' }}>{c.headline}</h1>
          <p style={{ fontSize: '17px', marginTop: '22px', borderTop: '1px solid var(--line)', paddingTop: '22px', maxWidth: '52ch', color: 'var(--ink-2)' }}>{c.summary}</p>

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0', marginTop: '48px', borderTop: '1px solid var(--line)' }}>
            {[
              { label: 'Redgrow price', value: '$9/mo' },
              { label: `${c.name} price`, value: c.price },
              { label: 'You save', value: savings },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '28px 20px', borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '8px' }}>{label}</div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: '40px', fontWeight: 430, letterSpacing: '-.03em', color: 'var(--orange)' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ marginTop: '48px', borderTop: '1px solid var(--line)', borderLeft: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', background: 'var(--ink)', padding: '14px 20px' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(251,246,238,.55)' }}>Feature</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--orange)', textAlign: 'center' }}>Redgrow</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(251,246,238,.55)', textAlign: 'center' }}>{c.name}</div>
            </div>
            {c.rows.map(([feature, redgrow, competitor], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '14px 20px', borderTop: '1px solid var(--line)', background: i % 2 === 0 ? 'var(--paper)' : 'var(--cream)' }}>
                <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 500 }}>{feature}</div>
                <div style={{ fontSize: '13.5px', color: 'var(--green)', fontWeight: 600, textAlign: 'center' }}>{redgrow}</div>
                <div style={{ fontSize: '13.5px', color: 'var(--ink-3)', textAlign: 'center' }}>{competitor}</div>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div style={{ marginTop: '48px', padding: '36px', background: 'var(--cream-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' }}>
            <div className="eyebrow" style={{ marginBottom: '10px' }}>Bottom line</div>
            <p style={{ fontSize: '16px', lineHeight: 1.6 }}>{c.verdict}</p>
            <div style={{ marginTop: '24px' }}>
              <Link href="/login" className="btn btn-orange">Try Redgrow free <span className="arr">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="wrap foot-bottom" style={{ marginTop: 0, paddingTop: '24px' }}>
          <div>© 2026 Redgrow</div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
