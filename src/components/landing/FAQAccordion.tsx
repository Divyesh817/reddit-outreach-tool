'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Does this involve any automation or bots on Reddit?',
    a: "None, ever. Redgrow never touches your Reddit account. There's no OAuth, no API access, no password. The AI finds threads and drafts replies — you copy the text, open the thread yourself, and paste it. Reddit sees a human typing a reply, because it is one.",
  },
  {
    q: 'Can I get banned for using Redgrow?',
    a: "No — there's nothing to ban. Redgrow has zero access to your Reddit account. It only monitors public threads and generates text. You paste replies manually, the same way you'd write them yourself. That's fully within Reddit's ToS by design.",
  },
  {
    q: 'How is Redgrow different from Replymer or Beno?',
    a: "Redgrow starts at $9/mo (vs Replymer at $99/mo). The key difference: we never auto-post. We classify buying intent into 5 pain types so every draft is contextual — not a generic pitch. And since you paste everything yourself, there's zero risk to your account.",
  },
  {
    q: 'What subreddits does it monitor?',
    a: 'Any subreddit you choose. After you paste your product URL, Redgrow suggests 20+ relevant communities based on your audience, competitors, and keywords. You approve the list and can adjust at any time from the product page.',
  },
  {
    q: 'Can I edit the AI drafts before posting?',
    a: "Yes — that's the whole point. Every draft sits in your queue. Edit it, regenerate it, or skip it. Nothing goes anywhere without you copying it and pasting it manually. You're fully in control of every word.",
  },
  {
    q: 'What is GEO and why does it matter?',
    a: "GEO (Generative Engine Optimization) is about showing up in AI search answers. ChatGPT, Claude, Perplexity, and Gemini all cite Reddit threads in their answers. Every reply you post on Reddit today becomes a data point AI cites tomorrow. Redgrow shows you the highest-GEO-signal threads to maximise this effect.",
  },
  {
    q: 'Can I cancel anytime?',
    a: "Yes — cancel anytime from your settings, no questions asked. Plans are billed monthly with no long-term contracts.",
  },
  {
    q: 'How fresh are the leads?',
    a: "Very — Redgrow only shows threads from the last 24 hours. Older threads are cold: the conversation has moved on and a reply looks out of place. Every lead in your queue is still warm and worth replying to.",
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
