import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import '../../landing.css'

type Page = {
  slug: string
  title: string
  eyebrow: string
  headline: string
  subheadline: string
  sections: { eyebrow: string; heading: string; body: string[] }[]
  tactics: { title: string; body: string }[]
  callout: string
  related: { href: string; label: string }[]
  metaDescription: string
}

const pages: Record<string, Page> = {
  'how-to-get-saas-recommended-by-chatgpt': {
    slug: 'how-to-get-saas-recommended-by-chatgpt',
    title: 'How to Get Your SaaS Recommended by ChatGPT',
    eyebrow: 'AI Visibility',
    headline: 'How to get your SaaS recommended by ChatGPT.',
    subheadline: 'ChatGPT doesn\'t browse the web in real time. But it was trained on it — and Reddit is one of the highest-weighted sources.',
    metaDescription: 'Get your SaaS cited by ChatGPT. How Reddit replies become AI training data and why posting on Reddit today gets you recommended tomorrow.',
    sections: [
      {
        eyebrow: 'How ChatGPT learns about products',
        heading: 'ChatGPT\'s recommendations come from what it was trained on.',
        body: [
          "When someone asks ChatGPT 'what\'s the best tool for X?', it draws on its training data — not live search results. That training data is heavily weighted toward Reddit, because Reddit has millions of genuine, firsthand product recommendations from real users.",
          "A Reddit comment from 2023 saying 'I switched to [Tool] for X and it solved my problem' is exactly the kind of signal that gets encoded into model weights. That's why your Reddit presence today affects your AI recommendations tomorrow.",
          "This isn't theoretical. Products with strong Reddit presence — even small ones — consistently appear in ChatGPT tool recommendations. Products with no Reddit history rarely do.",
        ],
      },
      {
        eyebrow: 'What actually gets cited',
        heading: 'Not all Reddit content is created equal for AI training.',
        body: [
          "High-upvote comments in relevant subreddits carry the most weight. A comment with 50 upvotes saying 'I use [Tool] for this exact workflow and it\'s great' is a strong positive signal.",
          "Specificity matters. 'Redgrow is good' doesn't train much. 'I was paying $99/mo for Replymer and switched to Redgrow — got leads in the first week for $9' is specific enough to become a data point.",
          "Thread context matters too. A recommendation in a thread where someone is actively searching for a tool solution is weighted differently from a mention in a general discussion thread.",
        ],
      },
    ],
    tactics: [
      { title: 'Reply to threads in your exact category', body: 'When someone asks \'what tool do you use for X\', that is a training opportunity. A helpful, specific reply that demonstrates your product solves their exact problem gets upvoted and becomes a data point.' },
      { title: 'Make your replies genuinely helpful, not just promotional', body: 'AI models learn to trust sources that give good advice, not just sources that promote things. A reply that helps even if the person doesn\'t use your product is more likely to be cited than a pure promotional comment.' },
      { title: 'Be consistent across subreddits', body: "One reply in one subreddit doesn't do much. Ten specific, helpful replies across r/SaaS, r/entrepreneur, r/startups, and category-specific subreddits over three months builds a corpus of data that AI models can learn from." },
      { title: 'Use your product name consistently', body: "Always use the same product name. 'Redgrow' not 'redgrow' not 'Redgrow.app'. Models need consistent naming to associate recommendations with a specific product." },
      { title: 'Answer the questions that get asked repeatedly', body: "Find the recurring questions in your niche subreddits — the ones that get asked every few weeks. Write definitive answers to these. These threads accumulate upvotes over time and become high-weight training sources." },
    ],
    callout: "Redgrow's GEO scoring shows you which threads have the highest probability of being cited in AI search answers. These are threads in high-authority subreddits, with active comment sections, on topics that AI models frequently answer questions about.",
    related: [
      { href: '/generative-engine/how-to-appear-in-perplexity-ai-search', label: 'How to appear in Perplexity AI search results' },
      { href: '/generative-engine/what-is-geo-and-why-saas-founders-need-it', label: 'What is GEO and why SaaS founders need it' },
      { href: '/how-to/reply-to-reddit-threads-to-get-signups', label: 'How to write Reddit replies that convert' },
    ],
  },

  'how-to-appear-in-perplexity-ai-search': {
    slug: 'how-to-appear-in-perplexity-ai-search',
    title: 'How to Appear in Perplexity AI Search Results',
    eyebrow: 'AI Search Visibility',
    headline: 'How to appear in Perplexity AI search results for your category.',
    subheadline: "Perplexity cites sources in real time. Reddit is one of its most-cited sources. Here's how to get in the citation chain.",
    metaDescription: 'Get your SaaS cited in Perplexity AI results. How Perplexity sources answers and why Reddit replies drive AI search visibility.',
    sections: [
      {
        eyebrow: 'How Perplexity works',
        heading: 'Perplexity searches the live web and cites sources. Reddit is a primary one.',
        body: [
          "Unlike ChatGPT, Perplexity performs live web searches and shows the sources it used. When someone searches 'best tool for Reddit marketing', Perplexity crawls Reddit, forum posts, review sites, and blog articles — and synthesises the answer from those sources.",
          "Reddit threads rank high in Perplexity results because they contain genuine user opinions and specific product mentions. A Reddit thread where three people recommend your product in the comments is a strong Perplexity source.",
          "You can test this yourself: search for your category in Perplexity and look at the cited sources. Reddit threads will often be in the top five.",
        ],
      },
      {
        eyebrow: 'The mechanics',
        heading: 'Fresh, specific, upvoted Reddit content gets cited by Perplexity.',
        body: [
          "Perplexity weights its sources by freshness and engagement. A Reddit thread from last month with 40 comments and 100 upvotes outperforms a thread from two years ago with 5 comments.",
          "This means your Reddit strategy has a compounding effect on Perplexity visibility. Every relevant reply you post this month is a potential citation in Perplexity results next month.",
          "The types of content that get cited most: direct answers to 'what tool should I use for X' questions, comparisons ('I've tried X and Y, here's what I found'), and specific use case descriptions ('I use [Tool] for [specific workflow]').",
        ],
      },
    ],
    tactics: [
      { title: "Target threads that match Perplexity search queries", body: "Think about what someone would ask Perplexity about your category. 'Best Reddit marketing tool for SaaS', 'How to find leads on Reddit without getting banned' — these are real queries. Find threads that match these questions and reply helpfully in them." },
      { title: 'Write replies that read like cited sources', body: "Perplexity quotes text from sources. Write replies in a way that would make sense as a citation: 'For Reddit outreach specifically, [Product] works well because it scores intent automatically and never touches your account.' Specific, quotable sentences." },
      { title: 'Keep your Reddit profile active', body: "Perplexity follows links to Reddit profiles. An active profile with history in relevant subreddits adds credibility to your comments. A brand new account with one reply looks like spam." },
      { title: 'Cover the full question funnel', body: "Don't just reply to 'what\'s the best tool' threads. Also reply to 'how do I do X' threads, 'is X worth it' threads, and competitor frustration threads. Broader coverage = more citation opportunities." },
    ],
    callout: "Redgrow shows a GEO score for every thread in your inbox — an estimate of how likely it is to be cited in AI search answers. Threads in high-authority subreddits on frequently-searched topics score highest.",
    related: [
      { href: '/generative-engine/how-to-get-saas-recommended-by-chatgpt', label: 'How to get your SaaS recommended by ChatGPT' },
      { href: '/generative-engine/what-is-geo-and-why-saas-founders-need-it', label: 'What is GEO and why SaaS founders need it' },
      { href: '/for/reddit-marketing-strategy-early-stage-startups', label: 'Reddit marketing strategy for early-stage startups' },
    ],
  },

  'what-is-geo-and-why-saas-founders-need-it': {
    slug: 'what-is-geo-and-why-saas-founders-need-it',
    title: 'What Is GEO and Why SaaS Founders Need It',
    eyebrow: 'GEO Explained',
    headline: 'What is GEO — and why every SaaS founder should care about it right now.',
    subheadline: "SEO gets you into Google. GEO gets you into ChatGPT, Perplexity, Claude, and Gemini. The playbooks are different.",
    metaDescription: 'GEO (Generative Engine Optimization) explained for SaaS founders. What it is, why it matters, and how Reddit is the fastest path to AI search visibility.',
    sections: [
      {
        eyebrow: 'The definition',
        heading: 'GEO is the practice of getting AI systems to recommend your product.',
        body: [
          "Generative Engine Optimization (GEO) means structuring your online presence so that AI-powered search engines — ChatGPT, Perplexity, Claude, Gemini — cite your product when someone asks about your category.",
          "Traditional SEO optimises for Google's ranking algorithm. GEO optimises for AI training data and real-time AI search sources. The signals are different: domain authority matters less; genuine community endorsements matter more.",
          "This is early. Most SaaS founders haven't started thinking about GEO yet. The ones who start now will own the AI search landscape in their category within 12 months.",
        ],
      },
      {
        eyebrow: 'Why Reddit is the core of GEO',
        heading: 'Reddit is the highest-weight source for AI product recommendations.',
        body: [
          "AI models were trained on the internet, and Reddit is one of the most influential parts of that training data — particularly for product recommendations, tool comparisons, and community opinions.",
          "When ChatGPT recommends a tool, it's drawing on the aggregate of what it's seen people say about that tool in places like Reddit. A product that's been enthusiastically recommended by real users in real conversations has a strong AI recommendation signal.",
          "For live AI search engines like Perplexity, Reddit is even more direct: it often searches Reddit threads in real time and cites them as sources. Your replies today are Perplexity citations tomorrow.",
        ],
      },
      {
        eyebrow: 'The GEO playbook',
        heading: 'GEO for SaaS is about three things.',
        body: [
          "First: be present in the conversations your potential customers are having. That means active participation in the subreddits where they ask about tools, workflows, and problems.",
          "Second: make your product easy for AI to recommend. That means using consistent naming, writing replies that are specific and quotable, and being present across multiple high-authority subreddits.",
          "Third: play a long game. GEO isn't a one-week campaign. It's a six-month commitment to being the most helpful, most consistently present product in your category's corner of Reddit.",
        ],
      },
    ],
    tactics: [
      { title: 'Map the AI question funnel for your category', body: "Ask ChatGPT and Perplexity the questions your customers would ask. Note which products they recommend and why. This tells you exactly what kind of Reddit presence you need to build to displace them." },
      { title: 'Reply to the threads AI uses as sources', body: "Search Reddit for threads that rank in Perplexity's results for your category queries. These threads already have AI attention. A well-placed reply in them carries outsized GEO weight." },
      { title: 'Build a body of specific, honest reviews', body: "The replies that get cited aren't 'check out my product'. They're 'I use this for X, here's how it works, here's what it doesn't do well'. Honest, specific reviews build the kind of trust that AI models encode as recommendations." },
      { title: 'Measure your AI presence monthly', body: "Ask ChatGPT and Perplexity about your category every month. Track whether your product appears, what context it appears in, and what the sentiment is. Use this to refine your Reddit strategy." },
    ],
    callout: "Redgrow's GEO view shows you the AI citation potential of every subreddit you're monitoring — how frequently it's cited by Perplexity, how often AI models reference threads from it, and which thread types get cited most often.",
    related: [
      { href: '/generative-engine/how-to-get-saas-recommended-by-chatgpt', label: 'How to get your SaaS recommended by ChatGPT' },
      { href: '/generative-engine/how-to-appear-in-perplexity-ai-search', label: 'How to appear in Perplexity AI search results' },
      { href: '/for/reddit-marketing-strategy-early-stage-startups', label: 'Reddit marketing strategy for early-stage startups' },
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
    alternates: { canonical: `https://redgrow.app/generative-engine/${p.slug}` },
    openGraph: {
      title: p.title,
      description: p.metaDescription,
      url: `https://redgrow.app/generative-engine/${p.slug}`,
      images: [{ url: 'https://redgrow.app/og-image.png', width: 1200, height: 628 }],
    },
  }
}

export default function GEOPage({ params }: { params: { slug: string } }) {
  const p = pages[params.slug]
  if (!p) notFound()

  return (
    <div className="lp">
      <nav className="nav" style={{ position: 'relative', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap nav-row">
          <Link href="/" className="logo"><span className="logo-mark" /><span>Redgrow</span></Link>
          <div className="nav-links">
            <Link href="/#geo">GEO feature</Link>
            <Link href="/#features">Features</Link>
            <Link href="/#pricing">Pricing</Link>
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
          <div className="section-num"><span><strong>GEO</strong> — {p.eyebrow}</span></div>
          <h1 style={{ fontSize: 'clamp(30px,4.2vw,56px)', marginTop: '14px', letterSpacing: '-.03em' }}>{p.headline}</h1>
          <p style={{ fontSize: '19px', marginTop: '22px', borderTop: '1px solid var(--line)', paddingTop: '22px', maxWidth: '52ch', color: 'var(--ink-2)', lineHeight: 1.6 }}>{p.subheadline}</p>
          <div style={{ marginTop: '28px' }}>
            <Link href="/login?mode=signup" className="btn btn-orange">See Redgrow's GEO features <span className="arr">→</span></Link>
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      {p.sections.map((section, i) => (
        <section key={i} style={{ paddingTop: '56px', paddingBottom: '56px', background: i % 2 === 0 ? 'var(--paper)' : undefined, borderTop: '1px solid var(--line)', ...(i % 2 === 0 ? { borderBottom: '1px solid var(--line)' } : {}) }}>
          <div className="narrow">
            <div className="eyebrow" style={{ marginBottom: '12px' }}>{section.eyebrow}</div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', letterSpacing: '-.025em', maxWidth: '26ch' }}>{section.heading}</h2>
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '56ch' }}>
              {section.body.map((para, j) => (
                <p key={j} style={{ fontSize: '16.5px', color: 'var(--ink-2)', lineHeight: 1.65 }}>{para}</p>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* TACTICS */}
      <section style={{ paddingTop: '56px', paddingBottom: '64px', borderTop: '1px solid var(--line)' }}>
        <div className="narrow">
          <div className="eyebrow" style={{ marginBottom: '12px' }}>Tactics</div>
          <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', letterSpacing: '-.025em' }}>What to actually do.</h2>
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column' }}>
            {p.tactics.map((t, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '20px', paddingTop: '24px', paddingBottom: '24px', borderTop: '1px solid var(--line)' }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '24px', fontWeight: 700, color: 'var(--orange)', lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-.01em', marginBottom: '8px' }}>{t.title}</h3>
                  <p style={{ fontSize: '15.5px', color: 'var(--ink-2)', lineHeight: 1.65, margin: 0 }}>{t.body}</p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--line)' }} />
          </div>
        </div>
      </section>

      {/* CALLOUT + CTA */}
      <section style={{ paddingTop: '56px', paddingBottom: '80px', background: 'var(--ink)', borderTop: '1px solid var(--line)' }}>
        <div className="narrow">
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(229,75,27,.15), transparent 60%)', pointerEvents: 'none' }} />
            <p style={{ fontSize: '17px', color: 'rgba(251,246,238,.8)', lineHeight: 1.65, maxWidth: '54ch', position: 'relative', zIndex: 1 }}>{p.callout}</p>
            <div style={{ marginTop: '28px', position: 'relative', zIndex: 1 }}>
              <Link href="/login?mode=signup" className="btn btn-orange btn-lg">Start building GEO presence <span className="arr">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section style={{ paddingTop: '48px', paddingBottom: '64px' }}>
        <div className="narrow">
          <div className="eyebrow" style={{ marginBottom: '20px' }}>Related</div>
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
