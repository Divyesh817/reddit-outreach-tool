import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [dbUser, products, opportunityCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { name: true, email: true, avatarUrl: true, plan: true } }),
    prisma.product.findMany({ where: { userId: user.id, isActive: true }, select: { id: true, name: true, url: true }, orderBy: { createdAt: 'asc' } }),
    prisma.opportunity.count({ where: { product: { userId: user.id }, status: 'QUEUED' } }),
  ])

  return (
    <DashboardShell
      user={{ name: dbUser?.name ?? user.email ?? '', email: dbUser?.email ?? user.email ?? '', avatarUrl: dbUser?.avatarUrl ?? null, plan: dbUser?.plan ?? 'STARTER' }}
      products={products}
      opportunityCount={opportunityCount}
    >
      {children}
    </DashboardShell>
  )
}
