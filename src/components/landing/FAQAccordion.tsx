'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Will this get my Reddit account banned?',
    a: "No — safety is built into every action Redgrow takes. It enforces warmup periods before any promotional posting, caps promo replies at 5/day, maintains a 1:3 promo-to-normal comment ratio, and detects shadowbans within hours. Your account stays well within Reddit's limits.",
  },
  {
    q: 'Do I need my own Reddit account?',
    a: "Yes, and that's intentional. Using your own account means replies look authentic — not like they came from a shared proxy. You connect via Reddit's official OAuth in under two minutes. We never see your password.",
  },
  {
    q: 'How is Redgrow different from Replymer or Beno?',
    a: "Redgrow starts at $9/mo (vs Replymer at $99/mo). It uses your own Reddit account instead of shared proxies, classifies buying intent into 5 pain types for smarter replies, and has safety rules built in that protect your account long-term.",
  },
  {
    q: 'What subreddits does it monitor?',
    a: 'Any subreddit you add. After you paste your product URL, Redgrow suggests 20+ relevant communities based on your audience and competitors. You approve the list and can adjust at any time.',
  },
  {
    q: 'Can I edit replies before they post?',
    a: 'Always. Every AI-drafted reply sits in your approval queue. You can edit, regenerate, or skip — nothing posts without your explicit go-ahead.',
  },
  {
    q: 'Is there a free trial?',
    a: "Yes — 14 days free on any plan. No credit card required to start. Cancel anytime, and we'll refund your first payment if you change your mind within 14 days.",
  },
  {
    q: 'How does the account warmup work?',
    a: 'Before your first promotional reply, Redgrow posts 2–3 helpful, non-promotional comments per day to build your account standing. New accounts need 14 days; accounts with existing karma need 7 days.',
  },
  {
    q: 'What happens if a reply gets removed?',
    a: 'Redgrow tracks removal rates per subreddit. Two removals in the same community triggers an automatic blacklist and an alert to you. Your account health dashboard shows the full picture in real time.',
  },
]

export function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <div className="faq-grid" id="faq">
      {faqs.map((faq, i) => (
        <div key={i} className={`faq-item${openIdx === i ? ' open' : ''}`}>
          <button
            className="faq-q"
            onClick={() => {
              const next = openIdx === i ? null : i
              setOpenIdx(next)
              // update max-height manually since we use CSS transition
              const el = document.querySelectorAll('.faq-a')[i] as HTMLElement
              if (el) el.style.maxHeight = next === i ? el.scrollHeight + 'px' : '0'
            }}
          >
            {faq.q}
            <span className="faq-toggle">+</span>
          </button>
          <div
            className="faq-a"
            style={{ maxHeight: openIdx === i ? undefined : 0 }}
            ref={el => {
              if (el && openIdx === i) el.style.maxHeight = el.scrollHeight + 'px'
            }}
          >
            <div className="faq-a-inner">{faq.a}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
