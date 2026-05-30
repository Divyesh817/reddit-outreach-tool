import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { S } from '@/lib/theme'


async function getStats(userId: string) {
  const [queued, posted, accountHealth, products] = await Promise.all([
    prisma.opportunity.count({ where: { product: { userId }, status: 'QUEUED' } }),
    prisma.postedReply.count({ where: { opportunity: { product: { userId } } } }),
    prisma.accountHealth.findUnique({ where: { userId } }),
    prisma.product.findMany({
      where: { userId, isActive: true },
      select: { id: true, name: true },
      take: 1,
    }),
  ])
  return { queued, posted, accountHealth, product: products[0] ?? null }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { payment?: string; plan?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const userId = user.id

  // Fallback: if Dodo redirected here with ?payment=success, activate plan in DB
  if (searchParams.payment === 'success' && searchParams.plan) {
    const plan = searchParams.plan.toUpperCase()
    if (plan === 'STARTER' || plan === 'GROWTH') {
      await prisma.user.update({ where: { id: userId }, data: { plan } }).catch(() => {})
    }
    redirect('/dashboard')
  }
  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'
  const { queued, posted, accountHealth, product } = await getStats(userId)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 25, fontWeight: 700, color: S.text, margin: 0, letterSpacing: '-.02em' }}>
          {greeting}, {firstName}
        </h1>
        <p style={{ fontSize: 16, color: S.text3, marginTop: 4 }}>
          {product ? `Monitoring opportunities for ${product.name}` : 'Set up your first product to start scanning.'}
        </p>
      </div>

      {/* Stats strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1,
        background: S.line, borderRadius: 14, overflow: 'hidden', marginBottom: 28,
        border: `1px solid ${S.line2}`,
      }}>
        {[
          {
            label: 'Opportunities waiting',
            value: queued,
            sub: 'Ready to review',
            color: S.orange,
            soft: S.orangeSoft,
            href: '/opportunities',
          },
          {
            label: 'Replies posted',
            value: posted,
            sub: 'All time',
            color: S.green,
            soft: S.greenSoft,
            href: null,
          },
          {
            label: 'Account health',
            value: accountHealth ? `${accountHealth.healthScore}` : '—',
            sub: accountHealth?.isShadowbanned ? 'Shadowbanned — act now' : accountHealth ? 'Healthy' : 'Connect Reddit',
            color: accountHealth?.isShadowbanned ? S.red : S.blue,
            soft: accountHealth?.isShadowbanned ? S.redSoft : S.blueSoft,
            href: '/settings',
          },
        ].map(stat => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ background: S.panel, borderRadius: 14, border: `1px solid ${S.line2}`, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${S.line}` }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: S.text3, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'JetBrains Mono, monospace' }}>
            Quick actions
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[
            {
              label: 'Review inbox',
              desc: `${queued} opportunities waiting`,
              href: '/opportunities',
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="13" rx="2.5" stroke={S.orange} strokeWidth="1.4"/>
                  <path d="M2 7l8 5 8-5" stroke={S.orange} strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
              ),
              primary: true,
            },
            {
              label: 'Manage products',
              desc: 'Edit product profiles',
              href: '/products',
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="14" height="14" rx="2.5" stroke={S.text3} strokeWidth="1.4"/>
                  <path d="M7 10h6M10 7v6" stroke={S.text3} strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              ),
              primary: false,
            },
            {
              label: 'Settings',
              desc: 'Account & Reddit connection',
              href: '/settings',
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="3" stroke={S.text3} strokeWidth="1.4"/>
                  <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.41 1.41M14.37 14.37l1.41 1.41M4.22 15.78l1.41-1.41M14.37 5.63l1.41-1.41" stroke={S.text3} strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              ),
              primary: false,
            },
          ].map((action, i) => (
            <Link
              key={action.label}
              href={action.href}
              style={{
                display: 'block', padding: '18px 20px', textDecoration: 'none',
                borderRight: i < 2 ? `1px solid ${S.line}` : 'none',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: action.primary ? S.orangeSoft : S.panel2,
                border: `1px solid ${action.primary ? S.orangeLine : S.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                {action.icon}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 2 }}>{action.label}</div>
              <div style={{ fontSize: 15, color: S.text3 }}>{action.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* No product nudge */}
      {!product && (
        <div style={{
          background: S.panel, borderRadius: 14, border: `1px solid ${S.orangeLine}`,
          padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: S.orangeSoft,
            border: `1px solid ${S.orangeLine}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 4v5l3 3" stroke={S.orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="9" r="7" stroke={S.orange} strokeWidth="1.5"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: S.text, margin: '0 0 2px' }}>
              Add your first product to start
            </p>
            <p style={{ fontSize: 15, color: S.text3, margin: 0 }}>
              Redgrow will scan Reddit 24/7 and surface high-intent threads for you.
            </p>
          </div>
          <Link
            href="/onboarding"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, fontSize: 16, fontWeight: 600,
              background: S.orange, color: '#fff', textDecoration: 'none', flexShrink: 0,
            }}
          >
            Get started →
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, color, soft, href }: {
  label: string; value: number | string; sub: string; color: string; soft: string; href: string | null
}) {
  const inner = (
    <div style={{ background: S.panel, padding: '20px 24px', cursor: href ? 'pointer' : 'default' }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: S.text3, margin: 0, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'JetBrains Mono, monospace' }}>
        {label}
      </p>
      <p style={{ fontSize: 37, fontWeight: 700, color, margin: '8px 0 4px', letterSpacing: '-.04em', lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 15, color: S.text3, margin: 0 }}>{sub}</p>
    </div>
  )
  if (href) return <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link>
  return inner
}
