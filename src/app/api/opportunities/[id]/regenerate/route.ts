export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { prisma } from '@/lib/prisma'
import { generateReply } from '@/lib/anthropic'
import type { PainType } from '@/types'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (user as any).id

  const body = await req.json().catch(() => ({}))
  const includePitchOverride: boolean | undefined =
    typeof body.includePitch === 'boolean' ? body.includePitch : undefined

  const opportunity = await prisma.opportunity.findFirst({
    where: { id: params.id, product: { userId } },
    include: {
      product: true,
      subreddit: true,
      replies: { where: { isActive: true } },
    },
  })
  if (!opportunity) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existingReply = opportunity.replies[0]
  const currentVersion = existingReply?.version ?? 0

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
    opportunity.shouldPitch,
    includePitchOverride
  )

  // UPDATE existing record — regenerate does not count as a new reply hit
  let reply
  if (existingReply) {
    reply = await prisma.reply.update({
      where: { id: existingReply.id },
      data: {
        text: result.text,
        toneUsed: result.toneUsed,
        whyThisWorks: result.whyThisWorks,
        version: currentVersion + 1,
      },
    })
  } else {
    // First generation — create and count
    reply = await prisma.reply.create({
      data: {
        opportunityId: params.id,
        text: result.text,
        toneUsed: result.toneUsed,
        whyThisWorks: result.whyThisWorks,
        version: 1,
        isActive: true,
      },
    })
  }

  return NextResponse.json({ data: reply })
}
