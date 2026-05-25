'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Will my Reddit account get banned?',
    a: 'We go to exceptional lengths to protect your account. Every account goes through a 7–14 day warmup period before any promotional posting. We enforce a hard cap of 5 promotional replies per day, maintain a 1:3 promo-to-normal comment ratio, and detect shadowbans within minutes. You stay well within Reddit\'s acceptable use limits. That said, no tool can guarantee Reddit won\'t change their policies — which is why we openly advise against using your primary personal account.',
  },
  {
    q: 'How is this different from spam?',
    a: 'Everything we post is genuinely relevant to the thread. Our AI reads the actual conversation, identifies the specific pain the person is experiencing, and writes a reply that addresses that pain first — before mentioning your product. We never mass-blast the same message. Each reply is unique, contextual, and only posted when the thread\'s intent score exceeds 60/100. Spam is volume without relevance. Leaddit is relevance without volume.',
  },
  {
    q: 'Do you ever post without my approval?',
    a: 'Never. Every reply sits in your approval queue until you click Approve. We\'ll notify you daily with new opportunities, but nothing goes live without your explicit sign-off. You can also edit the draft before approving.',
  },
  {
    q: 'Which Reddit accounts work best?',
    a: 'Accounts that are at least 6 months old with 500+ karma perform best. Newer accounts are fine but require a longer warmup (14 days vs 7 days). You can connect one account on Starter, and use multiple on Agency. We also support backup account failover if your primary gets restricted.',
  },
  {
    q: 'How long until I see results?',
    a: 'Most users see their first inbound lead within 7–10 days of connecting their first product. It depends on how active the subreddits are and how frequently high-intent threads appear. Reddit moves fast — popular subreddits surface multiple qualified threads every day.',
  },
  {
    q: 'Can I use this for multiple products?',
    a: 'Yes. Growth plan allows 3 products, Agency allows 10. Each product has its own subreddit watchlist, opportunity queue, and reply settings. Perfect for agencies managing multiple clients.',
  },
  {
    q: 'What happens if my account gets shadowbanned?',
    a: 'We check for shadowbans after every post and run a scheduled health check every 6 hours. The moment a shadowban is detected, all posting pauses automatically and you get an immediate alert. You can then connect a backup account and the queue carries forward with zero manual work.',
  },
  {
    q: 'Is there a free trial?',
    a: 'We don\'t offer a free tier, but every plan comes with a 7-day money-back guarantee — no questions asked. Cancel within 7 days for a full refund.',
  },
  {
    q: 'Do I need to give you my Reddit password?',
    a: 'No. We use Reddit\'s official OAuth — the same secure flow used by every legitimate Reddit app. You authorise Leaddit through Reddit\'s own login screen. We never see your password.',
  },
  {
    q: 'Which subreddits work best?',
    a: 'It depends on your product, but the highest-converting subreddits tend to be niche communities where your exact target audience hangs out — not the giant generic ones. Our AI suggests subreddits based on your product profile and scores each one by audience fit. You\'re always in control of what gets added or removed.',
  },
]

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-xl overflow-hidden"
        >
          <button
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
            <svg
              className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
