export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { discoverSubreddits } from '@/lib/anthropic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (user as any).id

  const product = await prisma.product.findFirst({
    where: { id: params.id, userId },
    select: {
      url: true, name: true, description: true, targetAudience: true,
      keyBenefits: true, competitors: true, summary: true, keywords: true,
      subreddits: { select: { name: true } },
    },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = new Set(product.subreddits.map(s => s.name.toLowerCase()))

  const suggestions = await discoverSubreddits({
    url: product.url,
    name: product.name,
    description: product.description,
    targetAudience: product.targetAudience,
    keyBenefits: product.keyBenefits,
    competitors: product.competitors,
    summary: product.summary,
    keywords: product.keywords,
  })

  const newSuggestions = suggestions.filter(s => !existing.has(s.name.toLowerCase()))

  return NextResponse.json({ data: newSuggestions })
}
