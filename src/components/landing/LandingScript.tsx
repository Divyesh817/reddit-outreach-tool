'use client'

import { useEffect } from 'react'

export function LandingScript() {
  useEffect(() => {
    // Nav scroll
    const nav = document.getElementById('nav')
    if (nav) {
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 4)
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
      return () => window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    // Mobile sheet
    const ham = document.getElementById('ham')
    const sheet = document.getElementById('sheet')
    if (!ham || !sheet) return
    const open = () => sheet.classList.add('open')
    const close = (e: Event) => {
      const target = e.target as HTMLElement
      if (target === sheet || target.tagName === 'A') sheet.classList.remove('open')
    }
    ham.addEventListener('click', open)
    sheet.addEventListener('click', close)
    return () => {
      ham.removeEventListener('click', open)
      sheet.removeEventListener('click', close)
    }
  }, [])

  useEffect(() => {
    // Scroll reveal
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const parent = e.target.parentElement
          const siblings = parent
            ? [...parent.children].filter(c => c.classList && c.classList.contains('reveal'))
            : []
          const idx = siblings.indexOf(e.target as Element)
          ;(e.target as HTMLElement).style.transitionDelay = Math.max(0, idx) * 90 + 'ms'
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    // Count-up
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const el = e.target as HTMLElement
        const target = parseFloat(el.dataset.count || '0')
        const decimals = (el.dataset.count?.split('.')[1] || '').length
        const dur = 1400
        const start = performance.now()
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur)
          const eased = 1 - Math.pow(1 - p, 3)
          const val = target * eased
          el.textContent = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString()
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        countIO.unobserve(el)
      })
    }, { threshold: 0.4 })
    document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el))
    return () => countIO.disconnect()
  }, [])

  return null
}
