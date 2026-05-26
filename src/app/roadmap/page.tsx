import type { Metadata } from 'next'
import Link from 'next/link'
import '../landing.css'

export const metadata: Metadata = {
  title: "Roadmap — What's Coming to Redgrow",
  description: "See what's planned for Redgrow. Upcoming features and improvements.",
}

const roadmap = [
  {
    status: 'In progress',
    color: 'var(--orange)',
    items: [
      { title: 'Slack integration', desc: 'Get new high-intent opportunities sent directly to your Slack channel.' },
      { title: 'Multi-account support', desc: 'Manage multiple Reddit accounts from a single Redgrow workspace.' },
    ],
  },
  {
    status: 'Planned',
    color: 'var(--blue)',
    items: [
      { title: 'Reply performance A/B testing', desc: 'Test two reply variants on similar threads and see which gets more clicks.' },
      { title: 'Competitor thread monitoring', desc: "Get alerted when someone posts negatively about a competitor — your fastest path to a warm lead." },
      { title: 'Chrome extension', desc: 'Approve and post replies without opening the Redgrow dashboard.' },
      { title: 'Agency client reports', desc: 'White-label PDF reports for agencies managing Reddit outreach for clients.' },
    ],
  },
  {
    status: 'Exploring',
    color: 'var(--ink-3)',
    items: [
      { title: 'LinkedIn thread monitoring', desc: 'Bring the same intent-scoring system to LinkedIn posts and comments.' },
      { title: 'Custom AI persona', desc: 'Train Redgrow on your specific voice and writing style for more authentic replies.' },
    ],
  },
]

export default function RoadmapPage() {
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
          <div className="section-num"><span><strong>§00</strong> — Roadmap</span></div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,72px)', marginTop: '12px', letterSpacing: '-.03em' }}>
            Where we&apos;re <em>headed.</em>
          </h1>
          <p style={{ fontSize: '18px', marginTop: '28px', borderTop: '1px solid var(--line)', paddingTop: '22px', maxWidth: '52ch' }}>
            Our public roadmap. Vote for features or suggest new ones by emailing us at hello@redgrow.app.
          </p>

          <div style={{ marginTop: '56px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {roadmap.map((group) => (
              <div key={group.status}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: group.color, flexShrink: 0 }}></div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', letterSpacing: '.18em', textTransform: 'uppercase', color: group.color, fontWeight: 600 }}>{group.status}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {group.items.map((item) => (
                    <div key={item.title} style={{ borderTop: '1px solid var(--line)', padding: '22px 0', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
                      <h3 style={{ fontSize: '17px', fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{item.title}</h3>
                      <p style={{ fontSize: '15px' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '64px', padding: '32px', background: 'var(--cream-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--line)' }}>
            <div className="eyebrow" style={{ marginBottom: '10px' }}>Feature request?</div>
            <p>Email us at <strong>hello@redgrow.app</strong> with your idea. The features with the most votes get built next.</p>
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
