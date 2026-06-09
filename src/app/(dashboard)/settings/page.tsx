import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SettingsContent } from './SettingsContent'

const DEFAULT_NOTIF_PREFS = {
  highIntent: true,
  dailyDigest: true,
  weeklySummary: false,
  productNews: true,
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string; tab?: string }
}) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const [user, oppsThisMonth, repliesThisMonth] = await Promise.all([
    prisma.user.findUnique({ where: { id: authUser.id }, include: { accountHealth: true } }),
    (async () => {
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
      return prisma.opportunity.count({ where: { product: { userId: authUser.id }, createdAt: { gte: monthStart } } })
    })(),
    (async () => {
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
      return prisma.reply.count({ where: { opportunity: { product: { userId: authUser.id } }, createdAt: { gte: monthStart } } })
    })(),
  ])

  const banner = searchParams.success === 'upgraded'
    ? { ok: true, text: 'Plan upgraded successfully! Your new limits are active.' }
    : searchParams.success === 'reddit_connected'
    ? { ok: true, text: `Reddit @${user?.redditUsername} connected successfully!` }
    : searchParams.error
    ? { ok: false, text: `Reddit connection failed: ${searchParams.error.replace(/_/g, ' ')}` }
    : null

  const notifPrefs = {
    ...DEFAULT_NOTIF_PREFS,
    ...((user?.notificationPrefs as object) ?? {}),
  }

  const validTabs = ['account', 'billing', 'notifications', 'danger']
  const initialTab = validTabs.includes(searchParams.tab ?? '') ? searchParams.tab as 'account' | 'billing' | 'notifications' | 'danger' : 'account'

  return (
    <SettingsContent
      initialTab={initialTab}
      user={{
        name: user?.name ?? null,
        email: user?.email ?? null,
        avatarUrl: user?.avatarUrl ?? null,
        plan: user?.plan ?? 'FREE',
        redditUsername: user?.redditUsername ?? null,
        hasSubscription: (user?.plan ?? 'FREE') !== 'FREE',
      }}
      oppsThisMonth={oppsThisMonth}
      repliesThisMonth={repliesThisMonth}
      notifPrefs={notifPrefs}
      banner={banner}
    />
  )
}
