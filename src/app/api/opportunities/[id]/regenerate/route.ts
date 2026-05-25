export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateReply } from '@/lib/anthropic'
import type { PainType } from '@/types'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const opportunity = await prisma.opportunity.findFirst({
    where: { id: params.id, product: { userId } },
    include: {
      product: true,
      subreddit: true,
      replies: { where: { isActive: true } },
    },
  })
  if (!opportunity) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Deactivate old replies
  await prisma.reply.updateMany({
    where: { opportunityId: params.id },
    data: { isActive: false },
  })

  const currentVersion = opportunity.replies[0]?.version ?? 0

  const result = await generateReply(
    {
      title: opportunity.redditPostTitle,
      body: opportunity.redditPostBody || '',
      subreddit: opportunity.subreddit.name,
    },
    {
      url: opportunity.product.url,
      name: opportunity.product.name,
      description: opportunity.product.description,
      targetAudience: opportunity.product.targetAudience,
      keyBenefits: opportunity.product.keyBenefits,
      competitors: opportunity.product.competitors,
      summary: opportunity.product.summary,
    },
    opportunity.painType as PainType,
    opportunity.shouldPitch
  )

  const reply = await prisma.reply.create({
    data: {
      opportunityId: params.id,
      text: result.text,
      toneUsed: result.toneUsed,
      whyThisWorks: result.whyThisWorks,
      version: currentVersion + 1,
      isActive: true,
    },
  })

  return NextResponse.json({ data: reply })
}
