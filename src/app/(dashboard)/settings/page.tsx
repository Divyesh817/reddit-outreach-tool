import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string }
}) {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accountHealth: true, warmupSession: true },
  })

  const isConnected = !!user?.redditUsername
  const health = user?.accountHealth
  const warmup = user?.warmupSession

  const bannerMessage = searchParams.success === 'reddit_connected'
    ? { type: 'success', text: `Reddit account @${user?.redditUsername} connected successfully!` }
    : searchParams.error
    ? { type: 'error', text: `Reddit connection failed: ${searchParams.error.replace(/_/g, ' ')}` }
    : null

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and Reddit connection.</p>
      </div>

      {bannerMessage && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          bannerMessage.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {bannerMessage.text}
        </div>
      )}

      {/* Account */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Your account</h2>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-3">
            {session!.user?.image && (
              <img src={session!.user.image} alt="" className="w-10 h-10 rounded-full" />
            )}
            <div>
              <p className="font-medium text-gray-900">{session!.user?.name}</p>
              <p className="text-sm text-gray-500">{session!.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Plan:</span>
            <Badge variant="purple">{user?.plan}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reddit connection */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Reddit account</h2>
          <p className="text-sm text-gray-500">Required to scan subreddits and post replies.</p>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {isConnected ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">R</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">u/{user.redditUsername}</p>
                    <p className="text-xs text-gray-500">
                      Connected {user.redditConnectedAt
                        ? new Date(user.redditConnectedAt).toLocaleDateString()
                        : 'recently'}
                    </p>
                  </div>
                </div>
                <Badge variant="green">Connected</Badge>
              </div>

              {health && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account health</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          health.healthScore >= 80 ? 'bg-green-500' :
                          health.healthScore >= 50 ? 'bg-yellow-400' : 'bg-red-500'
                        }`}
                        style={{ width: `${health.healthScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{health.healthScore}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm mt-2">
                    <div>
                      <p className="text-gray-500 text-xs">Karma</p>
                      <p className="font-medium">{health.karma.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Account age</p>
                      <p className="font-medium">{health.accountAgeDays}d</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Shadowbanned</p>
                      <p className={`font-medium ${health.isShadowbanned ? 'text-red-600' : 'text-green-600'}`}>
                        {health.isShadowbanned ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                  {health.isShadowbanned && (
                    <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2 mt-2">
                      ⚠️ Shadowban detected. All posting is paused. Consider connecting a backup account.
                    </p>
                  )}
                </div>
              )}

              {warmup && warmup.status === 'IN_PROGRESS' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-900">Account warmup in progress</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Day {warmup.daysCompleted} of {warmup.targetDays}. Promotional posting unlocks after warmup completes.
                  </p>
                  <div className="flex-1 bg-blue-200 rounded-full h-1.5 mt-2">
                    <div
                      className="h-1.5 rounded-full bg-blue-500"
                      style={{ width: `${(warmup.daysCompleted / warmup.targetDays) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <Link href="/api/reddit/connect">
                <Button variant="secondary" size="sm">Reconnect Reddit</Button>
              </Link>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-gray-500">Connect your Reddit account to start scanning and posting.</p>
              <Link href="/api/reddit/connect">
                <Button>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  Connect Reddit account
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
