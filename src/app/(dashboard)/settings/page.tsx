import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SignOutButton } from './SignOutButton'
import { DeleteAccountButton } from './DeleteAccountButton'
import { S } from '@/lib/theme'


export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string }
}) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { accountHealth: true },
  })

  const banner = searchParams.success === 'reddit_connected'
    ? { ok: true, text: `Reddit @${user?.redditUsername} connected successfully!` }
    : searchParams.error
    ? { ok: false, text: `Reddit connection failed: ${searchParams.error.replace(/_/g, ' ')}` }
    : null

  const PLAN_LABELS: Record<string, string> = {
    STARTER: 'Starter — $9/mo',
    GROWTH: 'Growth — $19/mo',
    AGENCY: 'Agency — $49/mo',
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 640 }}>
      <h1 style={{ fontSize: 23, fontWeight: 700, color: S.text, margin: '0 0 24px', letterSpacing: '-.02em' }}>
        Settings
      </h1>

      {banner && (
        <div style={{
          marginBottom: 20, padding: '12px 16px', borderRadius: 10, fontSize: 16, fontWeight: 600,
          background: banner.ok ? S.greenSoft : S.redSoft,
          border: `1px solid ${banner.ok ? 'rgba(63,176,122,.3)' : 'rgba(229,83,83,.3)'}`,
          color: banner.ok ? S.green : S.red,
        }}>
          {banner.text}
        </div>
      )}

      {/* Account */}
      <Section title="Your account">
        {user?.avatarUrl && (
          <div style={{ padding: '14px 0 14px', borderBottom: `1px solid ${S.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={user.avatarUrl} alt="" style={{ width: 40, height: 40, borderRadius: '50%', border: `1px solid ${S.line2}` }} />
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: S.text, margin: 0 }}>{user.name || 'No name'}</p>
              <p style={{ fontSize: 15, color: S.text3, margin: 0 }}>{user.email}</p>
            </div>
          </div>
        )}
        <SettingsRow label="Email" value={user?.email || '—'} />
        <SettingsRow label="Plan">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: S.text }}>
              {PLAN_LABELS[user?.plan ?? 'STARTER'] ?? user?.plan}
            </span>
            <span style={{
              fontSize: 13, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
              background: S.amberSoft, color: S.amber, letterSpacing: '.04em',
              textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace',
              border: `1px solid rgba(229,160,74,.3)`,
            }}>
              {user?.plan ?? 'STARTER'}
            </span>
          </div>
        </SettingsRow>
      </Section>

      {/* Reddit */}
      <Section title="Reddit account" subtitle="Optional — required only for future auto-posting. Scanning works without it.">
        {user?.redditUsername ? (
          <div style={{ paddingTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: '#FF4500',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .379-.239l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: S.text, margin: 0 }}>u/{user.redditUsername}</p>
                <p style={{ fontSize: 14, color: S.green, margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: S.green, display: 'inline-block' }} />
                  Connected
                </p>
              </div>
            </div>

            {user.accountHealth && (
              <div style={{ background: S.card, borderRadius: 10, padding: '14px 16px', marginBottom: 14, border: `1px solid ${S.line}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[
                    { label: 'Karma', val: user.accountHealth.karma.toLocaleString() },
                    { label: 'Account age', val: `${user.accountHealth.accountAgeDays}d` },
                    { label: 'Health', val: `${user.accountHealth.healthScore}/100` },
                  ].map(s => (
                    <div key={s.label}>
                      <p style={{ fontSize: 13, color: S.text4, margin: '0 0 3px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'JetBrains Mono, monospace' }}>
                        {s.label}
                      </p>
                      <p style={{ fontSize: 18, fontWeight: 700, color: S.text, margin: 0 }}>{s.val}</p>
                    </div>
                  ))}
                </div>
                {user.accountHealth.isShadowbanned && (
                  <div style={{ marginTop: 12, background: S.redSoft, border: `1px solid rgba(229,83,83,.3)`, borderRadius: 8, padding: '10px 14px', fontSize: 15, color: S.red, fontWeight: 600 }}>
                    ⚠ Shadowban detected. Posting should be paused.
                  </div>
                )}
              </div>
            )}

            <Link
              href="/api/reddit/connect"
              style={{
                fontSize: 15, fontWeight: 600, color: S.text3, textDecoration: 'none',
                padding: '7px 14px', border: `1px solid ${S.line2}`, borderRadius: 8,
                display: 'inline-block', background: S.panel2,
              }}
            >
              Reconnect
            </Link>
          </div>
        ) : (
          <div style={{ paddingTop: 4 }}>
            <p style={{ fontSize: 16, color: S.text3, marginBottom: 16, lineHeight: 1.6 }}>
              Not connected. Redgrow scans Reddit without needing your account —
              connect only if you want auto-posting in the future.
            </p>
            <Link
              href="/api/reddit/connect"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px',
                background: '#FF4500', color: '#fff', textDecoration: 'none',
                borderRadius: 8, fontSize: 16, fontWeight: 700,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .379-.239l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
              </svg>
              Connect Reddit (optional)
            </Link>
          </div>
        )}
      </Section>

      {/* Session */}
      <Section title="Session">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: S.text, margin: 0 }}>Sign out</p>
            <p style={{ fontSize: 15, color: S.text3, margin: '2px 0 0' }}>Sign out of Redgrow on this device.</p>
          </div>
          <SignOutButton />
        </div>
      </Section>

      {/* Danger zone */}
      <div style={{ background: S.panel, borderRadius: 12, border: `1px solid rgba(229,83,83,.25)`, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ padding: '14px 24px', borderBottom: `1px solid rgba(229,83,83,.15)`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={S.red} strokeWidth="2.2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: S.red }}>Danger zone</p>
        </div>
        <div style={{ padding: '12px 24px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingTop: 8 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: S.text, margin: 0 }}>Delete account</p>
              <p style={{ fontSize: 15, color: S.text3, margin: '3px 0 0', maxWidth: 360, lineHeight: 1.5 }}>
                Permanently delete your account and all associated data — products, subreddits, opportunities, and replies. This cannot be undone.
              </p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <DeleteAccountButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: S.panel, borderRadius: 12, border: `1px solid ${S.line2}`, overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ padding: '14px 24px', borderBottom: `1px solid ${S.line}` }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: S.text }}>{title}</p>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: 15, color: S.text3 }}>{subtitle}</p>}
      </div>
      <div style={{ padding: '4px 24px 16px' }}>
        {children}
      </div>
    </div>
  )
}

function SettingsRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${S.line}` }}>
      <span style={{ fontSize: 16, color: S.text3, fontWeight: 500 }}>{label}</span>
      {children ?? <span style={{ fontSize: 16, fontWeight: 600, color: S.text }}>{value}</span>}
    </div>
  )
}
