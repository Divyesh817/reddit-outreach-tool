import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

async function getStats(userId: string) {
  const [opportunities, posted, products, accountHealth] = await Promise.all([
    prisma.opportunity.count({ where: { product: { userId }, status: 'QUEUED' } }),
    prisma.postedReply.count({ where: { opportunity: { product: { userId } } } }),
    prisma.product.count({ where: { userId, isActive: true } }),
    prisma.accountHealth.findUnique({ where: { userId } }),
  ])
  return { opportunities, posted, products, accountHealth }
}

async function getRecentActivity(userId: string) {
  return prisma.opportunity.findMany({
    where: { product: { userId } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { subreddit: true },
  })
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const [stats, activity] = await Promise.all([
    getStats(userId),
    getRecentActivity(userId),
  ])

  const user = await prisma.user.findUnique({ where: { id: userId } })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, {session!.user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your outreach today.</p>
      </div>

      {/* Reddit not connected banner */}
      {!user?.redditUsername && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-orange-900">Connect your Reddit account to start posting</p>
            <p className="text-sm text-orange-700 mt-0.5">Required to scan subreddits and post approved replies.</p>
          </div>
          <Link href="/settings">
            <Button size="sm">Connect Reddit</Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Queued opportunities', value: stats.opportunities, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Replies posted', value: stats.posted, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Active products', value: stats.products, color: 'text-blue-600', bg: 'bg-blue-50' },
          {
            label: 'Account health',
            value: stats.accountHealth ? `${stats.accountHealth.healthScore}%` : '—',
            color: stats.accountHealth?.isShadowbanned ? 'text-red-600' : 'text-green-600',
            bg: stats.accountHealth?.isShadowbanned ? 'bg-red-50' : 'bg-green-50',
          },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Quick actions */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Quick actions</h2>
          </div>
          <CardContent className="space-y-2 pt-4">
            <Link href="/opportunities" className="block">
              <Button variant="secondary" className="w-full justify-start">
                Review opportunity queue
                {stats.opportunities > 0 && (
                  <Badge variant="purple" className="ml-auto">{stats.opportunities}</Badge>
                )}
              </Button>
            </Link>
            <Link href="/products/new" className="block">
              <Button variant="secondary" className="w-full justify-start">
                Add a new product
              </Button>
            </Link>
            <Link href="/settings" className="block">
              <Button variant="secondary" className="w-full justify-start">
                {user?.redditUsername ? `Reddit: @${user.redditUsername}` : 'Connect Reddit account'}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="col-span-2">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent activity</h2>
          </div>
          <CardContent className="pt-4">
            {activity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No activity yet.</p>
                <Link href="/products/new" className="mt-3 inline-block">
                  <Button size="sm">Add your first product</Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {activity.map(opp => (
                  <li key={opp.id} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <StatusDot status={opp.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{opp.redditPostTitle}</p>
                      <p className="text-xs text-gray-500">r/{opp.subreddit.name} · score {opp.intentScore}</p>
                    </div>
                    <Badge variant={opp.status === 'QUEUED' ? 'yellow' : opp.status === 'POSTED' ? 'green' : 'default'}>
                      {opp.status.toLowerCase()}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    QUEUED: 'bg-yellow-400',
    APPROVED: 'bg-blue-400',
    POSTED: 'bg-green-400',
    SKIPPED: 'bg-gray-300',
    FAILED: 'bg-red-400',
  }
  return <div className={`w-2 h-2 rounded-full mt-1.5 ${colors[status] ?? 'bg-gray-300'}`} />
}
