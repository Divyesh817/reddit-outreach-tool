import type { Metadata } from 'next'
import Link from 'next/link'
import '../landing.css'

export const metadata: Metadata = {
  title: 'Changelog — Redgrow',
  description: "What's new in Redgrow. Product updates and improvements.",
}

const releases = [
  {
    version: 'v1.4.0',
    date: 'May 2026',
    badge: 'Latest',
    changes: [
      { type: 'New', text: 'Subreddit safety score — automatic risk rating per community based on removal history' },
      { type: 'New', text: 'Tone selection in reply composer: helpful, casual, or expert mode' },
      { type: 'Improved', text: 'Intent scoring model updated — 18% improvement in accuracy on competitor_frustration threads' },
      { type: 'Fixed', text: 'Account health dashboard now refreshes in real time after a post' },
    ],
  },
  {
    version: 'v1.3.0',
    date: 'April 2026',
    badge: null,
    changes: [
      { type: 'New', text: 'Weekly digest email — top 5 opportunities and reply performance summary every Monday' },
      { type: 'New', text: 'Regenerate reply button — discard AI draft and generate a fresh one with one click' },
      { type: 'Improved', text: 'Reddit OAuth flow is now 30% faster on mobile' },
      { type: 'Fixed', text: 'Warmup progress bar no longer resets on refresh' },
    ],
  },
  {
    version: 'v1.2.0',
    date: 'March 2026',
    badge: null,
    changes: [
      { type: 'New', text: 'Conversion analytics — per-thread click and signup attribution via UTM tracking' },
      { type: 'New', text: 'Auto-blacklist — subreddits with 2+ reply removals are flagged automatically' },
      { type: 'Improved', text: 'AI reply prompt updated to never open with the product name' },
    ],
  },
  {
    version: 'v1.0.0',
    date: 'February 2026',
    badge: null,
    changes: [
      { type: 'Launch', text: 'Redgrow public launch — Reddit outreach tool for founders' },
      { type: 'New', text: 'Product URL scraping → subreddit discovery → opportunity scoring pipeline' },
      { type: 'New', text: 'AI reply composer with 5 pain types and approval queue' },
      { type: 'New', text: 'Account warmup system with daily posting schedule' },
    ],
  },
]

const badgeColor: Record<string, string> = {
  New: 'var(--orange-soft)',
  Improved: 'var(--green-soft)',
  Fixed: '#E3EAF6',
  Launch: 'var(--orange)',
}

const badgeText: Record<string, string> = {
  New: '#9c2f0d',
  Improved: 'var(--green)',
  Fixed: 'var(--blue)',
  Launch: '#fff',
}

export default function ChangelogPage() {
  return (
    <div className="lp">
      <nav className="nav" style={{ position: 'relative', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap nav-row">
          <Link href="/" className="logo"><span className="logo-mark"></span><span>Redgrow</span></Link>
          <div className="nav-cta">
            <Link href="/login" className="login">Login</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Get started <span className="arr">→</span></Link>
          </div>
        </div>
      </nav>

      <section>
        <div className="narrow">
          <div className="section-num"><span><strong>§00</strong> — Changelog</span></div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,72px)', marginTop: '12px', letterSpacing: '-.03em' }}>
            What&apos;s <em>new.</em>
          </h1>
          <p style={{ fontSize: '18px', marginTop: '28px', borderTop: '1px solid var(--line)', paddingTop: '22px', maxWidth: '48ch' }}>
            Every update, big and small. We ship improvements every two weeks.
          </p>

          <div style={{ marginTop: '56px', display: 'flex', flexDirection: 'column', gap: '0' }}>
            {releases.map((r) => (
              <div key={r.version} style={{ borderTop: '1px solid var(--line)', paddingTop: '32px', paddingBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{r.version}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{r.date}</div>
                  {r.badge && (
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', background: 'var(--orange)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>{r.badge}</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {r.changes.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '15px', color: 'var(--ink-2)' }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', padding: '3px 7px', borderRadius: '4px', background: badgeColor[c.type] || 'var(--cream)', color: badgeText[c.type] || 'var(--ink)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: '2px', flexShrink: 0 }}>{c.type}</span>
                      <span>{c.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
