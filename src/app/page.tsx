import type { Metadata } from 'next'
import Link from 'next/link'
import { FAQAccordion } from '@/components/landing/FAQAccordion'
import { LandingScript } from '@/components/landing/LandingScript'
import './landing.css'

export const metadata: Metadata = {
  title: 'Redgrow — Find High-Intent Reddit Buyers Before Anyone Else',
  description:
    'AI monitors Reddit 24/7, scores threads by buying intent, and drafts contextual replies. You approve — it posts from your own account at human pace. From $9/mo.',
  keywords: [
    'reddit marketing tool', 'reddit outreach', 'reddit lead generation',
    'reddit automation', 'reddit reply tool', 'reddit leads', 'saas marketing',
    'redgrow', 'reddit growth tool',
  ],
  openGraph: {
    title: 'Redgrow — Find High-Intent Reddit Buyers Before Anyone Else',
    description: 'AI scans Reddit 24/7, scores every thread by buying intent, drafts a perfect reply. You approve. It posts from your own account. From $9/mo.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Redgrow — Find High-Intent Reddit Buyers',
    description: 'AI scans Reddit 24/7, scores threads by buying intent, drafts replies. You approve. Posts from your account. From $9/mo.',
  },
  alternates: { canonical: 'https://redgrow.ai' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Redgrow',
  applicationCategory: 'BusinessApplication',
  description: 'AI-powered Reddit outreach tool that finds high-intent leads and posts contextual replies from your own Reddit account.',
  offers: [
    { '@type': 'Offer', price: '9', priceCurrency: 'USD', name: 'Starter' },
    { '@type': 'Offer', price: '19', priceCurrency: 'USD', name: 'Growth' },
    { '@type': 'Offer', price: '49', priceCurrency: 'USD', name: 'Agency' },
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
            <Link href="#features">Features</Link>
            <Link href="#how">How it works</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="/blog">Blog</Link>
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
          <Link href="#features">Features</Link>
          <Link href="#how">How it works</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/login">Login</Link>
          <Link href="/login" className="btn btn-primary">Get started →</Link>
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <h1 className="reveal">
                <span className="lead">The quiet way to find</span>
                <span className="orange-word"><em>Reddit buyers</em></span>
                <span>before anyone else.</span>
              </h1>
              <p className="sub reveal">
                AI scans Reddit every 30 minutes, scores every thread 0–100 for buying intent, and drafts a contextual reply. You approve — it posts from your own account at human pace.
              </p>
              <div className="hero-ctas reveal">
                <Link href="/login" className="btn btn-orange btn-lg">Start free trial <span className="arr">→</span></Link>
                <Link href="#demo" className="btn btn-ghost btn-lg">Watch 3-min demo</Link>
              </div>
              <div className="meta-row reveal">
                <span className="avatars">
                  <span className="av"></span><span className="av"></span><span className="av"></span><span className="av"></span><span className="av"></span>
                </span>
                <span><b data-count="247">0</b>+ founders</span>
                <span>•</span>
                <span className="star">★★★★★</span> <span>4.9/5</span>
                <span>•</span>
                <span>14-day money-back</span>
              </div>
            </div>

            {/* Live feed mockup */}
            <div className="feed-card reveal" aria-hidden="true">
              <div className="feed-head">
                <div className="title">High-intent threads</div>
                <div className="badge"><span className="dot"></span>Live · 23 new</div>
              </div>
              <div className="feed-list">
                <div className="feed-item">
                  <span className="num">01</span>
                  <div>
                    <div className="sub-tag">r/SaaS <span className="when">· 12m ago</span></div>
                    <div className="ttl">Anyone struggling to find their first 10 paying customers? Looking for outbound advice.</div>
                    <div className="tags"><span className="pain-pill orange">Switching</span><span className="pain-pill blue">Tool search</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="intent">94%</span><br />
                    <button className="ai-reply">⚡ AI Reply</button>
                  </div>
                </div>
                <div className="feed-item">
                  <span className="num">02</span>
                  <div>
                    <div className="sub-tag">r/Entrepreneur <span className="when">· 38m ago</span></div>
                    <div className="ttl">Is anyone using Replymer and not happy? Looking for a cheaper alternative.</div>
                    <div className="tags"><span className="pain-pill red">Competitor</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="intent">88%</span><br />
                    <button className="ai-reply">⚡ AI Reply</button>
                  </div>
                </div>
                <div className="feed-item">
                  <span className="num">03</span>
                  <div>
                    <div className="sub-tag">r/startups <span className="when">· 1h ago</span></div>
                    <div className="ttl">Best tool for Reddit outreach in 2026? Tired of manually scrolling for hours.</div>
                    <div className="tags"><span className="pain-pill blue">Tool search</span><span className="pain-pill orange">Switching</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="intent">82%</span><br />
                    <button className="ai-reply">⚡ AI Reply</button>
                  </div>
                </div>
                <div className="feed-item">
                  <span className="num">04</span>
                  <div>
                    <div className="sub-tag">r/marketing <span className="when">· 2h ago</span></div>
                    <div className="ttl">Recommendations for a tool that monitors specific keywords across subreddits?</div>
                    <div className="tags"><span className="pain-pill blue">Tool search</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="intent">79%</span><br />
                    <button className="ai-reply">⚡ AI Reply</button>
                  </div>
                </div>
              </div>
              <div className="feed-foot">
                <span>1,247 threads matched · last 7 days</span>
                <span>Showing 4 / 23</span>
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

      {/* STATS */}
      <section className="stats-section">
        <div className="wrap">
          <h2 className="reveal">A small operation, with <em>outsized</em> results.</h2>
          <div className="stats-grid reveal">
            <div className="stat"><div className="v"><span data-count="247">0</span><sup>+</sup></div><div className="l">Active founders</div></div>
            <div className="stat"><div className="v"><span data-count="1.4">0</span><sup>M</sup></div><div className="l">Threads scanned · weekly</div></div>
            <div className="stat"><div className="v"><span data-count="34">0</span><sup>k</sup></div><div className="l">AI replies drafted</div></div>
            <div className="stat"><div className="v"><span data-count="12.8">0</span><sup>×</sup></div><div className="l">Avg. ROI · first 90 days</div></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>Three moves between <em>idea</em> and customer.</h2>
            <p className="desc">Paste your URL, let Redgrow find the buyers, and approve a reply. That&apos;s the whole workflow. Most founders check their queue once a day and get back to building.</p>
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
                <div className="mock-line"><span>r/SaaS</span><span>2h ago</span></div>
                <div className="mock-title">We keep losing deals to cheaper tools — anyone solved this without cutting price?</div>
                <div className="mock-foot"><span>▲ 142 · 23 comments</span><span className="intent">91%</span></div>
              </div>
            </div>
            <div className="tl-row reveal">
              <div className="tl-num">02<em>.</em></div>
              <div className="tl-text">
                <h3>Let the AI surface the buyers.</h3>
                <p>Every 30 minutes, Redgrow scans your watchlist subreddits and scores each thread 0–100 for buying intent. It classifies the pain type and sends you only the threads worth replying to.</p>
                <ul>
                  <li>Intent score 0–100</li>
                  <li>5 pain types classified</li>
                  <li>Real-time email alerts</li>
                </ul>
              </div>
              <div className="tl-mock">
                <div className="mock-line"><span>Filters</span><span>3 active</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: "'JetBrains Mono',monospace", fontSize: '11.5px', color: 'var(--ink-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>intent</span><span style={{ color: 'var(--orange)' }}>≥ 78%</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>pain_type</span><span style={{ color: 'var(--orange)' }}>competitor, switching</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>posted_within</span><span style={{ color: 'var(--orange)' }}>24h</span></div>
                </div>
              </div>
            </div>
            <div className="tl-row reveal">
              <div className="tl-num">03<em>.</em></div>
              <div className="tl-text">
                <h3>Approve, post, track.</h3>
                <p>Review the AI-drafted reply in your approval queue, edit if you want, then hit approve. Redgrow posts at a randomized delay and tracks every click back to the original thread.</p>
                <ul>
                  <li>Empathy-first AI drafts</li>
                  <li>Safe posting schedule</li>
                  <li>Click-level attribution</li>
                </ul>
              </div>
              <div className="tl-mock">
                <div className="mock-line"><span>AI ✦ Draft</span><span style={{ color: 'var(--orange)' }}>Helpful tone</span></div>
                <div className="ln w95"></div><div className="ln w80"></div><div className="ln w70 acc"></div><div className="ln w60"></div>
                <div className="mock-foot"><span>Post to r/SaaS</span><span>↗ tracked</span></div>
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
            <h2>Four ways founders use <em>Redgrow</em>.</h2>
            <p className="desc">From intent-based listening to post-click attribution, Redgrow handles the full lifecycle of Reddit outreach — so you can focus on the conversations that matter.</p>
          </div>

          {/* Feature 01 */}
          <div className="feature-row reveal">
            <div className="f-text">
              <span className="eyebrow">Feature 01 — Intent listening</span>
              <h3>Never miss a buyer asking for your exact solution.</h3>
              <p>AI monitors 50+ buying signals across every subreddit in your watchlist. When intent crosses your threshold, you&apos;re first in the queue.</p>
              <ul className="f-list">
                <li><span className="nm">.001</span><span>50+ pre-built buying signals, always on</span></li>
                <li><span className="nm">.002</span><span>Custom keyword library, tuned to your product</span></li>
                <li><span className="nm">.003</span><span>Instant Slack & email alerts on new matches</span></li>
              </ul>
            </div>
            <div className="f-mock">
              <div className="mh">
                <div className="mh-title">/keywords</div>
                <div className="mh-pill">24 tracked</div>
              </div>
              <div className="kw-grid">
                <span className="kw on">#alternative to <span className="x">×</span></span>
                <span className="kw on">#looking for tool <span className="x">×</span></span>
                <span className="kw">#recommend</span>
                <span className="kw on">#switching from <span className="x">×</span></span>
                <span className="kw">#vs competitor</span>
                <span className="kw on">#best app for <span className="x">×</span></span>
                <span className="kw">#anyone using</span>
                <span className="kw on">#tired of <span className="x">×</span></span>
                <span className="kw">#how do you</span>
                <span className="kw on">#manual sucks <span className="x">×</span></span>
              </div>
              <div style={{ marginTop: '18px', borderTop: '1px solid var(--line)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '11.5px', color: 'var(--ink-3)' }}>
                <span>notify_on_match: true</span>
                <span style={{ width: '32px', height: '18px', borderRadius: '999px', background: 'var(--orange)', position: 'relative', display: 'inline-block' }}>
                  <span style={{ position: 'absolute', right: '2px', top: '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', display: 'block' }}></span>
                </span>
              </div>
            </div>
          </div>

          {/* Feature 02 */}
          <div className="feature-row flip reveal">
            <div className="f-text">
              <span className="eyebrow">Feature 02 — AI reply composer</span>
              <h3>Every reply reads like a human wrote it. Because it did.</h3>
              <p>Claude drafts contextual, empathy-first replies that match the subreddit tone. Review, edit if needed, and approve in one click.</p>
              <ul className="f-list">
                <li><span className="nm">.001</span><span>Pain-type–aware reply drafts, every time</span></li>
                <li><span className="nm">.002</span><span>Tone modes: helpful, casual, expert</span></li>
                <li><span className="nm">.003</span><span>Never starts with your product name</span></li>
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
                <button className="btn btn-orange btn-sm">Post →</button>
              </div>
            </div>
          </div>

          {/* Feature 03 */}
          <div className="feature-row reveal">
            <div className="f-text">
              <span className="eyebrow">Feature 03 — Subreddit intelligence</span>
              <h3>Know exactly which communities are worth your time.</h3>
              <p>Every subreddit in your watchlist is ranked by match volume, trend, and conversion. Cut the noise, double down on what works.</p>
              <ul className="f-list">
                <li><span className="nm">.001</span><span>AI-ranked community suggestions on setup</span></li>
                <li><span className="nm">.002</span><span>Safety score per subreddit, updated weekly</span></li>
                <li><span className="nm">.003</span><span>Auto-blacklist on removal patterns</span></li>
              </ul>
            </div>
            <div className="f-mock">
              <div className="mh">
                <div className="mh-title">/subreddits</div>
                <div className="mh-pill">9 monitored</div>
              </div>
              <div className="sr-grid">
                <div className="sr-tile on"><div className="name">r/SaaS</div><div className="num">348</div><div className="lbl">matches · 7d</div><div className="delta">▲ 22%</div></div>
                <div className="sr-tile"><div className="name">r/startups</div><div className="num">212</div><div className="lbl">matches · 7d</div><div className="delta">▲ 14%</div></div>
                <div className="sr-tile"><div className="name">r/Entrepreneur</div><div className="num">189</div><div className="lbl">matches · 7d</div><div className="delta">▲ 9%</div></div>
                <div className="sr-tile"><div className="name">r/marketing</div><div className="num">143</div><div className="lbl">matches · 7d</div><div className="delta">▲ 18%</div></div>
                <div className="sr-tile on"><div className="name">r/indiehackers</div><div className="num">121</div><div className="lbl">matches · 7d</div><div className="delta">▲ 31%</div></div>
                <div className="sr-tile"><div className="name">r/smallbiz</div><div className="num">88</div><div className="lbl">matches · 7d</div><div className="delta">▲ 6%</div></div>
              </div>
            </div>
          </div>

          {/* Feature 04 */}
          <div className="feature-row flip reveal">
            <div className="f-text">
              <span className="eyebrow">Feature 04 — Conversion tracking</span>
              <h3>Know your exact Reddit ROI, thread by thread.</h3>
              <p>Every reply gets a tracked link. See which threads sent traffic, which converted, and what your return actually is.</p>
              <ul className="f-list">
                <li><span className="nm">.001</span><span>Per-thread attribution, automatically</span></li>
                <li><span className="nm">.002</span><span>Revenue tracking via UTMs</span></li>
                <li><span className="nm">.003</span><span>Weekly digest email with top performers</span></li>
              </ul>
            </div>
            <div className="f-mock">
              <div className="mh">
                <div className="mh-title">/analytics</div>
                <div className="mh-pill">Last 30 days</div>
              </div>
              <div className="chart-wrap">
                <div className="chart-stats">
                  <div className="chart-stat"><div className="lbl">Reach</div><div className="val">42.1k</div><div className="delta">▲ 18%</div></div>
                  <div className="chart-stat"><div className="lbl">Clicks</div><div className="val">1,283</div><div className="delta">▲ 9%</div></div>
                  <div className="chart-stat"><div className="lbl">Convert</div><div className="val">3.4%</div><div className="delta">▲ 0.6</div></div>
                </div>
                <div className="chart">
                  <svg viewBox="0 0 320 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E54B1B" stopOpacity=".25" />
                        <stop offset="100%" stopColor="#E54B1B" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,82 L32,76 L64,78 L96,60 L128,62 L160,45 L192,48 L224,32 L256,28 L288,18 L320,10 L320,100 L0,100 Z" fill="url(#g1)" />
                    <path d="M0,82 L32,76 L64,78 L96,60 L128,62 L160,45 L192,48 L224,32 L256,28 L288,18 L320,10" fill="none" stroke="#E54B1B" strokeWidth="2" strokeLinecap="round" />
                    <line x1="0" y1="82" x2="320" y2="10" stroke="rgba(22,18,16,.1)" strokeWidth="1" strokeDasharray="2 4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PULL QUOTE 2 */}
      <div className="pq reveal">
        <div className="narrow">
          <div className="marks">&ldquo;</div>
          <blockquote>I used to spend 3 hours a day scrolling Reddit for leads. Now I spend <em>15 minutes</em> approving what Redgrow finds for me.</blockquote>
          <cite>— <b>Sarah K.</b>, Head of Growth · Foundry</cite>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section className="compact">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>What founders are <em>saying</em>.</h2>
            <p className="desc">247 founders chose Redgrow over the alternatives. Here&apos;s what changed after they did.</p>
          </div>
          <div className="testi-grid">
            <div className="testi reveal">
              <span className="stars">★★★★★</span>
              <p>&ldquo;I was skeptical — Reddit marketing seemed risky. But Redgrow&apos;s safety layer is real. My replies get upvotes, my account is healthy, and I&apos;ve closed four deals from it in 60 days.&rdquo;</p>
              <div className="who">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Alex R." className="av" style={{ objectFit: 'cover' }} />
                <div><strong>Alex R.</strong><span>Founder · Quill</span></div>
              </div>
            </div>
            <div className="testi reveal">
              <span className="stars">★★★★★</span>
              <p>&ldquo;The intent scoring is the killer feature. I&apos;m only replying to threads where someone is actively looking to switch. My close rate from Reddit is higher than any other channel.&rdquo;</p>
              <div className="who">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://randomuser.me/api/portraits/men/46.jpg" alt="Jordan M." className="av" style={{ objectFit: 'cover' }} />
                <div><strong>Jordan M.</strong><span>CEO · Northwind</span></div>
              </div>
            </div>
            <div className="testi reveal">
              <span className="stars">★★★★★</span>
              <p>&ldquo;Set it up on a Saturday. By Monday I had three inbound messages from people who saw my replies. That&apos;s a 48-hour payback on a $9/month subscription.&rdquo;</p>
              <div className="who">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Priya S." className="av" style={{ objectFit: 'cover' }} />
                <div><strong>Priya S.</strong><span>Founder · Lumen</span></div>
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
            <p className="desc">Most founders try Reddit manually for a few weeks, burn out, and give up. Redgrow is how the persistent ones finally make it work.</p>
          </div>
          <div className="compare reveal">
            <div className="col without">
              <div className="head">Before / without</div>
              <h3>The manual way.</h3>
              <ul>
                <li><span className="mk x">✕</span>Spend 2–3 hours/day scrolling Reddit with no system</li>
                <li><span className="mk x">✕</span>Miss the high-intent buyers buried in low-karma threads</li>
                <li><span className="mk x">✕</span>Arrive 6+ hours late — after the thread has cooled down</li>
                <li><span className="mk x">✕</span>No way to track which posts actually drive signups</li>
                <li><span className="mk x">✕</span>Post too aggressively, get flagged, start over</li>
                <li><span className="mk x">✕</span>Write every reply from scratch — inconsistently</li>
              </ul>
            </div>
            <div className="col with">
              <div className="head">After / with Redgrow</div>
              <h3>The Redgrow way.</h3>
              <ul>
                <li><span className="mk v">✓</span>Curated queue of high-intent threads delivered daily</li>
                <li><span className="mk v">✓</span>Never miss a buyer — AI scans 1.4M threads per week</li>
                <li><span className="mk v">✓</span>Be first to reply with an AI draft already waiting</li>
                <li><span className="mk v">✓</span>Full attribution: see exactly which thread converted</li>
                <li><span className="mk v">✓</span>Safe posting schedule with warmup protection built in</li>
                <li><span className="mk v">✓</span>Consistent, on-brand replies drafted and ready to approve</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO / DEMO */}
      <section className="video-section" id="demo">
        <div className="video-wrap reveal">
          <h2 style={{ marginTop: '14px' }}>See <em>Redgrow</em> in motion.</h2>
          <div className="video-frame" style={{ marginTop: '42px' }}>
            <div className="corner"><span className="rec"></span>REDGROW · DEMO REEL</div>
            <button className="play" aria-label="Play demo">
              <svg width="22" height="24" viewBox="0 0 22 24" fill="currentColor"><path d="M2 2 L20 12 L2 22 Z" /></svg>
            </button>
            <div className="vtime">03:14 / 03:14</div>
          </div>
          <div className="video-caption">Watch the 3-minute demo · No signup required</div>
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
          <h2>Stop scrolling. <em>Start growing.</em></h2>
          <p>Reddit has 500 million active users. Thousands of them are asking for exactly what you&apos;ve built — right now, in threads you&apos;ll never read. Redgrow makes sure you&apos;re there when they do.</p>
          <Link href="/login" className="btn btn-orange btn-lg" style={{ marginTop: '10px' }}>Start your free trial <span className="arr">→</span></Link>
          <div className="trust-row">
            <span>Starts at $9/mo</span><span className="dot"></span>
            <span>14-day money-back</span><span className="dot"></span>
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
              <p>The intelligent Reddit outreach tool for founders who don&apos;t have 3 hours to scroll.</p>
            </div>
            <div>
              <h5>Product</h5>
              <ul>
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#pricing">Pricing</Link></li>
                <li><Link href="/roadmap">Roadmap</Link></li>
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
            <div>© 2026 Redgrow · All rights reserved</div>
          </div>
        </div>
      </footer>

      <LandingScript />
    </div>
  )
}
