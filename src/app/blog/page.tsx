import type { Metadata } from 'next'
import Link from 'next/link'
import './blog.css'

export const metadata: Metadata = {
  title: 'Blog — Redgrow | Reddit Marketing Guides & Strategies',
  description: 'Learn how to find high-intent leads on Reddit, warm up accounts safely, and build a sustainable Reddit outreach strategy.',
}

const posts = [
  {
    slug: 'reddit-marketing-guide',
    title: 'The Complete Reddit Marketing Guide for SaaS Founders (2026)',
    desc: 'How to find your buyers on Reddit without getting banned — a step-by-step playbook covering intent scoring, subreddit selection, and safe posting.',
    tag: 'Guide',
    tagBg: '#FFF0EB',
    tagColor: '#9c2f0d',
    date: 'May 2026',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80',
  },
  {
    slug: 'intent-scoring',
    title: 'What is Intent Scoring and Why Keyword Matching is Dead',
    desc: 'Why "mentioned your keyword" is the worst way to find leads on Reddit — and what the 5-pain-type model actually catches.',
    tag: 'Deep Dive',
    tagBg: '#E8F0FE',
    tagColor: '#1a56db',
    date: 'May 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  },
  {
    slug: 'account-warmup',
    title: 'How to Warm Up a Reddit Account Without Getting Banned',
    desc: 'The exact warmup sequence we use before any promotional posting — and why skipping it gets accounts flagged within days.',
    tag: 'Safety',
    tagBg: '#ECFDF5',
    tagColor: '#065f46',
    date: 'April 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80',
  },
  {
    slug: 'subreddit-discovery',
    title: 'The 20 Best Subreddits for SaaS Founders to Find Buyers',
    desc: 'A ranked list of the highest-converting subreddits for B2B software, with intent patterns for each one.',
    tag: 'Research',
    tagBg: '#F3F4F6',
    tagColor: '#374151',
    date: 'April 2026',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  },
  {
    slug: 'replymer-vs-redgrow',
    title: "Replymer vs Redgrow: A Founder's Honest Comparison",
    desc: "We compared every feature, pricing tier, and safety approach. Here's what we found.",
    tag: 'Comparison',
    tagBg: '#FEF2F2',
    tagColor: '#991b1b',
    date: 'March 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
  },
  {
    slug: 'reddit-reply-framework',
    title: 'The Empathy-First Reply Framework That Gets Upvotes',
    desc: 'Why the best Reddit replies start with the problem, not the product — and how to structure them every time.',
    tag: 'Tactics',
    tagBg: '#FFF0EB',
    tagColor: '#9c2f0d',
    date: 'March 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
  },
]

export default function BlogPage() {
  return (
    <div className="blog-page">
      <nav className="blog-nav">
        <div className="blog-nav-inner">
          <Link href="/" className="blog-logo">
            <span className="blog-logo-mark"></span>
            <span>Redgrow</span>
          </Link>
          <ul className="blog-nav-links">
            <li><Link href="/#features">Features</Link></li>
            <li><Link href="/#how">How it works</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
          <div className="blog-nav-cta">
            <Link href="/login" className="blog-nav-login">Login</Link>
            <Link href="/login" className="blog-btn">Get started →</Link>
          </div>
        </div>
      </nav>

      <section className="blog-hero">
        <h1>The Reddit <span>Marketing</span> Blog</h1>
        <p>Tactics, research, and honest writing about what actually works when growing a SaaS on Reddit. No fluff.</p>
      </section>

      <div className="blog-grid-wrap">
        <div className="blog-grid">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
              <img
                src={post.image}
                alt={post.title}
                className="blog-card-img"
              />
              <div className="blog-card-body">
                <div className="blog-card-meta">
                  <span
                    className="blog-tag"
                    style={{ background: post.tagBg, color: post.tagColor }}
                  >
                    {post.tag}
                  </span>
                  <span className="blog-date">{post.date}</span>
                </div>
                <h2>{post.title}</h2>
                <p>{post.desc}</p>
                <div className="blog-card-footer">
                  <span className="blog-read-time">{post.readTime}</span>
                  <span className="blog-read-link">Read more →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="blog-footer">
        <div className="blog-footer-inner">
          <span className="blog-footer-copy">© 2026 Redgrow · All rights reserved</span>
          <div className="blog-footer-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/compare/vs-replymer">vs Replymer</Link>
            <Link href="/compare/vs-beno">vs Beno</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
