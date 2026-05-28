import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import '../../landing.css'

type Page = {
  slug: string
  title: string
  eyebrow: string
  headline: string
  subheadline: string
  sections: { eyebrow: string; heading: string; body: string[] }[]
  mistakes?: { title: string; fix: string }[]
  callout: string
  related: { href: string; label: string }[]
  metaDescription: string
}

const pages: Record<string, Page> = {
  'why-you-keep-getting-banned-on-reddit': {
    slug: 'why-you-keep-getting-banned-on-reddit',
    title: 'Why You Keep Getting Banned on Reddit (And How to Stop)',
    eyebrow: 'Account Safety',
    headline: 'Why you keep getting banned on Reddit — and exactly how to stop.',
    subheadline: "Reddit bans are predictable. They happen for specific reasons. Once you understand them, they're almost entirely avoidable.",
    metaDescription: 'The real reasons Reddit keeps banning your account — and the specific changes that prevent it. A founder-to-founder breakdown.',
    sections: [
      {
        eyebrow: 'Root cause',
        heading: 'Reddit doesn\'t ban marketers. It bans patterns.',
        body: [
          "Reddit's anti-spam systems look for patterns, not intent. They can't tell if your heart is in the right place. They can tell if your posting pattern looks like someone promoting something.",
          "The patterns that trigger bans: posting the same link in multiple subreddits within hours, having a low comment karma-to-submission ratio, replying to threads with your product link as your first or second comment, posting with an account that has no history in the subreddits you're posting in.",
          "None of these are about being dishonest. A completely honest founder who does all four of these things will get banned. A totally cynical marketer who avoids these patterns will stay up.",
        ],
      },
      {
        eyebrow: 'The 5 ban triggers',
        heading: 'The specific things Reddit flags.',
        body: [
          "1. Low account age. New accounts (under 30 days) posting promotional content get flagged instantly. Reddit remembers that throwaway accounts are often used for spam.",
          "2. Self-promotion ratio. Reddit expects 9 non-promotional comments for every 1 promotional post. Most founders posting about their product flip this ratio — or worse.",
          "3. Same link, multiple subs. Posting the same URL in multiple subreddits within a short window is a classic spam signal. Even if the content is genuinely helpful.",
          "4. No subreddit history. If your first ever comment in r/SaaS is a promotional reply, you'll be flagged. You need some karma in each subreddit before promoting in it.",
          "5. Subreddit rules violations. Many subreddits explicitly ban self-promotion. Posting in them anyway gets you removed by mods, which feeds your account's removal rate — which eventually triggers broader restrictions.",
        ],
      },
      {
        eyebrow: 'The fix',
        heading: 'Build a posting pattern that looks human.',
        body: [
          "An account that never gets banned doesn't look like a marketer. It looks like an active community member who also happens to mention their product occasionally.",
          "That means: posting genuinely helpful, non-promotional comments regularly. Building karma in each subreddit you plan to post in. Never exceeding 1 promotional mention per 3–5 comments. Waiting at least 7 days between mentioning the same product in the same subreddit.",
          "This isn't just for show. It's actually the right way to use Reddit as an acquisition channel. The accounts that build real brand equity on Reddit are the ones that give before they take.",
        ],
      },
    ],
    mistakes: [
      { title: 'Posting with a brand new account', fix: 'Age your account for 2–4 weeks with genuine participation before any promotion.' },
      { title: 'Your ratio is wrong', fix: "For every promotional comment, post 3–5 helpful ones with no promotion. Redgrow tracks this automatically." },
      { title: 'Same link, multiple subs, same day', fix: 'Space out subreddit posts by at least 24 hours. Never post the same URL in more than 2 subs in a week.' },
      { title: 'No history in subreddit before promoting', fix: 'Comment genuinely in each subreddit for 1–2 weeks before mentioning your product.' },
      { title: 'Ignoring subreddit rules', fix: 'Read the rules of every subreddit before posting. Redgrow scans subreddit rules automatically and flags ones that ban promotion.' },
    ],
    callout: "Redgrow enforces safe posting limits automatically. It tracks your daily promotional comment count, checks your subreddit history before showing you a thread, and flags subreddits that ban self-promotion. You can't accidentally exceed the safe limits.",
    related: [
      { href: '/reddit-marketing/reddit-marketing-without-shadowban', label: 'Reddit marketing without getting shadowbanned' },
      { href: '/how-to/find-customers-on-reddit-without-getting-banned', label: 'How to find customers on Reddit without getting banned' },
      { href: '/how-to/promote-saas-on-reddit-organically', label: 'How to promote your SaaS on Reddit organically' },
    ],
  },

  'reddit-marketing-without-shadowban': {
    slug: 'reddit-marketing-without-shadowban',
    title: 'How to Do Reddit Marketing Without Getting Shadowbanned',
    eyebrow: 'Shadowban Prevention',
    headline: 'How to do Reddit marketing without getting shadowbanned.',
    subheadline: "A shadowban is worse than a regular ban — your posts appear to exist but nobody sees them. Here's how to avoid it and how to detect it.",
    metaDescription: 'Avoid Reddit shadowbans while marketing your SaaS. How to detect one, why they happen, and the exact habits that prevent them.',
    sections: [
      {
        eyebrow: 'What is a shadowban',
        heading: 'A shadowban is invisible. That\'s what makes it dangerous.',
        body: [
          "A regular Reddit ban tells you something went wrong. You know to change your approach. A shadowban is different: your account appears to work normally to you. You can post, comment, upvote. But nobody else sees any of it.",
          "Your posts are invisible to everyone except you. You'll keep posting into the void, wasting time and wondering why engagement has dropped to zero. You might not notice for weeks.",
          "Reddit uses shadowbans as a last resort — usually after multiple spam flags, repeated rule violations, or suspicious activity patterns that persist after warnings.",
        ],
      },
      {
        eyebrow: 'How to check',
        heading: 'Detecting a shadowban takes 30 seconds.',
        body: [
          "Open an incognito browser window. Navigate to your Reddit profile page (reddit.com/user/yourusername). If the page shows a 'page not found' error or your posts are missing, you're shadowbanned.",
          "You can also check reddit.com/r/ShadowBan — post there and wait for the automated bot response, which will tell you definitively whether your account is shadowbanned.",
          "If you're shadowbanned: the only real fix is to create a new account and change the behavior patterns that got the old one flagged. Reddit appeals for shadowbans rarely succeed.",
        ],
      },
      {
        eyebrow: 'Prevention',
        heading: 'The habits that prevent shadowbans.',
        body: [
          "Shadowbans happen after a pattern of spam-like behavior, not after one mistake. The prevention habits are the same as the general ban prevention habits — just applied more consistently.",
          "The single most important rule: never, ever use automation or bots to post, comment, vote, or message on Reddit. This is the fastest path to a permanent shadowban. Reddit's detection for automated behavior is very good.",
          "Beyond that: build genuine karma before promoting, keep your promotional ratio low, space out posts across subreddits, and read the rules of every subreddit you post in. These aren't tricks — they're how the accounts that thrive on Reddit actually behave.",
        ],
      },
    ],
    mistakes: [
      { title: 'Using automation or bots', fix: 'Never automate Reddit actions. Paste every reply yourself. This is why Redgrow never touches your account — you do everything manually.' },
      { title: 'Voting manipulation', fix: "Never ask friends, team members, or tools to upvote your comments. Reddit detects vote rings and it's a fast path to a shadowban." },
      { title: 'Posting across many subs too quickly', fix: 'Slow down. A real user doesn\'t post in 15 subreddits in a single afternoon. Space it over days.' },
      { title: 'Ignoring removal signals', fix: "When a moderator removes your post, treat it as a warning. Stop posting in that subreddit for a few weeks and read the rules again." },
      { title: 'Promoting too early in account life', fix: 'Wait at least 2–4 weeks and build genuine karma before any promotional activity.' },
    ],
    callout: "Every account that uses Redgrow stays safe because of one design decision: Redgrow never touches your Reddit account. No OAuth. No API access. It drafts replies and you paste them. Reddit sees a human posting manually, because that's exactly what's happening.",
    related: [
      { href: '/reddit-marketing/why-you-keep-getting-banned-on-reddit', label: 'Why you keep getting banned on Reddit' },
      { href: '/how-to/find-customers-on-reddit-without-getting-banned', label: 'How to find customers on Reddit without getting banned' },
      { href: '/compare/vs-replymer', label: 'Why shared account networks (like Replymer) are risky' },
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
    alternates: { canonical: `https://redgrow.app/reddit-marketing/${p.slug}` },
    openGraph: {
      title: p.title,
      description: p.metaDescription,
      url: `https://redgrow.app/reddit-marketing/${p.slug}`,
      images: [{ url: 'https://redgrow.app/og-image.png', width: 1200, height: 628 }],
    },
  }
}

export default function RedditMarketingPage({ params }: { params: { slug: string } }) {
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
            <Link href="/blog">Blog</Link>
          </div>
          <div className="nav-cta">
            <Link href="/login" className="login">Login</Link>
            <Link href="/login?mode=signup" className="btn btn-primary btn-sm">Get started <span className="arr">→</span></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: '72px', paddingBottom: '64px' }}>
        <div className="narrow">
          <div className="section-num"><span><strong>Reddit Marketing</strong> — {p.eyebrow}</span></div>
          <h1 style={{ fontSize: 'clamp(30px,4.2vw,56px)', marginTop: '14px', letterSpacing: '-.03em' }}>{p.headline}</h1>
          <p style={{ fontSize: '19px', marginTop: '22px', borderTop: '1px solid var(--line)', paddingTop: '22px', maxWidth: '52ch', color: 'var(--ink-2)', lineHeight: 1.6 }}>{p.subheadline}</p>
        </div>
      </section>

      {/* SECTIONS */}
      {p.sections.map((section, i) => (
        <section key={i} style={{ paddingTop: '56px', paddingBottom: '56px', background: i % 2 === 1 ? 'var(--paper)' : undefined, borderTop: '1px solid var(--line)', ...(i % 2 === 1 ? { borderBottom: '1px solid var(--line)' } : {}) }}>
          <div className="narrow">
            <div className="eyebrow" style={{ marginBottom: '12px' }}>{section.eyebrow}</div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', letterSpacing: '-.025em', maxWidth: '24ch' }}>{section.heading}</h2>
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '56ch' }}>
              {section.body.map((para, j) => (
                <p key={j} style={{ fontSize: '16.5px', color: 'var(--ink-2)', lineHeight: 1.65 }}>{para}</p>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* MISTAKES */}
      {p.mistakes && (
        <section style={{ paddingTop: '56px', paddingBottom: '64px', background: 'var(--paper)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
          <div className="narrow">
            <div className="eyebrow" style={{ marginBottom: '12px' }}>Common mistakes</div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', letterSpacing: '-.025em' }}>What to stop doing — and what to do instead.</h2>
            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column' }}>
              {p.mistakes.map((m, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', paddingTop: '20px', paddingBottom: '20px', borderTop: '1px solid var(--line)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--red)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>✗</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--red)' }}>Mistake</span>
                    </div>
                    <p style={{ fontSize: '15px', color: 'var(--ink-2)', margin: 0 }}>{m.title}</p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ width: 18, height: 18, borderRadius: 4, background: 'var(--green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>✓</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--green)' }}>Fix</span>
                    </div>
                    <p style={{ fontSize: '15px', color: 'var(--ink-2)', margin: 0 }}>{m.fix}</p>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--line)' }} />
            </div>
          </div>
        </section>
      )}

      {/* CALLOUT */}
      <section style={{ paddingTop: '56px', paddingBottom: '56px' }}>
        <div className="narrow">
          <div style={{ padding: '32px 36px', background: 'var(--ink)', borderRadius: 'var(--r-lg)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(229,75,27,.18), transparent 60%)', pointerEvents: 'none' }} />
            <p style={{ fontSize: '17px', color: 'rgba(251,246,238,.85)', lineHeight: 1.65, maxWidth: '52ch', position: 'relative', zIndex: 1, margin: 0 }}>{p.callout}</p>
            <div style={{ marginTop: '22px', position: 'relative', zIndex: 1 }}>
              <Link href="/login?mode=signup" className="btn btn-orange">Try Redgrow free <span className="arr">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section style={{ paddingTop: '40px', paddingBottom: '64px', borderTop: '1px solid var(--line)' }}>
        <div className="narrow">
          <div className="eyebrow" style={{ marginBottom: '20px' }}>Related reading</div>
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
