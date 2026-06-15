'use client'

import Link from 'next/link'
import { useLanguage, useT } from '@/lib/i18n'
import { FAQAccordion } from './FAQAccordion'
import { InteractiveDemo } from './InteractiveDemo'
import { LandingScript } from './LandingScript'

export function LandingContent() {
  const t = useT()
  const { lang, setLang } = useLanguage()
  const L = t.landing

  return (
    <div className="lp">
      {/* NAV */}
      <nav className="nav" id="nav">
        <div className="wrap nav-row">
          <Link href="/" className="logo">
            <span className="logo-mark"></span>
            <span>Redgrow</span>
          </Link>
          <div className="nav-links">
            <Link href="#geo">{L.nav.geo}</Link>
            <Link href="#features">{L.nav.features}</Link>
            <Link href="#how">{L.nav.howItWorks}</Link>
            <Link href="#pricing">{L.nav.pricing}</Link>
          </div>
          <div className="nav-cta">
            <Link href="/login" className="login">{L.nav.login}</Link>
            <Link href="/login?mode=signup" className="btn btn-primary btn-sm">{L.nav.getStarted} <span className="arr">→</span></Link>
            {/* Language picker */}
            <button
              onClick={() => setLang(lang === 'en' ? 'de' : 'en')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '6px 10px', borderRadius: 7, border: '1px solid rgba(229,75,27,.3)',
                background: 'rgba(229,75,27,.07)', cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: '.06em',
                color: 'var(--orange)', lineHeight: 1,
              }}
              title={lang === 'en' ? 'Auf Deutsch wechseln' : 'Switch to English'}
            >
              <span style={{ opacity: lang === 'en' ? 1 : 0.4 }}>EN</span>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ opacity: lang === 'de' ? 1 : 0.4 }}>DE</span>
            </button>
            <button className="hamburger" id="ham" aria-label="Menu"><span></span></button>
          </div>
        </div>
      </nav>

      {/* MOBILE SHEET */}
      <div className="sheet" id="sheet">
        <div className="sheet-panel">
          <Link href="#geo">{L.nav.geo}</Link>
          <Link href="#features">{L.nav.features}</Link>
          <Link href="#how">{L.nav.howItWorks}</Link>
          <Link href="#pricing">{L.nav.pricing}</Link>
          <Link href="/login">{L.nav.login}</Link>
          <Link href="/login?mode=signup" className="btn btn-primary">{L.nav.getStarted} →</Link>
        </div>
      </div>

      <main id="main-content">
        {/* HERO */}
        <section className="hero">
          <div className="wrap">
            <div style={{ position: 'relative' }}>
              {/* Animated orb decoration */}
              <div className="hero-orb-wrap" aria-hidden="true">
                <div className="orb-core" />
                <div className="orb-ring orb-ring-1"><div className="orb-dot" /></div>
                <div className="orb-ring orb-ring-2" />
                <div className="orb-ring orb-ring-3" />
                <div className="orb-icon orange" style={{ top: '6%', left: '52%', animation: 'float0 3.8s ease-in-out infinite' }}>⚡ 96% {lang === 'de' ? 'Absicht' : 'intent'}</div>
                <div className="orb-icon dark" style={{ top: '22%', right: '2%', animation: 'float1 4.2s ease-in-out infinite .4s' }}>r/SaaS</div>
                <div className="orb-icon green" style={{ top: '46%', right: '-4%', animation: 'float2 3.6s ease-in-out infinite .8s' }}>📈 GEO signal</div>
                <div className="orb-icon" style={{ bottom: '22%', right: '4%', animation: 'float3 4.5s ease-in-out infinite .2s' }}>💬 {lang === 'de' ? 'KI-Entwurf bereit' : 'AI draft ready'}</div>
                <div className="orb-icon orange" style={{ bottom: '8%', left: '44%', animation: 'float4 3.9s ease-in-out infinite .6s' }}>🔥 24h leads</div>
                <div className="orb-icon dark" style={{ top: '38%', left: '6%', animation: 'float5 4.1s ease-in-out infinite 1s' }}>r/Entrepreneur</div>
              </div>

              {/* Hero text */}
              <article style={{ maxWidth: 720, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(229,75,27,.1)', border: '1px solid rgba(229,75,27,.25)', borderRadius: 99, padding: '6px 14px', marginBottom: 28 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--orange)', display: 'inline-block' }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--orange)', fontWeight: 600 }}>
                    {L.hero.badge}
                  </span>
                </div>
                <h1 className="reveal">
                  <span className="lead">{L.hero.line1}</span>
                  <span className="orange-word"><em>{L.hero.line2}</em></span>
                  <span>{L.hero.line3}</span>
                </h1>
                <p className="sub reveal">{L.hero.sub}</p>
                <div className="hero-ctas reveal">
                  <Link href="/login?mode=signup" className="btn btn-orange btn-lg">{L.hero.cta1} <span className="arr">→</span></Link>
                  <Link href="#how" className="btn btn-ghost btn-lg">{L.hero.cta2}</Link>
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
                  <span><b data-count="247">0</b>+ {L.hero.founders}</span>
                  <span>•</span>
                  <span className="star">★★★★★</span> <span>4.9/5</span>
                </div>
              </article>

              <div className="reveal" style={{ marginTop: 72, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--orange)', fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', animation: 'pulse 1.4s ease infinite', display: 'inline-block' }} />
                  {L.hero.liveDemo}
                </div>
                <InteractiveDemo />
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee" aria-hidden="true">
          <div className="label">{L.trusted}</div>
          <div className="marquee-track">
            <span>YC Alumni</span><span>PRODUCT HUNT</span><span>Indie Hackers</span><span>Microconf</span><span>Lumen</span><span>Foundry.</span><span>Helix Labs</span><span>Northwind</span>
            <span>YC Alumni</span><span>PRODUCT HUNT</span><span>Indie Hackers</span><span>Microconf</span><span>Lumen</span><span>Foundry.</span><span>Helix Labs</span><span>Northwind</span>
          </div>
        </div>

        {/* GEO SECTION */}
        <section id="geo" style={{ background: 'var(--ink)', padding: '112px 0', position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden="true" style={{ position: 'absolute', top: '-80px', right: '-80px', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(229,75,27,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div className="wrap">
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 72, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(229,75,27,.15)', border: '1px solid rgba(229,75,27,.3)', borderRadius: 99, padding: '6px 14px', marginBottom: 28 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--orange)', fontWeight: 600 }}>{L.geo.badge}</span>
                </div>
                <h2 className="reveal" style={{ color: 'var(--cream)', maxWidth: '22ch', marginBottom: 24 }}>{L.geo.h2}</h2>
                <p className="reveal" style={{ color: 'rgba(251,246,238,.65)', fontSize: 17, lineHeight: 1.65, maxWidth: '48ch', marginBottom: 40 }}>{L.geo.p}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="reveal">
                  {L.geo.bullets.map((text, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{['🤖','🔍','📈','⚡'][i]}</span>
                      <p style={{ color: 'rgba(251,246,238,.75)', fontSize: 15, lineHeight: 1.55 }}>{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* GEO visual */}
              <div className="reveal" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 18, padding: '28px 24px', position: 'relative' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(251,246,238,.4)', marginBottom: 20 }}>{L.geo.aiLabel}</div>
                <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(251,246,238,.4)', marginBottom: 6 }}>{L.geo.userAsked}</div>
                      <div style={{ fontSize: 14, color: 'rgba(251,246,238,.9)', lineHeight: 1.5 }}>{L.geo.aiQuestion}</div>
                    </div>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(251,246,238,.4)', marginBottom: 10 }}>{L.geo.aiAnswer}</div>
                  <p style={{ fontSize: 13.5, color: 'rgba(251,246,238,.7)', lineHeight: 1.65, marginBottom: 14 }}>
                    {L.geo.aiAnswerText.split('Redgrow')[0]}<strong style={{ color: 'var(--orange)' }}>Redgrow</strong>{L.geo.aiAnswerText.split('Redgrow')[1]}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['r/SaaS · u/jordanm — "Redgrow found us a $4k customer…"', 'r/Entrepreneur · u/priya_s — "Best $9/mo I spend…"', 'r/indiehackers · u/alex_r — "Closed 4 deals in 60 days…"'].map(src => (
                      <div key={src} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--orange)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, marginTop: 3, flexShrink: 0 }}>↳</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'rgba(251,246,238,.45)', lineHeight: 1.4 }}>{src}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.08)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(251,246,238,.3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{L.geo.sources}</div>
                </div>
                <div style={{ marginTop: 18, padding: '12px 16px', borderRadius: 10, background: 'rgba(229,75,27,.12)', border: '1px solid rgba(229,75,27,.25)', fontSize: 13, color: 'rgba(251,246,238,.75)', lineHeight: 1.55 }}>
                  <strong style={{ color: 'var(--orange)' }}>{L.geo.compounding}</strong>{L.geo.compoundingText}
                </div>
              </div>
            </div>

            {/* GEO stats row */}
            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, marginTop: 80, borderTop: '1px solid rgba(255,255,255,.1)' }}>
              {L.geo.stats.map(({ v, sup, label }) => (
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
              <h2>{L.how.h2}</h2>
              <p className="desc">{L.how.p}</p>
            </div>
            <div className="timeline">
              {L.how.steps.map((step, i) => (
                <div key={step.num} className="tl-row reveal">
                  <div className="tl-num">{step.num}<em>.</em></div>
                  <div className="tl-text">
                    <h3>{step.h3}</h3>
                    <p>{step.p}</p>
                    <ul>{step.bullets.map(b => <li key={b}>{b}</li>)}</ul>
                  </div>
                  <div className="tl-mock">
                    {i === 0 && (
                      <>
                        <div className="mock-line"><span>r/SaaS</span><span>47m ago</span></div>
                        <div className="mock-title">Tired of Replymer being so expensive — anyone found a good alternative that actually finds warm leads?</div>
                        <div className="mock-foot"><span>▲ 94 · 17 comments</span><span className="intent">96%</span></div>
                      </>
                    )}
                    {i === 1 && (
                      <>
                        <div className="mock-line"><span>{lang === 'de' ? 'Absicht-Filter' : 'Intent filter'}</span><span style={{ color: 'var(--orange)' }}>{lang === 'de' ? 'aktiv' : 'active'}</span></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: "'JetBrains Mono',monospace", fontSize: '11.5px', color: 'var(--ink-2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>intent_score</span><span style={{ color: 'var(--orange)' }}>≥ 35</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>posted_within</span><span style={{ color: 'var(--orange)' }}>24h</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>source</span><span style={{ color: 'var(--orange)' }}>posts + comments</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>pain_types</span><span style={{ color: 'var(--orange)' }}>5 classified</span></div>
                        </div>
                      </>
                    )}
                    {i === 2 && (
                      <>
                        <div className="mock-line"><span>{lang === 'de' ? 'KI ✦ Entwurf' : 'AI ✦ Draft'}</span><span style={{ color: 'var(--orange)' }}>{lang === 'de' ? 'Empathisch' : 'Empathetic peer'}</span></div>
                        <div className="ln w95"></div><div className="ln w80"></div><div className="ln w70 acc"></div><div className="ln w60"></div>
                        <div className="mock-foot">
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ background: 'var(--green-soft)', color: 'var(--green)', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>⊕ {lang === 'de' ? 'Antwort kopieren' : 'Copy reply'}</span>
                          </span>
                          <span>{lang === 'de' ? 'Selbst in Reddit einfügen →' : 'Paste to Reddit yourself →'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PULL QUOTE 1 */}
        <div className="pq reveal">
          <div className="narrow">
            <div className="marks">&ldquo;</div>
            <blockquote>{L.quote1.text.replace(/^"|"$/g, '').replace(/^"|"$/g, '')}</blockquote>
            <cite>— <b>{L.quote1.cite.split(',')[0]}</b>, {L.quote1.cite.split(', ').slice(1).join(', ')}</cite>
          </div>
        </div>

        {/* FEATURES */}
        <section id="features" className="features-wrap">
          <div className="wrap">
            <div className="section-head reveal">
              <h2>{L.features.h2}</h2>
              <p className="desc">{L.features.p}</p>
            </div>

            {L.features.items.map((feat, fi) => (
              <div key={fi} className={`feature-row ${fi % 2 === 1 ? 'flip' : ''} reveal`}>
                <div className="f-text">
                  <span className="eyebrow">{feat.eyebrow}</span>
                  <h3>{feat.h3}</h3>
                  <p>{feat.p}</p>
                  <ul className="f-list">
                    {feat.bullets.map((b, bi) => (
                      <li key={bi}><span className="nm">.00{bi + 1}</span><span>{b}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="f-mock">
                  {fi === 0 && (
                    <>
                      <div className="mh"><div className="mh-title">/scan · live</div><div className="mh-pill" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>24h only</div></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                          { sub: 'r/SaaS', time: '8m ago', score: 96, type: lang === 'de' ? 'Konkurrenz' : 'Competitor', src: 'post' },
                          { sub: 'r/Entrepreneur', time: '1h ago', score: 88, type: lang === 'de' ? 'Tool-Suche' : 'Tool search', src: 'comment thread' },
                          { sub: 'r/startups', time: '3h ago', score: 81, type: lang === 'de' ? 'Workflow-Problem' : 'Workflow pain', src: 'post' },
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
                    </>
                  )}
                  {fi === 1 && (
                    <>
                      <div className="mh"><div className="mh-title">/replies/compose</div><div className="mh-pill">{lang === 'de' ? 'KI ✦ Entwurf' : 'AI ✦ Draft'}</div></div>
                      <div className="composer">
                        <div className="ctx"><span className="av"></span><span>Replying to u/jordanm in r/SaaS</span></div>
                        <div className="ln w95"></div><div className="ln w80"></div><div className="ln w95 acc"></div><div className="ln w70"></div><div className="ln w60"></div>
                      </div>
                      <div className="composer-foot">
                        <div className="tones">
                          <span className="tone on">{lang === 'de' ? 'Hilfreich' : 'Helpful'}</span>
                          <span className="tone">{lang === 'de' ? 'Locker' : 'Casual'}</span>
                          <span className="tone">{lang === 'de' ? 'Experte' : 'Expert'}</span>
                        </div>
                        <button className="btn btn-orange btn-sm">{lang === 'de' ? 'Kopieren →' : 'Copy →'}</button>
                      </div>
                      <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--green-soft)', border: '1px solid rgba(31,107,63,.2)', borderRadius: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--green)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                        {lang === 'de' ? '✓ Du fügst in Reddit ein · Kein Auto-Post' : '✓ You paste to Reddit · No auto-post'}
                      </div>
                    </>
                  )}
                  {fi === 2 && (
                    <>
                      <div className="mh"><div className="mh-title">/subreddits</div><div className="mh-pill">9 {lang === 'de' ? 'überwacht' : 'monitored'}</div></div>
                      <div className="sr-grid">
                        <div className="sr-tile on"><div className="name">r/SaaS</div><div className="num">348</div><div className="lbl">leads · 7d</div><div className="delta">▲ GEO HIGH</div></div>
                        <div className="sr-tile"><div className="name">r/startups</div><div className="num">212</div><div className="lbl">leads · 7d</div><div className="delta">▲ 14%</div></div>
                        <div className="sr-tile"><div className="name">r/Entrepreneur</div><div className="num">189</div><div className="lbl">leads · 7d</div><div className="delta">▲ 9%</div></div>
                        <div className="sr-tile"><div className="name">r/marketing</div><div className="num">143</div><div className="lbl">leads · 7d</div><div className="delta">▲ 18%</div></div>
                        <div className="sr-tile on"><div className="name">r/indiehackers</div><div className="num">121</div><div className="lbl">leads · 7d</div><div className="delta">▲ GEO HIGH</div></div>
                        <div className="sr-tile"><div className="name">r/smallbiz</div><div className="num">88</div><div className="lbl">leads · 7d</div><div className="delta">▲ 6%</div></div>
                      </div>
                    </>
                  )}
                  {fi === 3 && (
                    <>
                      <div className="mh"><div className="mh-title">/safety</div><div className="mh-pill" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>{lang === 'de' ? 'Alles ok' : 'All clear'}</div></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {L.features.safetyItems.map(item => (
                          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8 }}>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, color: 'var(--ink-3)' }}>{item.label}</span>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, fontWeight: 700, color: 'var(--green)', background: 'var(--green-soft)', padding: '3px 9px', borderRadius: 4 }}>{item.val}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PULL QUOTE 2 */}
        <div className="pq reveal">
          <div className="narrow">
            <div className="marks">&ldquo;</div>
            <blockquote>{L.quote2.text.includes('15 minutes') ? <>{L.quote2.text.split('15 minutes')[0]}<em>15 {lang === 'de' ? 'Minuten' : 'minutes'}</em>{L.quote2.text.split('15 minutes')[1]}</> : L.quote2.text.split('15 Minuten').length > 1 ? <>{L.quote2.text.split('15 Minuten')[0]}<em>15 Minuten</em>{L.quote2.text.split('15 Minuten')[1]}</> : L.quote2.text}</blockquote>
            <cite>— <b>{L.quote2.cite.split(',')[0]}</b>, {L.quote2.cite.split(', ').slice(1).join(', ')}</cite>
          </div>
        </div>

        {/* TESTIMONIALS */}
        <section className="compact">
          <div className="wrap">
            <div className="section-head reveal">
              <h2>{L.testimonials.h2}</h2>
              <p className="desc">{L.testimonials.p}</p>
            </div>
            <div className="testi-grid">
              {L.testimonials.items.map((t, i) => (
                <div key={i} className="testi reveal">
                  <span className="stars">★★★★★</span>
                  <p>{t.text}</p>
                  <div className="who">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.img} alt={t.name} className="av" style={{ objectFit: 'cover' }} />
                    <div><strong>{t.name}</strong><span>{t.role}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="compare-wrap">
          <div className="wrap">
            <div className="section-head reveal">
              <h2>{L.compare.h2}</h2>
              <p className="desc">{L.compare.p}</p>
            </div>
            <div className="compare reveal">
              <div className="col without">
                <div className="head">{L.compare.withoutHead}</div>
                <h3>{L.compare.withoutH3}</h3>
                <ul>
                  {L.compare.withoutItems.map(item => (
                    <li key={item}><span className="mk x">✕</span>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="col with">
                <div className="head">{L.compare.withHead}</div>
                <h3>{L.compare.withH3}</h3>
                <ul>
                  {L.compare.withItems.map(item => (
                    <li key={item}><span className="mk v">✓</span>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={{ padding: '100px 0', background: 'var(--bg)' }}>
          <div className="wrap">
            <div className="section-head reveal" style={{ marginBottom: 56 }}>
              <h2>{L.pricing.h2}</h2>
              <p className="desc">{L.pricing.p}</p>
            </div>
            <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 860, margin: '0 auto' }}>
              {/* Free */}
              <div className="reveal" style={{ borderRadius: 16, border: '1px solid var(--line)', background: 'var(--card)', padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace' }}>{L.pricing.free.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.03em' }}>$0</span>
                    <span style={{ fontSize: 15, color: 'var(--text3)' }}>/mo</span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text3)', lineHeight: 1.55 }}>{L.pricing.free.desc}</p>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                  {L.pricing.free.features.map(f => (
                    <li key={f} style={{ fontSize: 14.5, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 9 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.8"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login?mode=signup" style={{ display: 'block', textAlign: 'center', padding: '11px 0', borderRadius: 10, fontSize: 15, fontWeight: 700, background: 'var(--panel2)', border: '1px solid var(--line2)', color: 'var(--text)', textDecoration: 'none' }}>
                  {L.pricing.free.cta}
                </Link>
              </div>

              {/* Starter */}
              <div className="reveal" style={{ borderRadius: 16, border: '1.5px solid var(--orange)', background: 'var(--card)', padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--orange)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 99, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                  {L.pricing.starter.badge}
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--orange)', fontFamily: 'JetBrains Mono, monospace' }}>{L.pricing.starter.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.03em' }}>$9</span>
                    <span style={{ fontSize: 15, color: 'var(--text3)' }}>/mo</span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text3)', lineHeight: 1.55 }}>{L.pricing.starter.desc}</p>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                  {L.pricing.starter.features.map(f => (
                    <li key={f} style={{ fontSize: 14.5, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 9 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.8"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login?mode=signup" style={{ display: 'block', textAlign: 'center', padding: '11px 0', borderRadius: 10, fontSize: 15, fontWeight: 700, background: 'var(--orange)', color: '#fff', textDecoration: 'none' }}>
                  {L.pricing.starter.cta}
                </Link>
              </div>

              {/* Growth */}
              <div className="reveal" style={{ borderRadius: 16, border: '1px solid var(--line)', background: 'var(--card)', padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace' }}>{L.pricing.growth.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.03em' }}>$19</span>
                    <span style={{ fontSize: 15, color: 'var(--text3)' }}>/mo</span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text3)', lineHeight: 1.55 }}>{L.pricing.growth.desc}</p>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                  {L.pricing.growth.features.map(f => (
                    <li key={f} style={{ fontSize: 14.5, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 9 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.8"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login?mode=signup" style={{ display: 'block', textAlign: 'center', padding: '11px 0', borderRadius: 10, fontSize: 15, fontWeight: 700, background: 'var(--panel2)', border: '1px solid var(--line2)', color: 'var(--text)', textDecoration: 'none' }}>
                  {L.pricing.growth.cta}
                </Link>
              </div>
            </div>

            {/* Guarantee row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 36, flexWrap: 'wrap' }}>
              {L.pricing.guarantees.map(text => (
                <span key={text} style={{ fontSize: 13.5, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {text}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="wrap">
            <div className="section-head reveal">
              <h2>{L.faq.h2}</h2>
              <p className="desc">{L.faq.p}</p>
            </div>
            <FAQAccordion />
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final">
          <div className="wrap">
            <div className="reddit-mark-big" />
            <h2>{L.finalCta.h2.split('. ')[0]}. <em>{L.finalCta.h2.split('. ').slice(1).join('. ')}</em></h2>
            <p>{L.finalCta.p}</p>
            <Link href="/login?mode=signup" className="btn btn-orange btn-lg" style={{ marginTop: '10px' }}>{L.finalCta.cta} <span className="arr">→</span></Link>
            <div className="trust-row">
              {L.finalCta.trust.map((item, i) => (
                <span key={i}>{item}{i < L.finalCta.trust.length - 1 && <><span className="dot"></span></>}</span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <Link href="/" className="logo"><span className="logo-mark"></span>Redgrow</Link>
              <p>{L.footer.tagline}</p>
            </div>
            <div>
              <h5>{L.footer.groups.product}</h5>
              <ul>
                <li><Link href="#features">{L.nav.features}</Link></li>
                <li><Link href="#geo">GEO Guide</Link></li>
                <li><Link href="#pricing">{L.nav.pricing}</Link></li>
              </ul>
            </div>
            <div>
              <h5>{L.footer.groups.guides}</h5>
              <ul>
                <li><Link href="/how-to/find-customers-on-reddit-without-getting-banned">Find customers on Reddit</Link></li>
                <li><Link href="/how-to/promote-saas-on-reddit-organically">Promote SaaS organically</Link></li>
                <li><Link href="/how-to/reply-to-reddit-threads-to-get-signups">Get signups from Reddit</Link></li>
                <li><Link href="/how-to/find-buying-intent-threads-on-reddit">Find buying intent threads</Link></li>
                <li><Link href="/reddit-marketing/why-you-keep-getting-banned-on-reddit">Why you keep getting banned</Link></li>
                <li><Link href="/reddit-marketing/reddit-marketing-without-shadowban">Avoid shadowbans</Link></li>
              </ul>
            </div>
            <div>
              <h5>{L.footer.groups.useCases}</h5>
              <ul>
                <li><Link href="/for/saas-founders">For SaaS founders</Link></li>
                <li><Link href="/for/reddit-lead-generation-for-agencies">For agencies</Link></li>
                <li><Link href="/for/how-to-find-first-100-customers-on-reddit">First 100 customers</Link></li>
                <li><Link href="/for/reddit-comments-into-paying-customers">Turn comments to customers</Link></li>
                <li><Link href="/for/reddit-marketing-strategy-early-stage-startups">Early stage strategy</Link></li>
                <li><Link href="/for/reddit-keyword-monitoring">Keyword monitoring</Link></li>
              </ul>
            </div>
            <div>
              <h5>{L.footer.groups.resources}</h5>
              <ul>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/best/reddit-marketing-tools-for-saas-founders">Best Reddit tools</Link></li>
                <li><Link href="/best/tools-to-find-leads-on-reddit">Lead gen tools</Link></li>
                <li><Link href="/generative-engine/how-to-get-saas-recommended-by-chatgpt">Get recommended by ChatGPT</Link></li>
                <li><Link href="/generative-engine/what-is-geo-and-why-saas-founders-need-it">What is GEO?</Link></li>
              </ul>
            </div>
            <div>
              <h5>{L.footer.groups.compare}</h5>
              <ul>
                <li><Link href="/compare/vs-replymer">vs Replymer</Link></li>
                <li><Link href="/compare/vs-beno">vs Beno</Link></li>
                <li><Link href="/compare/vs-redditgrow">vs RedditGrow</Link></li>
                <li><Link href="/compare/vs-manual">vs Manual</Link></li>
              </ul>
            </div>
            <div>
              <h5>{L.footer.groups.legal}</h5>
              <ul>
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'center' }}>
              <div>{L.footer.copyright}</div>
              <div style={{ fontSize: 11, opacity: .55 }}>{L.footer.disclaimer}</div>
            </div>
          </div>
        </div>
      </footer>

      <LandingScript />
    </div>
  )
}
