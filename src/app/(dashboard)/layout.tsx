import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)

  const [dbUser, products, opportunityCount, repliesThisMonth] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { name: true, email: true, avatarUrl: true, plan: true } }),
    prisma.product.findMany({ where: { userId: user.id, isActive: true }, select: { id: true, name: true, url: true }, orderBy: { createdAt: 'asc' } }),
    prisma.opportunity.count({ where: { product: { userId: user.id }, status: 'QUEUED' } }),
    prisma.reply.count({ where: { opportunity: { product: { userId: user.id } }, createdAt: { gte: monthStart } } }),
  ])

  return (
    <DashboardShell
      user={{ name: dbUser?.name ?? user.email ?? '', email: dbUser?.email ?? user.email ?? '', avatarUrl: dbUser?.avatarUrl ?? null, plan: dbUser?.plan ?? 'FREE' }}
      products={products}
      opportunityCount={opportunityCount}
      repliesThisMonth={repliesThisMonth}
    >
      {children}
    </DashboardShell>
  )
}
