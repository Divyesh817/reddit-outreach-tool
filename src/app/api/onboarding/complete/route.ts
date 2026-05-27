export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, profile, selectedSubreddits, keywords } = await req.json()
  if (!url || !profile) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

  // Ensure user exists in DB
  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email! },
    update: {},
  })

  const product = await prisma.product.create({
    data: {
      userId: user.id,
      url,
      name: profile.name,
      description: profile.description,
      targetAudience: profile.targetAudience,
      keyBenefits: profile.keyBenefits || [],
      competitors: profile.competitors || [],
      keywords: Array.isArray(keywords) ? keywords.slice(0, 30) : [],
      summary: profile.summary || profile.description,
      lastScrapedAt: new Date(),
    },
  })

  // Create only the subreddits the user selected
  const subsToCreate: string[] = Array.isArray(selectedSubreddits) ? selectedSubreddits : []
  if (subsToCreate.length > 0) {
    await prisma.subreddit.createMany({
      data: subsToCreate.slice(0, 15).map(name => ({
        productId: product.id,
        name,
        fitScore: 75, // default; will be updated by next scan
      })),
      skipDuplicates: true,
    })
  }

  return NextResponse.json({ productId: product.id })
}
