import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const health = await prisma.accountHealth.findUnique({ where: { userId } })
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { redditUsername: true, redditConnectedAt: true },
  })

  return NextResponse.json({ data: { ...health, redditUsername: user?.redditUsername, connectedAt: user?.redditConnectedAt } })
}
