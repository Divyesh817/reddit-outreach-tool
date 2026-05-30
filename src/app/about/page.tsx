import type { Metadata } from 'next'
import Link from 'next/link'
import '../landing.css'

export const metadata: Metadata = {
  title: 'About Redgrow — The Reddit Outreach Tool Built for Founders',
  description: 'Redgrow is a Reddit outreach tool that helps founders find high-intent buyers and post contextual replies safely from their own account.',
}

export default function AboutPage() {
  return (
    <div className="lp">
      <nav className="nav" style={{ position: 'relative', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap nav-row">
          <Link href="/" className="logo"><span className="logo-mark"></span><span>Redgrow</span></Link>
          <div className="nav-links">
            <Link href="/#features">Features</Link>
            <Link href="/#how">How it works</Link>
            <Link href="/blog">Field notes</Link>
          </div>
          <div className="nav-cta">
            <Link href="/login" className="login">Login</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Get started <span className="arr">→</span></Link>
          </div>
        </div>
      </nav>

      <section>
        <div className="narrow">
          <div className="section-num"><span><strong>§00</strong> — About</span></div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,72px)', marginTop: '12px', letterSpacing: '-.03em' }}>
            Built by founders,<br /><em>for founders.</em>
          </h1>
          <p style={{ fontSize: '18px', marginTop: '28px', borderTop: '1px solid var(--line)', paddingTop: '22px', maxWidth: '52ch' }}>
            Redgrow was born from a simple frustration: Reddit is full of people asking for exactly the tools we were building, but finding them manually was a full-time job.
          </p>

          <div style={{ marginTop: '56px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '28px' }}>
              <div className="eyebrow" style={{ marginBottom: '8px' }}>The problem</div>
              <h3 style={{ fontSize: '26px', marginBottom: '14px' }}>Reddit is the best B2B channel nobody uses properly.</h3>
              <p>Millions of founders, product managers, and early adopters congregate on Reddit every day. They ask for tool recommendations, complain about competitors, and describe their exact workflows in public. The intent signal is extraordinary. The problem is finding it — and responding without getting banned.</p>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '28px' }}>
              <div className="eyebrow" style={{ marginBottom: '8px' }}>Our approach</div>
              <h3 style={{ fontSize: '26px', marginBottom: '14px' }}>Relevance over volume, always.</h3>
              <p>We built Redgrow on one principle: every reply should genuinely help the person receiving it. That means we score intent before we draft anything, we match tone to the subreddit, and we never let anything post without your approval. The safety layer isn&apos;t a feature — it&apos;s the foundation.</p>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '28px' }}>
              <div className="eyebrow" style={{ marginBottom: '8px' }}>Pricing philosophy</div>
              <h3 style={{ fontSize: '26px', marginBottom: '14px' }}>Cheaper than the alternative by design.</h3>
              <p>The main alternatives charge $99/mo for shared proxy accounts and keyword matching. We start at $9/mo, use your own authentic account, and score intent with 5 pain-type classifications. The gap in value is intentional.</p>
            </div>
          </div>

          <div style={{ marginTop: '64px', padding: '32px', background: 'var(--cream-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--line)' }}>
            <div className="eyebrow" style={{ marginBottom: '12px' }}>Contact</div>
            <p>Questions, partnerships, or just want to chat about Reddit growth strategy? Email us at <strong>div@redgrow.app</strong> — we respond to every message within 24 hours.</p>
            <div style={{ marginTop: '18px' }}>
              <Link href="/login" className="btn btn-orange">Get started <span className="arr">→</span></Link>
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
