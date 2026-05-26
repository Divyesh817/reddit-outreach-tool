import type { Metadata } from 'next'
import Link from 'next/link'
import '../landing.css'

export const metadata: Metadata = {
  title: 'Privacy Policy — Redgrow',
  description: 'How Redgrow collects, uses, and protects your data.',
}

export default function PrivacyPage() {
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
          <div className="section-num"><span><strong>Legal</strong> — Privacy Policy</span></div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,64px)', marginTop: '12px', letterSpacing: '-.03em' }}>Privacy Policy</h1>
          <p style={{ marginTop: '12px', fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: 'var(--ink-3)', letterSpacing: '.08em' }}>LAST UPDATED: MAY 2026</p>

          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {[
              { title: 'Information we collect', body: 'We collect your email address, name, and Google account details when you sign up. When you connect your Reddit account, we store OAuth tokens — we never store your Reddit password. We collect usage data such as which features you use and when, to improve the product.' },
              { title: 'How we use your information', body: 'Your data is used to operate Redgrow: scanning subreddits, scoring threads, drafting replies, and posting on your behalf when you approve. We do not sell your data to third parties. We do not use your data to train AI models.' },
              { title: 'Reddit data', body: 'We access Reddit through their official API using tokens you grant. We scan public Reddit threads to find opportunities for your product. We never access your private Reddit messages. All Reddit tokens are encrypted at rest.' },
              { title: 'Data retention', body: 'We retain your data for as long as your account is active. When you delete your account, we delete all your personal data and Reddit tokens within 30 days. Anonymized aggregate usage statistics may be retained.' },
              { title: 'Cookies', body: 'We use session cookies for authentication and functional cookies to remember your preferences. We do not use tracking cookies or third-party advertising cookies.' },
              { title: 'Your rights', body: 'You can request a copy of your data, ask us to correct inaccurate data, or request deletion of your account and all associated data by emailing privacy@redgrow.app.' },
              { title: 'Contact', body: 'For privacy questions or requests, contact us at privacy@redgrow.app.' },
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
