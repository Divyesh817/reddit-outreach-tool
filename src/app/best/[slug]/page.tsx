import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import '../../landing.css'

type Tool = { name: string; price: string; bestFor: string; weakness: string; verdict: string; isBest?: boolean }
type Page = {
  slug: string
  title: string
  eyebrow: string
  headline: string
  subheadline: string
  intro: string[]
  tools: Tool[]
  winner: { name: string; why: string }
  related: { href: string; label: string }[]
  metaDescription: string
}

const pages: Record<string, Page> = {
  'reddit-marketing-tools-for-saas-founders': {
    slug: 'reddit-marketing-tools-for-saas-founders',
    title: 'Best Reddit Marketing Tools for SaaS Founders (2026)',
    eyebrow: 'Tool Roundup',
    headline: 'The best Reddit marketing tools for SaaS founders — ranked honestly.',
    subheadline: "I've tried every tool in this category. Here's what they actually do, what they cost, and which one I'd use if I were starting from scratch today.",
    metaDescription: 'Honest comparison of the best Reddit marketing tools for SaaS founders in 2026. Pricing, features, risks — and which one to pick.',
    intro: [
      "Reddit is the best B2B channel most SaaS founders never use properly. Not because they don't try — because the tooling for doing it safely and at scale has been expensive, risky, or just bad.",
      "This changed over the last year. There are now a handful of tools worth talking about. Here's what each one actually does, what it costs, and the honest trade-offs.",
    ],
    tools: [
      {
        name: 'Redgrow',
        price: 'Free → $9/mo',
        bestFor: 'Founders who want intent-based leads with zero ban risk',
        weakness: 'You paste replies manually — not fully automated',
        verdict: "The only tool that combines intent scoring, pain type classification, and safety rails in one product. Starts free. Posts from your own account. AI drafts the reply, you paste it. The manual paste step is a feature, not a bug — it's why accounts using Redgrow don't get banned.",
        isBest: true,
      },
      {
        name: 'Replymer',
        price: '$99/mo',
        bestFor: 'Teams with budget who want full automation',
        weakness: 'Posts from a shared account network — ban risk is real',
        verdict: "11x more expensive than Redgrow. Posts from their proxy network rather than your own Reddit account, which is a meaningful ban risk. Intent detection is basic keyword matching. The automation is convenient until an account gets flagged.",
      },
      {
        name: 'Beno',
        price: 'Credits (~$30+/mo typical)',
        bestFor: 'Low-volume, occasional use',
        weakness: 'Credit model gets expensive fast; no safety infrastructure',
        verdict: "Fine for dipping your toes in. The credit model makes budgeting unpredictable, and there's no warmup, shadowban detection, or ratio enforcement. Use it if you want to test the channel before committing to a monthly tool.",
      },
      {
        name: 'F5Bot (free)',
        price: 'Free',
        bestFor: 'Basic keyword mention alerts',
        weakness: 'Just sends email alerts — no reply drafting, no scoring',
        verdict: "Free keyword monitoring that emails you when your brand or keywords appear on Reddit. Good starting point, but you're on your own for everything after the alert: evaluating intent, writing the reply, managing posting safety.",
      },
      {
        name: 'Manual monitoring',
        price: '2–3 hrs/day',
        bestFor: 'Very early stage with no budget',
        weakness: 'Doesn\'t scale; consistency depends entirely on your energy',
        verdict: "How everyone starts. Open Reddit, search your keywords, scan new posts, write replies. Works — but you miss threads, forget subreddits, and burn out. Use this for the first few weeks to learn the channel, then automate.",
      },
    ],
    winner: {
      name: 'Redgrow',
      why: "It's the only tool in this list that solves all three problems at once: finding the right threads (intent scoring), writing the right reply (pain-type contextual drafts), and keeping your account safe (manual paste, warmup, ratio enforcement, ban detection). And it starts free.",
    },
    related: [
      { href: '/best/tools-to-find-leads-on-reddit', label: 'Best tools to find leads on Reddit' },
      { href: '/best/reddit-monitoring-tool-for-startups', label: 'Best Reddit monitoring tools for startups' },
      { href: '/compare/vs-replymer', label: 'Redgrow vs Replymer — detailed comparison' },
    ],
  },

  'tools-to-find-leads-on-reddit': {
    slug: 'tools-to-find-leads-on-reddit',
    title: 'Best Tools to Find Leads on Reddit (2026)',
    eyebrow: 'Lead Generation Tools',
    headline: 'The best tools to find leads on Reddit — what works and what doesn\'t.',
    subheadline: 'Reddit has more warm leads than any other free channel. The bottleneck is finding them before they go cold.',
    metaDescription: 'Ranked: the best tools for finding leads on Reddit in 2026. From free monitors to AI-powered intent detection — which one to use.',
    intro: [
      "Finding leads on Reddit is a timing problem as much as a discovery problem. A thread asking for a tool recommendation is a warm lead for about 24–48 hours. After that, the person has moved on, and your reply looks out of place.",
      "The tools in this list solve different parts of the problem. Some just monitor. Some score intent. Some draft the reply. Here's how they stack up.",
    ],
    tools: [
      {
        name: 'Redgrow',
        price: 'Free → $9/mo',
        bestFor: 'Full pipeline: find thread, score intent, draft reply',
        weakness: 'Manual paste required (by design)',
        verdict: "Covers the entire lead-finding pipeline in one tool. Scans subreddits every hour, scores every thread 0–100 for buying intent, classifies the pain type, and drafts a contextual reply. The freshness filter ensures you only see threads from the last 24 hours.",
        isBest: true,
      },
      {
        name: 'Reddit search (native)',
        price: 'Free',
        bestFor: 'One-off searches',
        weakness: 'No alerts, no scoring, no history',
        verdict: "Good for a manual spot check. Terrible for consistent lead generation. No way to track new posts, no way to filter by intent, no history of what you've already replied to.",
      },
      {
        name: 'Mention.com',
        price: '$41/mo+',
        bestFor: 'Brand monitoring across all channels',
        weakness: 'Overkill for Reddit-only; no intent scoring',
        verdict: "Great if you need to monitor Reddit, Twitter, news, and reviews in one place. But for Reddit-specific lead generation it's expensive and doesn't score intent — you still have to read every mention and judge it yourself.",
      },
      {
        name: 'GummySearch',
        price: '$29/mo',
        bestFor: 'Audience research and subreddit discovery',
        weakness: 'No reply drafting; research tool not outreach tool',
        verdict: "Excellent for understanding what your audience talks about on Reddit. Not built for finding live, time-sensitive buying-intent threads. Use it for strategy and subreddit discovery, not for daily outreach.",
      },
      {
        name: 'F5Bot',
        price: 'Free',
        bestFor: 'Brand and keyword mention email alerts',
        weakness: 'Email only; no scoring; no reply help',
        verdict: "Reliable and free. Gets you the alert. Doesn't tell you if the mention is worth replying to, doesn't draft anything, doesn't track what you've responded to. Good supplemental tool.",
      },
    ],
    winner: {
      name: 'Redgrow',
      why: "For finding time-sensitive buying-intent leads on Reddit specifically, nothing else in this list closes the full loop from discovery to reply draft. The 0–100 intent score and pain type classification means you spend time only on threads that are actually worth replying to.",
    },
    related: [
      { href: '/best/reddit-marketing-tools-for-saas-founders', label: 'Best Reddit marketing tools for SaaS founders' },
      { href: '/how-to/find-buying-intent-threads-on-reddit', label: 'How to find buying intent threads on Reddit' },
      { href: '/for/reddit-lead-generation-for-agencies', label: 'Reddit lead generation for agencies' },
    ],
  },

  'reddit-monitoring-tool-for-startups': {
    slug: 'reddit-monitoring-tool-for-startups',
    title: 'Best Reddit Monitoring Tool for Startups (2026)',
    eyebrow: 'Monitoring Tools',
    headline: 'The best Reddit monitoring tools for startups — ranked by what actually matters.',
    subheadline: "Monitoring Reddit is the easy part. Acting on what you find, while it's still warm — that's where most tools fall short.",
    metaDescription: 'Best Reddit monitoring tools for startups in 2026. Compare features, pricing, and which one converts mentions into real leads.',
    intro: [
      "Every startup should be monitoring Reddit for: their brand name, their competitors' names, the problem they solve, and phrases that signal someone is ready to switch tools. That's the baseline.",
      "The tools below differ in how deep they go past the alert. Some just email you. Some score what they find. Some take you all the way to a reply draft. Here's what each one does.",
    ],
    tools: [
      {
        name: 'Redgrow',
        price: 'Free → $9/mo',
        bestFor: 'Startups who want to act on every monitoring alert',
        weakness: 'Reddit-only (no Twitter, news monitoring)',
        verdict: "Built specifically for the problem startups have on Reddit: knowing when someone is looking for a solution like yours, and responding while the thread is still active. Monitors all your subreddits hourly, scores intent, drafts the reply. Everything in one workflow.",
        isBest: true,
      },
      {
        name: 'F5Bot',
        price: 'Free',
        bestFor: 'Basic brand and keyword alerts, zero budget',
        weakness: 'Email-only, no scoring, limited to 10 keywords on free tier',
        verdict: "The classic starting point. Free, reliable, sends you an email when your keywords appear. You still have to open each thread, evaluate if it's worth replying to, and write the reply yourself. Perfect for early-stage startups with no budget.",
      },
      {
        name: 'Brand24',
        price: '$99/mo+',
        bestFor: 'Enterprise brand monitoring across all channels',
        weakness: 'Very expensive; Reddit is just one of many sources',
        verdict: "Enterprise-grade. If you need Reddit plus Twitter plus news plus review sites in a unified dashboard, Brand24 is worth looking at. If you're a startup and Reddit is your focus, this is overkill by about 10x.",
      },
      {
        name: 'Reddit native alerts',
        price: 'Free',
        bestFor: 'Specific subreddit or keyword follows',
        weakness: 'Slow, unreliable, no cross-subreddit monitoring',
        verdict: "Reddit lets you follow subreddits and get email notifications. Unreliable timing, no keyword filtering, no intent scoring. Good for staying aware of a community, not for systematic lead monitoring.",
      },
    ],
    winner: {
      name: 'Redgrow',
      why: "For a startup where Reddit is an active acquisition channel, Redgrow is the only monitoring tool that closes the loop — from 'someone posted this' all the way to 'here's what to say and when'. The free plan is enough to validate whether Reddit works for your product.",
    },
    related: [
      { href: '/best/reddit-marketing-tools-for-saas-founders', label: 'Best Reddit marketing tools for SaaS founders' },
      { href: '/for/reddit-keyword-monitoring', label: 'Reddit keyword monitoring — complete guide' },
      { href: '/how-to/find-buying-intent-threads-on-reddit', label: 'How to find buying intent threads on Reddit' },
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(pages).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = pages[params.slug]
  if (!p) return {}
  return {
    title: `${p.title} | Redgrow`,
    description: p.metaDescription,
    alternates: { canonical: `https://redgrow.app/best/${p.slug}` },
    openGraph: {
      title: p.title,
      description: p.metaDescription,
      url: `https://redgrow.app/best/${p.slug}`,
      images: [{ url: 'https://redgrow.app/og-image.png', width: 1200, height: 628 }],
    },
  }
}

export default function BestPage({ params }: { params: { slug: string } }) {
  const p = pages[params.slug]
  if (!p) notFound()

  return (
    <div className="lp">
      <nav className="nav" style={{ position: 'relative', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap nav-row">
          <Link href="/" className="logo"><span className="logo-mark" /><span>Redgrow</span></Link>
          <div className="nav-links">
            <Link href="/#features">Features</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/compare/vs-replymer">Compare</Link>
          </div>
          <div className="nav-cta">
            <Link href="/login" className="login">Login</Link>
            <Link href="/login?mode=signup" className="btn btn-primary btn-sm">Get started <span className="arr">→</span></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: '72px', paddingBottom: '56px' }}>
        <div className="narrow">
          <div className="section-num"><span><strong>Roundup</strong> — {p.eyebrow}</span></div>
          <h1 style={{ fontSize: 'clamp(28px,4vw,54px)', marginTop: '14px', letterSpacing: '-.03em' }}>{p.headline}</h1>
          <p style={{ fontSize: '18px', marginTop: '22px', borderTop: '1px solid var(--line)', paddingTop: '22px', maxWidth: '52ch', color: 'var(--ink-2)', lineHeight: 1.6 }}>{p.subheadline}</p>
        </div>
      </section>

      {/* INTRO */}
      <section style={{ paddingBottom: '56px' }}>
        <div className="narrow">
          {p.intro.map((para, i) => (
            <p key={i} style={{ fontSize: '16.5px', color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: '16px', maxWidth: '56ch' }}>{para}</p>
          ))}
        </div>
      </section>

      {/* TOOLS TABLE */}
      <section style={{ paddingTop: '16px', paddingBottom: '64px', background: 'var(--paper)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="narrow">
          <div className="eyebrow" style={{ marginBottom: '24px', paddingTop: '40px' }}>The tools</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {p.tools.map((tool, i) => (
              <div key={i} style={{ borderRadius: 'var(--r)', border: `1.5px solid ${tool.isBest ? 'var(--orange)' : 'var(--line)'}`, background: tool.isBest ? 'var(--cream)' : 'var(--paper)', overflow: 'hidden' }}>
                {tool.isBest && (
                  <div style={{ background: 'var(--orange)', padding: '6px 20px', fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff', fontWeight: 700 }}>
                    ★ Top pick
                  </div>
                )}
                <div style={{ padding: '24px 24px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-.01em', margin: 0 }}>{tool.name}</h3>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '13px', color: 'var(--orange)', fontWeight: 700 }}>{tool.price}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10.5px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '4px' }}>Best for</div>
                      <p style={{ fontSize: '14px', color: 'var(--ink-2)', margin: 0 }}>{tool.bestFor}</p>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10.5px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '4px' }}>Weakness</div>
                      <p style={{ fontSize: '14px', color: 'var(--ink-2)', margin: 0 }}>{tool.weakness}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '15px', color: 'var(--ink-2)', lineHeight: 1.6, borderTop: '1px solid var(--line)', paddingTop: '14px', margin: 0 }}>{tool.verdict}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WINNER */}
      <section style={{ paddingTop: '56px', paddingBottom: '56px' }}>
        <div className="narrow">
          <div style={{ padding: '32px 36px', background: 'var(--cream-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' }}>
            <div className="eyebrow" style={{ marginBottom: '10px' }}>Our pick</div>
            <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Winner: {p.winner.name}</h3>
            <p style={{ fontSize: '16px', color: 'var(--ink-2)', lineHeight: 1.65 }}>{p.winner.why}</p>
            <div style={{ marginTop: '24px' }}>
              <Link href="/login?mode=signup" className="btn btn-orange">Try {p.winner.name} free <span className="arr">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section style={{ paddingTop: '40px', paddingBottom: '64px', borderTop: '1px solid var(--line)' }}>
        <div className="narrow">
          <div className="eyebrow" style={{ marginBottom: '20px' }}>Related</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {p.related.map(r => (
              <Link key={r.href} href={r.href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--line)', fontSize: '15.5px', color: 'var(--ink)', fontWeight: 500 }}>
                {r.label}
                <span style={{ color: 'var(--orange)', flexShrink: 0, marginLeft: 16 }}>→</span>
              </Link>
            ))}
            <div style={{ borderTop: '1px solid var(--line)' }} />
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
