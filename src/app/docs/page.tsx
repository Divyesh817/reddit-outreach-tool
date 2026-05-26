import type { Metadata } from 'next'
import Link from 'next/link'
import '../landing.css'

export const metadata: Metadata = {
  title: 'Help Center — Redgrow Docs',
  description: 'Everything you need to get started with Redgrow and get the most out of it.',
}

const sections = [
  {
    title: 'Getting started',
    articles: [
      { title: 'Create your account', desc: 'Sign up with Google and connect your Reddit account in under 5 minutes.' },
      { title: 'Add your first product', desc: 'Paste your landing page URL and Redgrow will scrape and profile your product automatically.' },
      { title: 'Understanding the opportunity queue', desc: 'How to read intent scores, pain types, and reply drafts.' },
      { title: 'Approving and posting your first reply', desc: 'Step-by-step guide to reviewing and posting your first AI-drafted reply.' },
    ],
  },
  {
    title: 'Account safety',
    articles: [
      { title: 'How the warmup system works', desc: 'Why new accounts need warmup and what Redgrow does automatically.' },
      { title: 'Daily posting limits explained', desc: "The 5/day cap and why it's non-negotiable." },
      { title: 'Shadowban detection and recovery', desc: 'What happens when a shadowban is detected and how to recover.' },
      { title: 'The 1:3 promo-to-normal ratio', desc: 'How Redgrow maintains your account health with non-promotional comments.' },
    ],
  },
  {
    title: 'Features',
    articles: [
      { title: 'Managing your subreddit watchlist', desc: 'Adding, removing, and adjusting priority for subreddits.' },
      { title: 'Keyword library', desc: 'Customising which buying signals Redgrow listens for.' },
      { title: 'Conversion tracking setup', desc: 'How to set up UTM tracking and read your analytics.' },
      { title: 'Regenerating reply drafts', desc: 'When and how to ask for a fresh AI draft.' },
    ],
  },
]

export default function DocsPage() {
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
          <div className="section-num"><span><strong>§00</strong> — Help Center</span></div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,72px)', marginTop: '12px', letterSpacing: '-.03em' }}>
            How to use <em>Redgrow.</em>
          </h1>
          <p style={{ fontSize: '18px', marginTop: '28px', borderTop: '1px solid var(--line)', paddingTop: '22px', maxWidth: '52ch' }}>
            Everything you need to get set up, stay safe, and get results from Reddit outreach.
          </p>

          <div style={{ marginTop: '56px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {sections.map((section) => (
              <div key={section.title}>
                <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>{section.title}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                  {section.articles.map((article) => (
                    <div key={article.title} style={{ borderTop: '1px solid var(--line)', padding: '20px 0', paddingRight: '32px' }}>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ink)', marginBottom: '4px' }}>{article.title}</div>
                      <p style={{ fontSize: '14px' }}>{article.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '64px', padding: '32px', background: 'var(--cream-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--line)' }}>
            <div className="eyebrow" style={{ marginBottom: '10px' }}>Still stuck?</div>
            <p>Email us at <strong>support@redgrow.app</strong> and we&apos;ll get back to you within 24 hours.</p>
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
