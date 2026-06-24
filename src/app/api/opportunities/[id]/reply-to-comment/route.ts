export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { generateCommentReply } from '@/lib/anthropic'
import type { ProductProfile } from '@/types'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { commentBody, commentAuthor } = await req.json()
  if (!commentBody) return NextResponse.json({ error: 'Missing commentBody' }, { status: 400 })

  const opp = await prisma.opportunity.findUnique({
    where: { id: params.id },
    include: { product: true, subreddit: true },
  })
  if (!opp || opp.product.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const profile: ProductProfile = {
    url: opp.product.url,
    name: opp.product.name,
    description: opp.product.description,
    targetAudience: opp.product.targetAudience,
    keyBenefits: opp.product.keyBenefits as string[],
    competitors: opp.product.competitors as string[],
    summary: opp.product.summary,
    keywords: opp.product.keywords as string[],
  }

  const result = await generateCommentReply(
    { title: opp.redditPostTitle, subreddit: opp.subreddit.name },
    { author: commentAuthor || 'someone', body: commentBody },
    profile,
    opp.shouldPitch
  )

  // Save as a Reply record so it counts towards the monthly reply limit
  // isActive: false so it doesn't replace the main post reply in the inbox view
  await prisma.reply.create({
    data: {
      opportunityId: params.id,
      text: result.text,
      toneUsed: `comment reply · u/${commentAuthor || 'unknown'}`,
      whyThisWorks: result.whyThisWorks,
      version: 1,
      isActive: false,
    },
  })

  return NextResponse.json(result)
}
