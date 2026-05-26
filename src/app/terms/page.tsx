import type { Metadata } from 'next'
import Link from 'next/link'
import '../landing.css'

export const metadata: Metadata = {
  title: 'Terms of Service — Redgrow',
  description: 'Redgrow terms of service and acceptable use policy.',
}

export default function TermsPage() {
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
          <div className="section-num"><span><strong>Legal</strong> — Terms of Service</span></div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,64px)', marginTop: '12px', letterSpacing: '-.03em' }}>Terms of Service</h1>
          <p style={{ marginTop: '12px', fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: 'var(--ink-3)', letterSpacing: '.08em' }}>LAST UPDATED: MAY 2026</p>

          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {[
              { title: 'Acceptance of terms', body: 'By using Redgrow, you agree to these terms. If you do not agree, do not use the service.' },
              { title: 'What Redgrow does', body: 'Redgrow is a software service that helps you find relevant Reddit threads, draft contextual replies using AI, and post those replies from your own Reddit account. You control what gets posted — nothing is sent without your explicit approval.' },
              { title: 'Your Reddit account', body: "You are solely responsible for your Reddit account and all activity on it. By connecting your Reddit account to Redgrow, you authorise us to post on your behalf only when you approve a reply. You must comply with Reddit's User Agreement and Content Policy at all times." },
              { title: 'Acceptable use', body: 'You may not use Redgrow to spam, harass, or post misleading content. You may not use Redgrow to violate Reddit\'s rules or any applicable laws. Redgrow\'s safety limits (daily caps, warmup periods, ratio enforcement) are non-negotiable and may not be bypassed.' },
              { title: 'Service availability', body: 'We aim for 99.9% uptime but do not guarantee it. We may modify or discontinue features with notice. We are not liable for losses resulting from service interruptions.' },
              { title: 'Billing', body: 'Subscriptions are billed monthly. You can cancel at any time; cancellation takes effect at the end of your current billing period. We offer a 14-day money-back guarantee on first payments.' },
              { title: 'Termination', body: 'We may suspend or terminate accounts that violate these terms, spam Reddit, or engage in any abusive activity. You may terminate your account at any time by contacting us.' },
              { title: 'Limitation of liability', body: 'Redgrow is provided as-is. We are not liable for any damages arising from your use of the service, including account restrictions imposed by Reddit.' },
              { title: 'Contact', body: 'Questions about these terms? Email legal@redgrow.app.' },
            ].map(({ title, body }) => (
              <div key={title} style={{ borderTop: '1px solid var(--line)', paddingTop: '28px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>{title}</h3>
                <p>{body}</p>
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
