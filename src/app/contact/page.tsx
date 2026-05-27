import type { Metadata } from 'next'
import Link from 'next/link'
import '../landing.css'

export const metadata: Metadata = {
  title: 'Contact Redgrow — Get in Touch',
  description: 'Questions about Redgrow? We respond within 24 hours.',
}

export default function ContactPage() {
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
          <div className="section-num"><span><strong>§00</strong> — Contact</span></div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,72px)', marginTop: '12px', letterSpacing: '-.03em' }}>
            We&apos;re easy to <em>reach.</em>
          </h1>
          <p style={{ fontSize: '18px', marginTop: '28px', borderTop: '1px solid var(--line)', paddingTop: '22px', maxWidth: '48ch' }}>
            Small team, fast replies. Every message goes to a real person and we respond within 24 hours.
          </p>

          <div style={{ marginTop: '56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {[
              { label: 'General enquiries', email: 'div@redgrow.app', desc: 'Product questions, partnership ideas, or just want to say hi.' },
              { label: 'Support', email: 'support@redgrow.app', desc: "Having a problem with your account or a feature? We'll fix it." },
              { label: 'Privacy & legal', email: 'privacy@redgrow.app', desc: 'Data requests, GDPR enquiries, or legal correspondence.' },
              { label: 'Press', email: 'press@redgrow.app', desc: 'Writing about Reddit marketing or founder tools? We&apos;d love to chat.' },
            ].map(({ label, email, desc }) => (
              <div key={label} style={{ borderTop: '1px solid var(--line)', paddingTop: '24px' }}>
                <div className="eyebrow" style={{ marginBottom: '8px' }}>{label}</div>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: 'var(--ink)', fontWeight: 600, marginBottom: '6px' }}>{email}</p>
                <p style={{ fontSize: '14px' }}>{desc}</p>
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
          </div>
        </div>
      </footer>
    </div>
  )
}
