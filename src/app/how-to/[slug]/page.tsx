import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import '../../landing.css'

type Step = { title: string; body: string }
type Page = {
  slug: string
  title: string
  eyebrow: string
  headline: string
  subheadline: string
  problem: { heading: string; body: string[] }
  solution: { heading: string; body: string[] }
  steps: Step[]
  callout: string
  related: { href: string; label: string }[]
  metaDescription: string
}

const pages: Record<string, Page> = {
  'find-customers-on-reddit-without-getting-banned': {
    slug: 'find-customers-on-reddit-without-getting-banned',
    title: 'How to Find Customers on Reddit Without Getting Banned',
    eyebrow: 'Reddit Customer Acquisition',
    headline: 'How to find customers on Reddit without getting banned.',
    subheadline: "Reddit bans accounts that spam. But it rewards accounts that genuinely help. Here's how to stay on the right side of that line.",
    metaDescription: 'Find customers on Reddit without bans. Learn the intent-first approach that gets signups without triggering Reddit spam filters. Free tool inside.',
    problem: {
      heading: "Most Reddit marketing gets you banned because it starts with the product, not the person.",
      body: [
        "You join a subreddit. You post about your SaaS. You get removed. You try again with a subtler pitch. Removed again. You join a thread asking for tool recommendations. You drop your link. Shadowbanned.",
        "The problem isn't Reddit. The problem is the order of operations. You're promoting before you've established that your product actually fits what the person needs. Reddit's community detects this instantly, and the mods remove it.",
        "The accounts that thrive on Reddit do one thing differently: they find the thread first, read the intent carefully, and only respond when their product is a genuinely good answer to the question being asked.",
      ],
    },
    solution: {
      heading: "The fix: find buying-intent threads, then reply with context.",
      body: [
        "Buying intent on Reddit looks like: 'I'm switching from X, what do you use?', 'Anyone know a tool that does Y?', 'Our current solution Z is killing us — what do you use instead?'",
        "These threads already want your answer. You're not interrupting — you're responding. The difference between a banned account and a respected one is whether you're answering the question or pushing a product.",
        "Redgrow scans hundreds of subreddits every hour, scores each thread 0–100 for buying intent, and drafts a reply that leads with empathy before mentioning your product. You paste it yourself — Reddit sees a human, because it is one.",
      ],
    },
    steps: [
      { title: 'Set up your product profile', body: 'Paste your URL. Redgrow scrapes your landing page and builds a product profile: who it helps, what pain it solves, who your competitors are. Takes about 30 seconds.' },
      { title: 'Approve your subreddit watchlist', body: 'Redgrow suggests 20+ relevant communities based on your audience. Add your own, remove ones that don\'t fit. The more specific the subreddit, the higher the conversion rate.' },
      { title: 'Review your daily lead queue', body: 'Each morning (or whenever you want), open Redgrow\'s inbox. You\'ll see threads scored by intent with a draft reply for each. Read the thread, read the draft, decide if it\'s right.' },
      { title: 'Copy, paste, personalise if needed', body: 'Open the thread. Paste the reply. Add a sentence or two that\'s specific to that thread if the draft needs it. Hit post. You\'re done.' },
    ],
    callout: "The accounts that get banned post 10 promotional comments a day. The accounts that grow post 2–3 highly relevant ones. Redgrow enforces this automatically — you can't exceed the safe daily limit even if you want to.",
    related: [
      { href: '/how-to/promote-saas-on-reddit-organically', label: 'How to promote your SaaS on Reddit organically' },
      { href: '/how-to/find-buying-intent-threads-on-reddit', label: 'How to find buying intent threads on Reddit' },
      { href: '/reddit-marketing/why-you-keep-getting-banned-on-reddit', label: 'Why you keep getting banned on Reddit' },
    ],
  },

  'promote-saas-on-reddit-organically': {
    slug: 'promote-saas-on-reddit-organically',
    title: 'How to Promote Your SaaS on Reddit Organically',
    eyebrow: 'Organic Reddit Growth',
    headline: 'How to promote your SaaS on Reddit — without paying, spamming, or getting removed.',
    subheadline: 'Organic Reddit growth is real and repeatable. But it takes a different mindset than every other channel you\'ve used.',
    metaDescription: 'Step-by-step guide to promoting your SaaS on Reddit without ads or bans. Intent-first approach that builds trust and drives signups.',
    problem: {
      heading: "Reddit doesn't respond to marketing. It responds to honesty.",
      body: [
        "Every marketing playbook says 'be on Reddit.' Almost nobody says how. The standard advice is 'be genuine' and 'provide value' — which is true but useless if you don't know what that looks like in practice.",
        "What it actually looks like: someone posts in r/SaaS asking what CRM they should use after getting burned by HubSpot. You've built a lightweight CRM. You reply with a specific, honest answer — what your tool does well, what it doesn't, and why it might fit their situation. You don't hard-sell. You answer the question.",
        "That reply converts at 5–10x the rate of any ad you'll run. And it keeps working — old Reddit threads get traffic for years, and AI search engines cite them daily.",
      ],
    },
    solution: {
      heading: "Organic Reddit growth has three ingredients: the right thread, the right timing, and the right tone.",
      body: [
        "Right thread means high buying intent — someone actively looking for a solution like yours. Right timing means responding while the thread is still active (within 24 hours of posting). Right tone means matching the register of the subreddit — r/entrepreneur is different from r/devops is different from r/smallbusiness.",
        "Getting all three right manually takes 2–3 hours a day of Reddit reading. Redgrow does the first two automatically — it finds the right threads and only shows you the fresh ones. You control the tone when you paste the reply.",
      ],
    },
    steps: [
      { title: 'Map your audience to subreddits', body: 'Start with 5–10 subreddits where your ideal customer would ask for help. r/SaaS, r/entrepreneur, r/startups are obvious. Then go deeper — what specific problem does your product solve? Find the subreddits for that problem.' },
      { title: 'Monitor for buying signals, not just mentions', body: "Keywords like 'alternative to X', 'frustrated with Y', 'recommend a tool for Z' are buying signals. Set up monitoring for these — or let Redgrow do it automatically across all your subreddits at once." },
      { title: 'Reply with a specific, honest answer', body: "Lead with understanding their situation. Briefly mention what your tool does. Link to a relevant page. Don't pitch — answer. The best Reddit replies read like advice from a knowledgeable friend, not a sales email." },
      { title: 'Keep your ratio healthy', body: "For every promotional reply, post 2–3 genuinely helpful ones with no mention of your product. This builds your account reputation and keeps mods from flagging you. Redgrow tracks this automatically." },
    ],
    callout: "The best organic Reddit strategy isn't a growth hack — it's showing up consistently in the right conversations. One good reply a day, five days a week, in the right subreddits. That compounds.",
    related: [
      { href: '/how-to/find-customers-on-reddit-without-getting-banned', label: 'How to find customers on Reddit without getting banned' },
      { href: '/how-to/reply-to-reddit-threads-to-get-signups', label: 'How to reply to Reddit threads to get signups' },
      { href: '/for/reddit-marketing-strategy-early-stage-startups', label: 'Reddit marketing strategy for early-stage startups' },
    ],
  },

  'reply-to-reddit-threads-to-get-signups': {
    slug: 'reply-to-reddit-threads-to-get-signups',
    title: 'How to Reply to Reddit Threads to Get Signups',
    eyebrow: 'Reddit Reply Strategy',
    headline: 'How to reply to Reddit threads that turn readers into signups.',
    subheadline: "Most Reddit replies either get ignored or get you banned. Here's the structure that does neither.",
    metaDescription: 'Write Reddit replies that convert readers into signups. Learn the empathy-first framework that gets upvotes and drives traffic to your SaaS.',
    problem: {
      heading: "The average promotional Reddit reply fails in the first sentence.",
      body: [
        "You know the type. 'Hey, I built something that might help — check out [link].' Or worse: 'Have you tried [Product]? It does exactly this.' These replies get downvoted, reported, or just ignored. Even when your product is the perfect fit.",
        "The reason is simple: Reddit readers are smart and they can smell a pitch from the first word. If your reply starts with your product, they've already stopped reading.",
        "The replies that convert look completely different. They start by proving you understand the situation. They offer something genuinely useful. They mention the product almost as an afterthought — 'this is actually the problem I built [X] to solve.'",
      ],
    },
    solution: {
      heading: "The Empathy-First framework: understand, then offer, then mention.",
      body: [
        "Structure every reply in three parts. First: show you've read the thread and understand the specific situation (not just the topic — the specific situation this person is in). Second: give them something useful — an observation, a framework, a specific suggestion — that helps them even if they never click your link. Third: mention your product as one option, briefly and honestly, with its limitations acknowledged.",
        "This structure works because it reverses the trust order. You earn trust first by being helpful, then you mention your product to a reader who already trusts you.",
      ],
    },
    steps: [
      { title: 'Read the whole thread before you reply', body: "Don't just read the title. Read the post, read the top comments, understand what the person actually needs. A lazy reply to a surface reading gets ignored. A specific reply that references something in the body of the post gets upvoted." },
      { title: 'Open with their situation, not yours', body: "Mirror back the core of their problem in your first sentence. 'The frustrating thing about [X] is that it works fine until you hit [specific threshold]' — something like that. It signals you\'ve actually read what they wrote." },
      { title: 'Give value before you ask for anything', body: "Suggest a framework, share a relevant experience, point them to a free resource. Give them something useful before you mention your product. This is what makes the difference between a reply that converts and one that gets removed." },
      { title: 'Mention your product in one sentence, with a caveat', body: "One sentence. What it does. Who it\'s for. One honest limitation. A link. That\'s it. Anything more and you\'ve crossed into pitch territory." },
    ],
    callout: "Redgrow drafts replies using this exact framework — classify the pain type first, lead with empathy, then introduce the product contextually. You can edit every word before you post.",
    related: [
      { href: '/how-to/find-buying-intent-threads-on-reddit', label: 'How to find buying intent threads on Reddit' },
      { href: '/for/reddit-comments-into-paying-customers', label: 'How to turn Reddit comments into paying customers' },
      { href: '/reddit-marketing/reddit-marketing-without-shadowban', label: 'Reddit marketing without getting shadowbanned' },
    ],
  },

  'find-buying-intent-threads-on-reddit': {
    slug: 'find-buying-intent-threads-on-reddit',
    title: 'How to Find Buying Intent Threads on Reddit',
    eyebrow: 'Intent Detection',
    headline: 'How to find Reddit threads where someone is ready to buy.',
    subheadline: 'Not every Reddit post is a lead. Here\'s how to tell the difference between venting, learning, and buying.',
    metaDescription: 'Learn to identify buying intent signals on Reddit. The 5 thread types that predict purchase intent — and how to find them automatically.',
    problem: {
      heading: "Most Reddit posts are not leads. Treating them all the same wastes your time.",
      body: [
        "There are five types of Reddit posts that look like leads but aren't: people venting about a problem with no intention to change tools, people researching out of curiosity, people asking for free alternatives, people writing posts that are actually just links to their own content, and people who solved the problem last week and are now just sharing.",
        "Then there are the posts that are actually leads: someone actively switching tools, someone asking for a recommendation in your category, someone frustrated with a competitor you're better than, someone at a decision point.",
        "The signal is in the language. 'Anyone know a tool that does X' is a buying signal. 'Thoughts on using X for Y' usually isn't. Learning to read this quickly is the core skill of Reddit marketing.",
      ],
    },
    solution: {
      heading: "Five phrases that predict buying intent on Reddit.",
      body: [
        "These patterns appear in almost every high-intent Reddit thread: 'alternative to [competitor]', 'switching from [X]', 'looking for a tool that', 'frustrated with [X]', 'does anyone use [product category]'. Each signals active need — not passive curiosity.",
        "You can search Reddit manually for these patterns. Or you can let Redgrow run this search automatically across 20+ subreddits every hour, score each match 0–100 based on context, and only show you the threads above your threshold.",
      ],
    },
    steps: [
      { title: 'Start with competitor mention monitoring', body: "The highest-intent threads are the ones where someone mentions a competitor negatively. 'I've been using [X] but it's too expensive / slow / limited' is as warm as a lead gets. Set up monitoring for every competitor you have." },
      { title: 'Watch for active search language', body: "'Looking for', 'need a tool that', 'recommend something for', 'can anyone suggest' — these are active search phrases. Someone who uses these words is at the decision stage, not the awareness stage." },
      { title: 'Filter by recency', body: "A thread from 3 months ago is dead. The person already made a decision. Only threads from the last 24–48 hours are worth your time. Fresh threads are still warm — the person is still actively thinking about this." },
      { title: 'Score by context, not just keywords', body: "A keyword match isn't enough. You need to understand if the context around the keyword is a buying signal. 'Alternative to Excel' in a data science subreddit is different from the same phrase in a thread about household budget spreadsheets. Context is everything." },
    ],
    callout: "Redgrow's intent scoring engine classifies every matched thread into one of 5 pain types: competitor frustration, switching intent, active tool search, ROI frustration, or workflow pain. Each type gets a different reply strategy.",
    related: [
      { href: '/best/tools-to-find-leads-on-reddit', label: 'Best tools to find leads on Reddit' },
      { href: '/best/reddit-monitoring-tool-for-startups', label: 'Best Reddit monitoring tools for startups' },
      { href: '/how-to/find-customers-on-reddit-without-getting-banned', label: 'How to find customers on Reddit without getting banned' },
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(pages).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = pages[params.slug]
  if (!p) return {}
  return {
    title: `${p.title} | Redgrow`,
    description: p.metaDescription,
    alternates: { canonical: `https://redgrow.app/how-to/${p.slug}` },
    openGraph: {
      title: p.title,
      description: p.metaDescription,
      url: `https://redgrow.app/how-to/${p.slug}`,
      images: [{ url: 'https://redgrow.app/og-image.png', width: 1200, height: 628 }],
    },
  }
}

export default function HowToPage({ params }: { params: { slug: string } }) {
  const p = pages[params.slug]
  if (!p) notFound()

  return (
    <div className="lp">
      <nav className="nav" style={{ position: 'relative', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap nav-row">
          <Link href="/" className="logo"><span className="logo-mark" /><span>Redgrow</span></Link>
          <div className="nav-links">
            <Link href="/#features">Features</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <div className="nav-cta">
            <Link href="/login" className="login">Login</Link>
            <Link href="/login?mode=signup" className="btn btn-primary btn-sm">Get started <span className="arr">→</span></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: '72px', paddingBottom: '64px' }}>
        <div className="narrow">
          <Link href="/blog" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--orange)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '28px' }}>← All guides</Link>
          <div className="section-num"><span><strong>How-to</strong> — {p.eyebrow}</span></div>
          <h1 style={{ fontSize: 'clamp(30px,4.2vw,56px)', marginTop: '14px', letterSpacing: '-.03em' }}>{p.headline}</h1>
          <p style={{ fontSize: '19px', marginTop: '22px', borderTop: '1px solid var(--line)', paddingTop: '22px', maxWidth: '52ch', color: 'var(--ink-2)', lineHeight: 1.6 }}>{p.subheadline}</p>
          <div style={{ marginTop: '28px' }}>
            <Link href="/login?mode=signup" className="btn btn-orange">Try Redgrow free <span className="arr">→</span></Link>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ paddingTop: '64px', paddingBottom: '64px', background: 'var(--paper)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="narrow">
          <div className="eyebrow" style={{ marginBottom: '12px' }}>The problem</div>
          <h2 style={{ fontSize: 'clamp(26px,3.2vw,42px)', letterSpacing: '-.025em', maxWidth: '22ch' }}>{p.problem.heading}</h2>
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '56ch' }}>
            {p.problem.body.map((para, i) => (
              <p key={i} style={{ fontSize: '16.5px', color: 'var(--ink-2)', lineHeight: 1.65 }}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section style={{ paddingTop: '64px', paddingBottom: '64px' }}>
        <div className="narrow">
          <div className="eyebrow" style={{ marginBottom: '12px' }}>The solution</div>
          <h2 style={{ fontSize: 'clamp(26px,3.2vw,42px)', letterSpacing: '-.025em', maxWidth: '24ch' }}>{p.solution.heading}</h2>
          <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '56ch' }}>
            {p.solution.body.map((para, i) => (
              <p key={i} style={{ fontSize: '16.5px', color: 'var(--ink-2)', lineHeight: 1.65 }}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ paddingTop: '64px', paddingBottom: '64px', background: 'var(--paper)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="narrow">
          <div className="eyebrow" style={{ marginBottom: '12px' }}>How it works</div>
          <h2 style={{ fontSize: 'clamp(26px,3.2vw,40px)', letterSpacing: '-.025em' }}>Step by step.</h2>
          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column' }}>
            {p.steps.map((step, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: '24px', paddingTop: '28px', paddingBottom: '28px', borderTop: '1px solid var(--line)' }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '28px', fontWeight: 700, color: 'var(--orange)', lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-.01em', marginBottom: '8px' }}>{step.title}</h3>
                  <p style={{ fontSize: '16px', color: 'var(--ink-2)', lineHeight: 1.65 }}>{step.body}</p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--line)' }} />
          </div>
        </div>
      </section>

      {/* CALLOUT */}
      <section style={{ paddingTop: '56px', paddingBottom: '56px' }}>
        <div className="narrow">
          <div style={{ padding: '32px 36px', background: 'var(--ink)', borderRadius: 'var(--r-lg)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(229,75,27,.18), transparent 60%)', pointerEvents: 'none' }} />
            <p style={{ fontSize: '17px', color: 'rgba(251,246,238,.85)', lineHeight: 1.65, maxWidth: '52ch', position: 'relative', zIndex: 1 }}>{p.callout}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingTop: '56px', paddingBottom: '80px', background: 'var(--cream-2)', borderTop: '1px solid var(--line)' }}>
        <div className="narrow" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px,3.6vw,48px)', letterSpacing: '-.025em', maxWidth: '20ch', margin: '0 auto' }}>
            Ready to find warm Reddit leads every day?
          </h2>
          <p style={{ marginTop: '16px', fontSize: '17px', color: 'var(--ink-2)', maxWidth: '44ch', margin: '16px auto 0' }}>
            Free plan available. No credit card. Set up takes five minutes.
          </p>
          <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login?mode=signup" className="btn btn-orange btn-lg">Start free <span className="arr">→</span></Link>
            <Link href="/" className="btn btn-ghost btn-lg">See how it works</Link>
          </div>
        </div>
      </section>

      {/* RELATED */}
      {p.related.length > 0 && (
        <section style={{ paddingTop: '48px', paddingBottom: '64px', borderTop: '1px solid var(--line)' }}>
          <div className="narrow">
            <div className="eyebrow" style={{ marginBottom: '20px' }}>Related guides</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {p.related.map(r => (
                <Link key={r.href} href={r.href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--line)', fontSize: '15.5px', color: 'var(--ink)', fontWeight: 500 }}>
                  {r.label}
                  <span style={{ color: 'var(--orange)', flexShrink: 0, marginLeft: 16 }}>→</span>
                </Link>
              ))}
              <div style={{ borderTop: '1px solid var(--line)' }} />
            </div>
          </div>
        </section>
      )}

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
