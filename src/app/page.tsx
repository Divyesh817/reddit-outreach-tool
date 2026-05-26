import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordion } from '@/components/landing/FAQAccordion'
import { LandingScript } from '@/components/landing/LandingScript'
import './landing.css'

export const metadata: Metadata = {
  title: 'Redgrow — Find High-Intent Reddit Leads & Show Up in AI Search',
  description:
    'AI monitors Reddit 24/7, scores threads by buying intent, and drafts contextual replies. Copy the reply, paste it yourself — no auto-posting, zero ban risk. From $9/mo.',
  keywords: [
    'reddit marketing tool', 'reddit lead generation', 'reddit outreach',
    'geo marketing', 'generative engine optimization', 'reddit ai search',
    'reddit leads', 'saas marketing', 'redgrow', 'reddit growth tool',
  ],
  openGraph: {
    title: 'Redgrow — Find High-Intent Reddit Leads & Show Up in AI Search',
    description: 'AI scans Reddit 24/7 for warm leads. Copy the reply draft, paste it yourself. No auto-posting, no ban risk. From $9/mo.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Redgrow — Reddit Leads + GEO in One Tool',
    description: 'AI finds Reddit threads where people are ready to buy. Copy the reply, paste it yourself. No auto-posting. From $9/mo.',
  },
  alternates: { canonical: 'https://redgrow.ai' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Redgrow',
  applicationCategory: 'BusinessApplication',
  description: 'AI-powered Reddit lead generation tool. Finds high-intent threads, drafts replies — you paste them yourself. No auto-posting, no ban risk.',
  offers: [
    { '@type': 'Offer', price: '9', priceCurrency: 'USD', name: 'Starter' },
    { '@type': 'Offer', price: '19', priceCurrency: 'USD', name: 'Growth' },
  ],
}

export default function LandingPage() {
  return (
    <div className="lp">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* NAV */}
      <nav className="nav" id="nav">
        <div className="wrap nav-row">
          <Link href="/" className="logo">
            <span className="logo-mark"></span>
            <span>Redgrow</span>
          </Link>
          <div className="nav-links">
            <Link href="#geo">GEO</Link>
            <Link href="#features">Features</Link>
            <Link href="#how">How it works</Link>
            <Link href="#pricing">Pricing</Link>
          </div>
          <div className="nav-cta">
            <Link href="/login" className="login">Login</Link>
            <Link href="/login" className="btn btn-primary btn-sm">Get started <span className="arr">→</span></Link>
            <button className="hamburger" id="ham" aria-label="Menu"><span></span></button>
          </div>
        </div>
      </nav>

      {/* MOBILE SHEET */}
      <div className="sheet" id="sheet">
        <div className="sheet-panel">
          <Link href="#geo">GEO</Link>
          <Link href="#features">Features</Link>
          <Link href="#how">How it works</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="/login">Login</Link>
          <Link href="/login" className="btn btn-primary">Get started →</Link>
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              {/* Safety badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--green-soft)', border: '1px solid rgba(31,107,63,.2)',
                borderRadius: 99, padding: '6px 14px', marginBottom: 28,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--green)', fontWeight: 600 }}>
                  You paste · We never auto-post · Zero ban risk
                </span>
              </div>

              <h1 className="reveal">
                <span className="lead">Find Reddit buyers.</span>
                <span className="orange-word"><em>Show up in AI search.</em></span>
                <span>Before anyone else.</span>
              </h1>
              <p className="sub reveal">
                AI scans Reddit every 30 minutes, scores threads 0–100 for buying intent, and writes a contextual reply. You copy it and paste it yourself — full control, zero ban risk.
              </p>
              <div className="hero-ctas reveal">
                <Link href="/login" className="btn btn-orange btn-lg">Start free trial <span className="arr">→</span></Link>
                <Link href="#how" className="btn btn-ghost btn-lg">See how it works</Link>
              </div>
              <div className="meta-row reveal">
                <span className="avatars">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" className="av" style={{ objectFit: 'cover' }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" className="av" style={{ objectFit: 'cover' }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://randomuser.me/api/portraits/men/46.jpg" alt="" className="av" style={{ objectFit: 'cover' }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="" className="av" style={{ objectFit: 'cover' }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://randomuser.me/api/portraits/men/22.jpg" alt="" className="av" style={{ objectFit: 'cover' }} />
                </span>
                <span><b data-count="247">0</b>+ founders</span>
                <span>•</span>
                <span className="star">★★★★★</span> <span>4.9/5</span>
              </div>
            </div>

            {/* Live feed mockup */}
            <div className="feed-card reveal" aria-hidden="true">
              <div className="feed-head">
                <div className="title">Fresh leads · last 24h</div>
                <div className="badge"><span className="dot"></span>Live · 18 new</div>
              </div>
              <div className="feed-list">
                <div className="feed-item">
                  <span className="num">01</span>
                  <div>
                    <div className="sub-tag">r/SaaS <span className="when">· 8m ago</span></div>
                    <div className="ttl">Tired of Replymer being so expensive — anyone found a good alternative?</div>
                    <div className="tags"><span className="pain-pill red">Competitor</span><span className="pain-pill orange">Switching</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="intent">96%</span><br />
                    <button className="ai-reply">⚡ Draft ready</button>
                  </div>
                </div>
                <div className="feed-item">
                  <span className="num">02</span>
                  <div>
                    <div className="sub-tag">r/Entrepreneur <span className="when">· 41m ago</span></div>
                    <div className="ttl">Best tool for finding Reddit threads where people want outreach advice?</div>
                    <div className="tags"><span className="pain-pill blue">Tool search</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="intent">89%</span><br />
                    <button className="ai-reply">⚡ Draft ready</button>
                  </div>
                </div>
                <div className="feed-item">
                  <span className="num">03</span>
                  <div>
                    <div className="sub-tag">r/startups <span className="when">· 2h ago</span></div>
                    <div className="ttl">Struggling to get my first 10 customers — anyone have a system that actually works?</div>
                    <div className="tags"><span className="pain-pill orange">Workflow pain</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="intent">81%</span><br />
                    <button className="ai-reply">⚡ Draft ready</button>
                  </div>
                </div>
                <div className="feed-item">
                  <span className="num">04</span>
                  <div>
                    <div className="sub-tag">r/indiehackers <span className="when">· 3h ago</span></div>
                    <div className="ttl">Is anyone using Reddit for B2B sales and actually seeing ROI?</div>
                    <div className="tags"><span className="pain-pill blue">Tool search</span><span className="pain-pill orange">ROI pain</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="intent">77%</span><br />
                    <button className="ai-reply">⚡ Draft ready</button>
                  </div>
                </div>
              </div>
              <div className="feed-foot">
                <span>Only leads from last 24h · always warm</span>
                <span>Showing 4 / 18</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="label">Trusted by founders at</div>
        <div className="marquee-track">
          <span>YC Alumni</span><span>PRODUCT HUNT</span><span>Indie Hackers</span><span>Microconf</span><span>Lumen</span><span>Foundry.</span><span>Helix Labs</span><span>Northwind</span>
          <span>YC Alumni</span><span>PRODUCT HUNT</span><span>Indie Hackers</span><span>Microconf</span><span>Lumen</span><span>Foundry.</span><span>Helix Labs</span><span>Northwind</span>
        </div>
      </div>

      {/* GEO SECTION */}
      <section id="geo" style={{ background: 'var(--ink)', padding: '112px 0', position: 'relative', overflow: 'hidden' }}>
        {/* Background decoration */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(229,75,27,.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 72, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(229,75,27,.15)', border: '1px solid rgba(229,75,27,.3)', borderRadius: 99, padding: '6px 14px', marginBottom: 28 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--orange)', fontWeight: 600 }}>
                  GEO — Generative Engine Optimization
                </span>
              </div>
              <h2 className="reveal" style={{ color: 'var(--cream)', maxWidth: '22ch', marginBottom: 24 }}>
                Reddit is now the <em>input</em> to what AI says about your product.
              </h2>
              <p className="reveal" style={{ color: 'rgba(251,246,238,.65)', fontSize: 17, lineHeight: 1.65, maxWidth: '48ch', marginBottom: 40 }}>
                ChatGPT, Gemini, Claude, and Perplexity are trained on Reddit and pull live Reddit threads into their answers. When someone asks an AI &ldquo;what&apos;s the best tool for X,&rdquo; the answer comes from Reddit discussions. Being present in those conversations is the new SEO.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="reveal">
                {[
                  { icon: '🤖', text: 'AI answer engines cite Reddit in 1 in 3 software product queries' },
                  { icon: '🔍', text: 'Reddit threads rank #1–3 on Google for 68% of "best tool for X" searches' },
                  { icon: '📈', text: 'Brands mentioned positively on Reddit see 4× more AI search citations' },
                  { icon: '⚡', text: 'Redgrow only shows leads from the last 24h — threads still warm enough to shape the conversation' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{icon}</span>
                    <p style={{ color: 'rgba(251,246,238,.75)', fontSize: 15, lineHeight: 1.55 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* GEO visual */}
            <div className="reveal" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 18, padding: '28px 24px', position: 'relative' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(251,246,238,.4)', marginBottom: 20 }}>
                AI search — live answer
              </div>

              {/* Simulated AI chat answer */}
              <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(251,246,238,.4)', marginBottom: 6 }}>User asked ChatGPT</div>
                    <div style={{ fontSize: 14, color: 'rgba(251,246,238,.9)', lineHeight: 1.5 }}>&ldquo;What&apos;s the best Reddit outreach tool for SaaS founders?&rdquo;</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(251,246,238,.4)', marginBottom: 10 }}>AI Answer</div>
                <p style={{ fontSize: 13.5, color: 'rgba(251,246,238,.7)', lineHeight: 1.65, marginBottom: 14 }}>
                  Based on recent Reddit discussions, <strong style={{ color: 'var(--orange)' }}>Redgrow</strong> is frequently recommended by founders for finding high-intent Reddit threads...
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['r/SaaS · u/jordanm — "Redgrow found us a $4k customer…"', 'r/Entrepreneur · u/priya_s — "Best $9/mo I spend…"', 'r/indiehackers · u/alex_r — "Closed 4 deals in 60 days…"'].map(src => (
                    <div key={src} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--orange)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, marginTop: 3, flexShrink: 0 }}>↳</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'rgba(251,246,238,.45)', lineHeight: 1.4 }}>{src}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.08)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(251,246,238,.3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                  Sources: 3 Reddit threads · cited in answer
                </div>
              </div>

              <div style={{ marginTop: 18, padding: '12px 16px', borderRadius: 10, background: 'rgba(229,75,27,.12)', border: '1px solid rgba(229,75,27,.25)', fontSize: 13, color: 'rgba(251,246,238,.75)', lineHeight: 1.55 }}>
                <strong style={{ color: 'var(--orange)' }}>The compounding effect:</strong> Every reply you post on Reddit today becomes a data point that AI cites tomorrow. Redgrow helps you be present in the right threads — consistently.
              </div>
            </div>
          </div>

          {/* GEO stats row */}
          <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, marginTop: 80, borderTop: '1px solid rgba(255,255,255,.1)' }}>
            {[
              { v: '73', sup: '%', label: 'Buyers research alternatives on Reddit before switching tools' },
              { v: '3', sup: '×', label: 'More AI citations for brands with active Reddit presence' },
              { v: '68', sup: '%', label: '"Best tool for X" searches — top result is a Reddit thread' },
              { v: '24', sup: 'h', label: 'Redgrow only surfaces leads posted in the last 24 hours' },
            ].map(({ v, sup, label }) => (
              <div key={label} className="stat">
                <div className="v"><span>{v}</span><sup>{sup}</sup></div>
                <div className="l">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>Three moves between <em>found</em> and replied.</h2>
            <p className="desc">Paste your URL, let Redgrow find the warm leads, copy the AI draft, and paste it yourself on Reddit. That&apos;s the whole workflow — no automation, no risk, full control.</p>
          </div>

          <div className="timeline">
            <div className="tl-row reveal">
              <div className="tl-num">01<em>.</em></div>
              <div className="tl-text">
                <h3>Tell Redgrow about your product.</h3>
                <p>Paste your landing page URL and Redgrow scrapes it in 30 seconds — product name, audience, key benefits, and competitors. It then suggests 20+ subreddits where your buyers are already talking.</p>
                <ul>
                  <li>AI-extracted product profile</li>
                  <li>Auto-discovered subreddits</li>
                  <li>Competitor list imported</li>
                </ul>
              </div>
              <div className="tl-mock">
                <div className="mock-line"><span>r/SaaS</span><span>47m ago</span></div>
                <div className="mock-title">Tired of Replymer being so expensive — anyone found a good alternative that actually finds warm leads?</div>
                <div className="mock-foot"><span>▲ 94 · 17 comments</span><span className="intent">96%</span></div>
              </div>
            </div>
            <div className="tl-row reveal">
              <div className="tl-num">02<em>.</em></div>
              <div className="tl-text">
                <h3>AI surfaces warm leads — from the last 24 hours only.</h3>
                <p>Redgrow scans posts <em>and</em> comment threads across your watchlist subreddits. It scores each one 0–100 for buying intent and classifies the pain type so you only see threads worth replying to — and only while they&apos;re still warm.</p>
                <ul>
                  <li>Scans posts + active comment threads</li>
                  <li>Intent score 0–100 · 5 pain types</li>
                  <li>Last 24h only — no stale leads</li>
                </ul>
              </div>
              <div className="tl-mock">
                <div className="mock-line"><span>Intent filter</span><span style={{ color: 'var(--orange)' }}>active</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: "'JetBrains Mono',monospace", fontSize: '11.5px', color: 'var(--ink-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>intent_score</span><span style={{ color: 'var(--orange)' }}>≥ 35</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>posted_within</span><span style={{ color: 'var(--orange)' }}>24h</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>source</span><span style={{ color: 'var(--orange)' }}>posts + comments</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>auto_post</span><span style={{ color: 'var(--green)' }}>never</span></div>
                </div>
              </div>
            </div>
            <div className="tl-row reveal">
              <div className="tl-num">03<em>.</em></div>
              <div className="tl-text">
                <h3>Copy the draft. Paste it yourself. Stay safe.</h3>
                <p>Review the AI-drafted reply, edit if you want, then hit Copy. You paste it directly on Reddit — your account, your timing, your words. No automation, no API access to your account, no ban risk. Ever.</p>
                <ul>
                  <li>Copy with one click</li>
                  <li>You post it — full control</li>
                  <li>Zero Reddit ToS risk</li>
                </ul>
              </div>
              <div className="tl-mock">
                <div className="mock-line"><span>AI ✦ Draft</span><span style={{ color: 'var(--orange)' }}>Empathetic peer</span></div>
                <div className="ln w95"></div><div className="ln w80"></div><div className="ln w70 acc"></div><div className="ln w60"></div>
                <div className="mock-foot">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ background: 'var(--green-soft)', color: 'var(--green)', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>⊕ Copy reply</span>
                  </span>
                  <span>Paste to Reddit yourself →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PULL QUOTE 1 */}
      <div className="pq reveal">
        <div className="narrow">
          <div className="marks">&ldquo;</div>
          <blockquote>Redgrow found us a $4,000 customer from a Reddit thread we&apos;d never have spotted manually — <em>in the first week.</em></blockquote>
          <cite>— <b>Marcus T.</b>, Founder · Helix Labs</cite>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="features-wrap">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>Four ways Redgrow <em>actually works</em>.</h2>
            <p className="desc">Intent-based lead discovery, AI reply drafting, subreddit intelligence, and GEO coverage — all without touching your Reddit account. You stay in control of every post.</p>
          </div>

          {/* Feature 01 */}
          <div className="feature-row reveal">
            <div className="f-text">
              <span className="eyebrow">Feature 01 — Intent detection</span>
              <h3>Catch warm leads in posts <em>and</em> comment threads.</h3>
              <p>Most tools only scan post titles. Redgrow scans both new posts and active comment threads — catching buyers who show up mid-conversation, not just when they start one.</p>
              <ul className="f-list">
                <li><span className="nm">.001</span><span>Scans post titles, bodies, and comment streams</span></li>
                <li><span className="nm">.002</span><span>Keyword pre-filter + Claude intent scoring</span></li>
                <li><span className="nm">.003</span><span>Only last 24h — no stale, cold leads</span></li>
              </ul>
            </div>
            <div className="f-mock">
              <div className="mh">
                <div className="mh-title">/scan · live</div>
                <div className="mh-pill" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>24h only</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { sub: 'r/SaaS', time: '8m ago', score: 96, type: 'Competitor', src: 'post' },
                  { sub: 'r/Entrepreneur', time: '1h ago', score: 88, type: 'Tool search', src: 'comment thread' },
                  { sub: 'r/startups', time: '3h ago', score: 81, type: 'Workflow pain', src: 'post' },
                ].map(item => (
                  <div key={item.sub} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'var(--ink-3)', marginBottom: 4, display: 'flex', gap: 8 }}>
                        <span>{item.sub}</span><span>·</span><span>{item.time}</span><span>·</span><span style={{ color: 'var(--orange)' }}>{item.src}</span>
                      </div>
                      <div style={{ fontSize: '10px', background: 'var(--orange-soft)', color: '#9c2f0d', padding: '2px 7px', borderRadius: 4, display: 'inline-block', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{item.type}</div>
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color: 'var(--orange)' }}>{item.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 02 */}
          <div className="feature-row flip reveal">
            <div className="f-text">
              <span className="eyebrow">Feature 02 — AI reply composer</span>
              <h3>Every draft reads like a human wrote it. Because you post it.</h3>
              <p>Claude drafts contextual, empathy-first replies that match the subreddit tone. Review, edit if needed, copy with one click — then paste it on Reddit yourself. Your account, your words.</p>
              <ul className="f-list">
                <li><span className="nm">.001</span><span>Pain-type–aware drafts, every time</span></li>
                <li><span className="nm">.002</span><span>Tone modes: helpful peer, casual, expert</span></li>
                <li><span className="nm">.003</span><span>Never auto-posts — you paste, you control</span></li>
              </ul>
            </div>
            <div className="f-mock">
              <div className="mh">
                <div className="mh-title">/replies/compose</div>
                <div className="mh-pill">AI ✦ Draft</div>
              </div>
              <div className="composer">
                <div className="ctx"><span className="av"></span><span>Replying to u/jordanm in r/SaaS</span></div>
                <div className="ln w95"></div>
                <div className="ln w80"></div>
                <div className="ln w95 acc"></div>
                <div className="ln w70"></div>
                <div className="ln w60"></div>
              </div>
              <div className="composer-foot">
                <div className="tones">
                  <span className="tone on">Helpful</span>
                  <span className="tone">Casual</span>
                  <span className="tone">Expert</span>
                </div>
                <button className="btn btn-orange btn-sm">Copy →</button>
              </div>
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--green-soft)', border: '1px solid rgba(31,107,63,.2)', borderRadius: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--green)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                ✓ You paste to Reddit · No auto-post
              </div>
            </div>
          </div>

          {/* Feature 03 */}
          <div className="feature-row reveal">
            <div className="f-text">
              <span className="eyebrow">Feature 03 — GEO coverage</span>
              <h3>Reddit replies today become AI citations tomorrow.</h3>
              <p>AI search tools pull from Reddit constantly. Every reply you post in a relevant thread builds your GEO presence — Redgrow shows you exactly which threads are worth joining for maximum AI search coverage.</p>
              <ul className="f-list">
                <li><span className="nm">.001</span><span>AI-ranked subreddits by GEO signal strength</span></li>
                <li><span className="nm">.002</span><span>High-authority threads likely to be AI-cited</span></li>
                <li><span className="nm">.003</span><span>Track your Reddit → AI search footprint</span></li>
              </ul>
            </div>
            <div className="f-mock">
              <div className="mh">
                <div className="mh-title">/subreddits</div>
                <div className="mh-pill">9 monitored</div>
              </div>
              <div className="sr-grid">
                <div className="sr-tile on"><div className="name">r/SaaS</div><div className="num">348</div><div className="lbl">leads · 7d</div><div className="delta">▲ GEO HIGH</div></div>
                <div className="sr-tile"><div className="name">r/startups</div><div className="num">212</div><div className="lbl">leads · 7d</div><div className="delta">▲ 14%</div></div>
                <div className="sr-tile"><div className="name">r/Entrepreneur</div><div className="num">189</div><div className="lbl">leads · 7d</div><div className="delta">▲ 9%</div></div>
                <div className="sr-tile"><div className="name">r/marketing</div><div className="num">143</div><div className="lbl">leads · 7d</div><div className="delta">▲ 18%</div></div>
                <div className="sr-tile on"><div className="name">r/indiehackers</div><div className="num">121</div><div className="lbl">leads · 7d</div><div className="delta">▲ GEO HIGH</div></div>
                <div className="sr-tile"><div className="name">r/smallbiz</div><div className="num">88</div><div className="lbl">leads · 7d</div><div className="delta">▲ 6%</div></div>
              </div>
            </div>
          </div>

          {/* Feature 04 */}
          <div className="feature-row flip reveal">
            <div className="f-text">
              <span className="eyebrow">Feature 04 — Zero ban risk</span>
              <h3>Your account. Your timing. Your reputation.</h3>
              <p>Redgrow never touches your Reddit account. There&apos;s no OAuth, no API access, no automation. You copy the draft, open the thread, paste, post — Reddit sees a human. Because it is one.</p>
              <ul className="f-list">
                <li><span className="nm">.001</span><span>No Reddit API access — ever</span></li>
                <li><span className="nm">.002</span><span>No auto-posting, no bots, no risk</span></li>
                <li><span className="nm">.003</span><span>Compliant with Reddit ToS by design</span></li>
              </ul>
            </div>
            <div className="f-mock">
              <div className="mh">
                <div className="mh-title">/safety</div>
                <div className="mh-pill" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>All clear</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Reddit API access', val: 'None', ok: true },
                  { label: 'Auto-posting', val: 'Disabled', ok: true },
                  { label: 'Account tokens stored', val: 'Never', ok: true },
                  { label: 'ToS compliance', val: 'Full', ok: true },
                  { label: 'Ban risk', val: 'Zero', ok: true },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, color: 'var(--ink-3)' }}>{item.label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, fontWeight: 700, color: 'var(--green)', background: 'var(--green-soft)', padding: '3px 9px', borderRadius: 4 }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PULL QUOTE 2 */}
      <div className="pq reveal">
        <div className="narrow">
          <div className="marks">&ldquo;</div>
          <blockquote>I used to spend 3 hours a day scrolling Reddit for leads. Now I spend <em>15 minutes</em> copying and pasting what Redgrow finds for me.</blockquote>
          <cite>— <b>Sarah K.</b>, Head of Growth · Foundry</cite>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section className="compact">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>What founders are <em>saying</em>.</h2>
            <p className="desc">247 founders chose Redgrow over scrolling manually. Here&apos;s what changed after they did.</p>
          </div>
          <div className="testi-grid">
            <div className="testi reveal">
              <span className="stars">★★★★★</span>
              <p>&ldquo;The fact that I post everything myself is actually the key feature. No automation nerves, no worrying about Reddit bans. Redgrow just hands me a great reply and I paste it. Closed four deals in 60 days.&rdquo;</p>
              <div className="who">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Alex R." className="av" style={{ objectFit: 'cover' }} />
                <div><strong>Alex R.</strong><span>Founder · Quill</span></div>
              </div>
            </div>
            <div className="testi reveal">
              <span className="stars">★★★★★</span>
              <p>&ldquo;The 24h-only filter is genius. Every lead in my queue is still hot. I reply within the same day and my response rate is insane compared to when I was digging through week-old threads manually.&rdquo;</p>
              <div className="who">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://randomuser.me/api/portraits/men/46.jpg" alt="Jordan M." className="av" style={{ objectFit: 'cover' }} />
                <div><strong>Jordan M.</strong><span>CEO · Northwind</span></div>
              </div>
            </div>
            <div className="testi reveal">
              <span className="stars">★★★★★</span>
              <p>&ldquo;Set it up Saturday. By Monday I had three DMs from people who saw my replies. And Perplexity is now citing one of my Reddit answers when people ask about my category. That GEO thing is real.&rdquo;</p>
              <div className="who">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Caithlyn S." className="av" style={{ objectFit: 'cover' }} />
                <div><strong>Caithlyn S.</strong><span>Founder · Lumen</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="compare-wrap">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>The before and <em>after</em>.</h2>
            <p className="desc">Most founders try Reddit manually for a few weeks, burn out, and give up. Redgrow is how the persistent ones finally make it work — safely.</p>
          </div>
          <div className="compare reveal">
            <div className="col without">
              <div className="head">Before / without</div>
              <h3>The manual way.</h3>
              <ul>
                <li><span className="mk x">✕</span>Spend 2–3 hours/day scrolling Reddit with no system</li>
                <li><span className="mk x">✕</span>Miss warm leads buried in comment threads of old posts</li>
                <li><span className="mk x">✕</span>Arrive hours late — thread already cooled down</li>
                <li><span className="mk x">✕</span>Use auto-posting tools and risk account bans</li>
                <li><span className="mk x">✕</span>Invisible to AI search — no Reddit presence building up</li>
                <li><span className="mk x">✕</span>Write every reply from scratch, inconsistently</li>
              </ul>
            </div>
            <div className="col with">
              <div className="head">After / with Redgrow</div>
              <h3>The Redgrow way.</h3>
              <ul>
                <li><span className="mk v">✓</span>Curated queue of warm leads from last 24h — delivered daily</li>
                <li><span className="mk v">✓</span>Catches leads in posts AND active comment threads</li>
                <li><span className="mk v">✓</span>Reply while threads are still hot — be first every time</li>
                <li><span className="mk v">✓</span>You paste every reply — no automation, no ban risk ever</li>
                <li><span className="mk v">✓</span>Build GEO presence — AI cites your Reddit replies</li>
                <li><span className="mk v">✓</span>Consistent, on-brand drafts — copy and paste in 60 seconds</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '100px 0', background: 'var(--bg)' }}>
        <div className="wrap">
          <div className="section-head reveal" style={{ marginBottom: 56 }}>
            <h2>Simple pricing. No surprises.</h2>
            <p className="desc">Start free. Upgrade when it&apos;s paying for itself — which usually happens on the first lead.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 860, margin: '0 auto' }}>
            {/* Free */}
            <div className="reveal" style={{ borderRadius: 16, border: '1px solid var(--line)', background: 'var(--card)', padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace' }}>Free</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.03em' }}>$0</span>
                  <span style={{ fontSize: 15, color: 'var(--text3)' }}>/mo</span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text3)', lineHeight: 1.55 }}>Get a feel for what Redgrow finds before you commit.</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                {['1 product', '100 opps / month', '20 reply drafts', '2 scans / day', '5 subreddits'].map(f => (
                  <li key={f} style={{ fontSize: 14.5, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 9 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.8"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '11px 0', borderRadius: 10, fontSize: 15, fontWeight: 700, background: 'var(--panel2)', border: '1px solid var(--line2)', color: 'var(--text)', textDecoration: 'none' }}>
                Start free
              </Link>
            </div>

            {/* Starter */}
            <div className="reveal" style={{ borderRadius: 16, border: '1.5px solid var(--orange)', background: 'var(--card)', padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--orange)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 99, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                Most popular
              </div>
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--orange)', fontFamily: 'JetBrains Mono, monospace' }}>Starter</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.03em' }}>$9</span>
                  <span style={{ fontSize: 15, color: 'var(--text3)' }}>/mo</span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text3)', lineHeight: 1.55 }}>For founders actively building their distribution pipeline.</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                {['3 products', '500 opps / month', '150 reply drafts', '10 scans / day', '15 subreddits per product', 'GEO analysis'].map(f => (
                  <li key={f} style={{ fontSize: 14.5, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 9 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.8"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '11px 0', borderRadius: 10, fontSize: 15, fontWeight: 700, background: 'var(--orange)', color: '#fff', textDecoration: 'none' }}>
                Get started →
              </Link>
            </div>

            {/* Growth */}
            <div className="reveal" style={{ borderRadius: 16, border: '1px solid var(--line)', background: 'var(--card)', padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace' }}>Growth</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.03em' }}>$19</span>
                  <span style={{ fontSize: 15, color: 'var(--text3)' }}>/mo</span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text3)', lineHeight: 1.55 }}>For teams running Reddit as a serious acquisition channel.</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                {['5 products', '2,000 opps / month', '500 reply drafts', 'Unlimited scans', '30 subreddits per product', 'GEO analysis', 'Priority support'].map(f => (
                  <li key={f} style={{ fontSize: 14.5, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 9 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.8"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '11px 0', borderRadius: 10, fontSize: 15, fontWeight: 700, background: 'var(--panel2)', border: '1px solid var(--line2)', color: 'var(--text)', textDecoration: 'none' }}>
                Get started →
              </Link>
            </div>
          </div>

          {/* Guarantee row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 36, flexWrap: 'wrap' }}>
            {['14-day money-back guarantee', 'Cancel anytime', 'No auto-posting · zero ban risk', 'Switch plans anytime'].map(t => (
              <span key={t} style={{ fontSize: 13.5, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="wrap">
          <div className="section-head reveal">
            <h2>Frequently asked.</h2>
            <p className="desc">If you don&apos;t find your answer below, email us at hello@redgrow.ai — we respond within 24 hours.</p>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final">
        <div className="wrap">
          <div className="reddit-mark-big">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="currentColor" />
              <circle cx="9" cy="13" r="1.4" fill="#E54B1B" />
              <circle cx="15" cy="13" r="1.4" fill="#E54B1B" />
              <path d="M8 16 Q12 19 16 16" stroke="#E54B1B" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              <circle cx="12" cy="5.5" r="1.2" fill="#E54B1B" />
              <line x1="12" y1="6.5" x2="12" y2="10" stroke="#E54B1B" strokeWidth="1.4" />
            </svg>
          </div>
          <h2>Stop scrolling. <em>Start showing up.</em></h2>
          <p>Reddit has 500M active users — and AI search is citing their conversations daily. Thousands of warm leads are asking for your product right now. Redgrow finds them, drafts the reply, you paste it. That&apos;s it.</p>
          <Link href="/login" className="btn btn-orange btn-lg" style={{ marginTop: '10px' }}>Start your free trial <span className="arr">→</span></Link>
          <div className="trust-row">
            <span>Starts at $9/mo</span><span className="dot"></span>
            <span>14-day money-back</span><span className="dot"></span>
            <span>No auto-posting</span><span className="dot"></span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <Link href="/" className="logo"><span className="logo-mark"></span>Redgrow</Link>
              <p>Find warm Reddit leads and build GEO presence — without touching your account or risking a ban.</p>
            </div>
            <div>
              <h5>Product</h5>
              <ul>
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#geo">GEO Guide</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h5>Resources</h5>
              <ul>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/docs">Help Center</Link></li>
                <li><Link href="/docs/tutorials">Tutorials</Link></li>
              </ul>
            </div>
            <div>
              <h5>Compare</h5>
              <ul>
                <li><Link href="/compare/vs-replymer">vs Replymer</Link></li>
                <li><Link href="/compare/vs-beno">vs Beno</Link></li>
                <li><Link href="/compare/vs-redditgrow">vs RedditGrow</Link></li>
                <li><Link href="/compare/vs-manual">vs Manual</Link></li>
              </ul>
            </div>
            <div>
              <h5>Legal</h5>
              <ul>
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <div>© 2026 Redgrow · All rights reserved · No auto-posting, ever.</div>
          </div>
        </div>
      </footer>

      <LandingScript />
    </div>
  )
}
