import type { Metadata } from 'next'
import Link from 'next/link'
import '../landing.css'

export const metadata: Metadata = {
  title: 'Free Reddit Growth Guide — The Redgrow Playbook',
  description: '64 pages of battle-tested tactics for growing on Reddit without getting banned. Free PDF guide from the Redgrow team.',
}

export default function GuidePage() {
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
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <span className="pill-outline">Free Guide · PDF</span>
              <h1 style={{ fontSize: 'clamp(36px,4.6vw,60px)', marginTop: '18px', letterSpacing: '-.03em' }}>
                The Redgrow <em>Playbook</em> for Reddit Growth.
              </h1>
              <p style={{ fontSize: '18px', marginTop: '22px', maxWidth: '48ch' }}>
                64 pages of battle-tested tactics for founders who want to use Reddit without getting banned, ignored, or burned.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '28px 0', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  'The 5 buying signals that predict high buying intent',
                  'Which subreddits convert best, by product category',
                  'The empathy-first reply framework — why it works',
                  'How to build a safe posting schedule that scales',
                  'What to do when a reply gets removed',
                  'The warmup strategy that keeps accounts healthy',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'grid', gridTemplateColumns: '30px 1fr', padding: '11px 0', borderTop: '1px solid var(--line)', fontSize: '15px', color: 'var(--ink-2)' }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: 'var(--orange)', fontWeight: 600 }}>.00{i + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
                <li style={{ borderBottom: '1px solid var(--line)', padding: '11px 0' }}></li>
              </ul>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/login" className="btn btn-primary">Download free guide <span className="arr">→</span></Link>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center' }}>No email required · 64pp PDF</span>
              </div>
            </div>

            <div className="book">
              <div className="book-3d">
                <div className="book-spine"></div>
                <div className="book-cover">
                  <div className="top"><span>01</span><span>2026</span></div>
                  <div>
                    <h4>The Redgrow <em>Playbook</em> for Reddit Growth.</h4>
                    <div className="accent-bar"></div>
                    <div className="author">By the Redgrow team · 64pp</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
                    <span>Vol. 01</span><span>Free · PDF</span>
                  </div>
                </div>
              </div>
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
