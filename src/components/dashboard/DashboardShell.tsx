'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { S, DARK_VARS, LIGHT_VARS } from '@/lib/theme'
import { PLAN_LIMITS } from '@/types'
import { SupportWidget } from '@/components/support/SupportWidget'
import { ProductLogo } from '@/components/ui/ProductLogo'

interface Props {
  user: { name: string; email: string; avatarUrl: string | null; plan: string }
  products: { id: string; name: string; url: string; logoUrl?: string | null }[]
  children: React.ReactNode
  opportunityCount?: number
  repliesThisMonth?: number
}

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/opportunities': 'Inbox',
  '/products': 'Products',
  '/geo': 'GEO',
  '/settings': 'Settings',
}

function getPageLabel(pathname: string) {
  for (const [key, label] of Object.entries(PAGE_LABELS)) {
    if (pathname === key || (key !== '/dashboard' && pathname.startsWith(key))) return label
  }
  return 'Redgrow'
}

export function DashboardShell({ user, products, children, opportunityCount = 0, repliesThisMonth = 0 }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [dark, setDark] = useState(true)
  const [productsOpen, setProductsOpen] = useState(false)
  const product = products[0]
  const initials = (user.name || user.email).slice(0, 2).toUpperCase()
  const pageLabel = getPageLabel(pathname)

  const planLimits = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS['FREE']
  const replyLimit = planLimits.repliesPerMonth
  const replyPct = Math.min(100, Math.round((repliesThisMonth / replyLimit) * 100))
  const productLimit = planLimits.products
  const isFree = user.plan === 'FREE'
  // FREE: always show 1 locked upgrade slot regardless of product count
  // STARTER/GROWTH: show unlocked "Add product" slots up to plan limit
  const lockedSlots = isFree ? 1 : 0
  const addSlots = isFree ? 0 : Math.max(0, productLimit - products.length)
  const upgradeLabel = user.plan === 'FREE' ? 'Upgrade to Starter' : user.plan === 'STARTER' ? 'Upgrade to Growth' : null

  const PLAN_DISPLAY: Record<string, string> = {
    FREE: 'Free plan',
    STARTER: 'Starter plan',
    GROWTH: 'Growth plan',
  }

  useEffect(() => {
    const saved = localStorage.getItem('rg-theme')
    if (saved === 'light') setDark(false)
  }, [])

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    localStorage.setItem('rg-theme', next ? 'dark' : 'light')
  }

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard',     label: 'Dashboard', icon: HomeIcon },
    { href: '/opportunities', label: 'Inbox',     icon: InboxIcon, badge: opportunityCount > 0 ? String(opportunityCount) : null },
    { href: '/products',      label: 'Products',  icon: BoxIcon },
    { href: '/geo',           label: 'GEO',       icon: GeoIcon },
    { href: '/settings',      label: 'Settings',  icon: SettingsIcon },
  ]

  const themeVars = (dark ? DARK_VARS : LIGHT_VARS) as React.CSSProperties

  return (
    <div style={{ ...themeVars, display: 'grid', gridTemplateColumns: '248px 1fr', minHeight: '100vh', background: S.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        background: S.panel, borderRight: `1px solid ${S.line}`,
        padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 18,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 4px' }}>
          <span style={{
            width: 26, height: 26, borderRadius: '50%', background: S.orange,
            boxShadow: `inset 0 -3px 0 rgba(0,0,0,.22), 0 0 14px rgba(255,87,34,.35)`,
            position: 'relative', flexShrink: 0, display: 'inline-block',
          }}>
            <span style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%,-50%)',
              width: 8, height: 8, borderRadius: '50%',
              background: dark ? '#0E0D0C' : '#F5F0EA',
            }} />
          </span>
          <span style={{ fontSize: 17, fontWeight: 600, color: S.text, letterSpacing: '-.01em' }}>Redgrow</span>
        </div>

        {/* Product accordion */}
        <div style={{ background: S.panel2, border: `1px solid ${S.line}`, borderRadius: 11, overflow: 'hidden' }}>
          {/* Accordion trigger — active product */}
          <button
            onClick={() => setProductsOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', background: 'none', border: 'none',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            {product ? (
              <ProductLogo name={product.name} logoUrl={(product as any).logoUrl} size={26} radius={7} />
            ) : (
              <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: S.line, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" fill="none" stroke={S.text4} strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </span>
            )}
            <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: product ? S.text : S.text4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product ? product.name : 'No product'}
            </span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={S.text3} strokeWidth="2"
              style={{ flexShrink: 0, transform: productsOpen ? 'rotate(180deg)' : 'none', transition: 'transform .18s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Expanded product list */}
          {productsOpen && (
            <div style={{ borderTop: `1px solid ${S.line}`, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Existing products — skip index 0 since it's already shown in the trigger */}
              {products.slice(1).map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '7px 8px', borderRadius: 7, textDecoration: 'none',
                    background: 'transparent',
                    border: `1px solid transparent`,
                    transition: 'all .12s',
                  }}
                >
                  <ProductLogo name={p.name} logoUrl={(p as any).logoUrl} size={22} radius={6} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: S.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </span>
                </Link>
              ))}

              {/* Locked slots — FREE always gets 1, points to upgrade */}
              {Array.from({ length: lockedSlots }).map((_, i) => (
                <div key={`locked-${i}`} style={{
                  padding: '7px 8px', borderRadius: 7,
                  border: `1px dashed ${S.line2}`, opacity: 0.65,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      background: S.line, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="10" height="10" fill="none" stroke={S.text4} strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <span style={{ fontSize: 12, color: S.text4 }}>Add product</span>
                  </div>
                  {upgradeLabel && (
                    <Link href="/settings?tab=billing" onClick={e => e.stopPropagation()} style={{ display: 'block', marginTop: 4, fontSize: 10.5, color: S.orange2, textDecoration: 'none', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.03em' }}>
                      {upgradeLabel} →
                    </Link>
                  )}
                </div>
              ))}

              {/* Unlocked "Add product" slots — STARTER/GROWTH fill up to plan limit */}
              {Array.from({ length: addSlots }).map((_, i) => (
                <Link key={`add-${i}`} href="/products" style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '7px 8px', borderRadius: 7, textDecoration: 'none',
                  border: `1px dashed ${S.line2}`, transition: 'all .12s',
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: S.line, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="10" height="10" fill="none" stroke={S.text3} strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </span>
                  <span style={{ flex: 1, fontSize: 12.5, color: S.text3, fontWeight: 500 }}>Add product</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: '.16em', textTransform: 'uppercase', color: S.text4, padding: '4px 12px 6px' }}>
            Workspace
          </div>
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const effectivePath = pendingHref ?? pathname
            const active = effectivePath === href || (href !== '/dashboard' && effectivePath.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                scroll={false}
                onClick={() => {
                  if (href !== pathname) {
                    setPendingHref(href)
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: active ? '8px 11px' : '9px 12px', borderRadius: 8,
                  textDecoration: 'none', fontSize: 16.5, fontWeight: 450,
                  color: active ? S.orange2 : S.text2,
                  background: active ? S.orangeSoft : 'transparent',
                  border: active ? `1px solid ${S.orangeLine}` : '1px solid transparent',
                  transition: 'all .12s',
                }}
              >
                <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? S.orange2 : S.text3, flexShrink: 0 }}>
                  <Icon />
                </span>
                {label}
                {badge && (
                  <span style={{
                    marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13.5, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
                    background: S.orangeSoft, color: S.orange2,
                  }}>
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Plan card */}
        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${S.line}` }}>
          <div style={{ background: S.panel2, border: `1px solid ${S.line}`, borderRadius: 10, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#8B6CFF,#5040C2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                  {initials}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: S.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name || user.email}
                </p>
              </div>
            </div>
            <div style={{ marginTop: 10, height: 4, background: S.line, borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${replyPct}%`, background: `linear-gradient(90deg,${S.orange2},${S.orange})`, borderRadius: 999 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: S.text3 }}>
              <span>{PLAN_DISPLAY[user.plan] ?? user.plan}</span>
              <span>{repliesThisMonth} / {replyLimit} replies</span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                marginTop: 10, width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 6, padding: '7px', borderRadius: 7,
                background: S.line, border: `1px solid ${S.line}`,
                color: S.text3, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all .12s',
              }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '12px 28px',
          borderBottom: `1px solid ${S.line}`, background: S.bg,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: S.text3, fontSize: 15.5 }}>
            <span>Redgrow</span>
            <span style={{ color: S.text4 }}>/</span>
            <span style={{ color: S.text, fontWeight: 500 }}>{pageLabel}</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                width: 34, height: 34, borderRadius: '50%', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                background: S.panel2, border: `1px solid ${S.line2}`,
                cursor: 'pointer', color: S.text2, transition: 'background .12s, border-color .12s',
              }}
            >
              {dark ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Notifications bell */}
            <button
              onClick={() => setNotifOpen(o => !o)}
              title="Notifications"
              style={{
                width: 34, height: 34, borderRadius: '50%', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                background: notifOpen ? S.orangeSoft : S.panel2,
                border: `1px solid ${notifOpen ? S.orangeLine : S.line2}`,
                cursor: 'pointer', color: notifOpen ? S.orange2 : S.text2,
                transition: 'background .12s, border-color .12s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
              </svg>
            </button>

            {/* Notifications popup */}
            {notifOpen && (
              <>
                <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                <div style={{
                  position: 'absolute', top: 42, right: 0, zIndex: 50,
                  width: 320, background: S.panel, border: `1px solid ${S.line2}`,
                  borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,.25)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '13px 18px', borderBottom: `1px solid ${S.line}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: S.text }}>Notifications</span>
                    <span style={{ fontSize: 13, color: S.text4, fontFamily: "'JetBrains Mono', monospace" }}>0 new</span>
                  </div>
                  <div style={{ padding: '36px 18px', textAlign: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', background: S.panel2,
                      border: `1px solid ${S.line2}`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', margin: '0 auto 12px',
                    }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={S.text4} strokeWidth="1.6">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: S.text3, margin: '0 0 4px' }}>No notifications</p>
                    <p style={{ fontSize: 14, color: S.text4, margin: 0, lineHeight: 1.5 }}>
                      We'll let you know when something needs attention.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Page content */}
        {children}
      </main>

      {/* Support chat widget */}
      <SupportWidget />
    </div>
  )
}

function HomeIcon()     { return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 12L12 4l9 8"/><path d="M5 10v10h14V10"/></svg> }
function InboxIcon()    { return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg> }
function BoxIcon()      { return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> }
function GeoIcon()      { return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18M3 12h18"/></svg> }
function SettingsIcon() { return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }
