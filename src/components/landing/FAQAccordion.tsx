'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n'

export function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const t = useT()
  const faqs = t.landing.faq.items

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
