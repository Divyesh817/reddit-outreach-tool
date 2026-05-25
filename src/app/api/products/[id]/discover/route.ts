export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { prisma } from '@/lib/prisma'
import { discoverSubreddits } from '@/lib/anthropic'
import { fetchSubredditRules } from '@/lib/reddit'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (user as any).id

  const product = await prisma.product.findFirst({ where: { id: params.id, userId } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const suggestions = await discoverSubreddits({
    url: product.url,
    name: product.name,
    description: product.description,
    targetAudience: product.targetAudience,
    keyBenefits: product.keyBenefits,
    competitors: product.competitors,
    summary: product.summary,
  })

  const created = await Promise.allSettled(
    suggestions.map(async (sub) => {
      const rules = await fetchSubredditRules(sub.name)
      return prisma.subreddit.upsert({
        where: { productId_name: { productId: product.id, name: sub.name } },
        update: { fitScore: sub.fitScore, fitReason: sub.fitReason, allowsPromotion: rules.allowsPromotion, rulesText: rules.rulesText, rulesScannedAt: new Date() },
        create: {
          productId: product.id,
          name: sub.name,
          fitScore: sub.fitScore,
          fitReason: sub.fitReason,
          allowsPromotion: rules.allowsPromotion,
          rulesText: rules.rulesText,
          rulesScannedAt: new Date(),
        },
      })
    })
  )

  const subreddits = await prisma.subreddit.findMany({
    where: { productId: product.id },
    orderBy: { fitScore: 'desc' },
  })

  return NextResponse.json({ data: subreddits })
}
