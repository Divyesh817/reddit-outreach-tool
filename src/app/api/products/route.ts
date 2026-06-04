export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { prisma } from '@/lib/prisma'
import { scrapeProductProfile, discoverSubreddits } from '@/lib/anthropic'
import { fetchSubredditRules } from '@/lib/reddit'
import { PLAN_LIMITS } from '@/types'
import { z } from 'zod'

const CreateProductSchema = z.object({
  url: z.string().url(),
  html: z.string().min(1),
})

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (user as any).id

  const products = await prisma.product.findMany({
    where: { userId, isActive: true },
    include: {
      subreddits: { where: { isActive: true } },
      _count: { select: { opportunities: { where: { status: 'QUEUED' } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: products })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (user as any).id

  const body = await req.json().catch(() => null)
  const parsed = CreateProductSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  // Enforce plan product limit
  const dbUser = await prisma.user.findUnique({ where: { id: userId } })
  const productCount = await prisma.product.count({ where: { userId, isActive: true } })
  const planKey = (dbUser?.plan ?? 'STARTER') as string
  const limit = (PLAN_LIMITS as Record<string, { products: number }>)[planKey]?.products ?? PLAN_LIMITS['GROWTH'].products
  if (productCount >= limit) {
    return NextResponse.json({ error: `Your plan allows max ${limit} product(s). Upgrade to add more.` }, { status: 403 })
  }

  const { url, html } = parsed.data

  // Scrape product profile with AI
  const profile = await scrapeProductProfile(url, html)

  // Discover subreddits
  const suggestedSubreddits = await discoverSubreddits(profile)

  // Create product
  const product = await prisma.product.create({
    data: {
      userId,
      url,
      name: profile.name,
      description: profile.description,
      targetAudience: profile.targetAudience,
      keyBenefits: profile.keyBenefits,
      competitors: profile.competitors,
      summary: profile.summary,
      lastScrapedAt: new Date(),
    },
  })

  // Set logoUrl via raw SQL — non-fatal, bypasses Prisma client cache issues
  try {
    const domain = new URL(url).hostname
    const logoUrl = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=64`
    await prisma.$executeRaw`UPDATE products SET "logoUrl" = ${logoUrl} WHERE id = ${product.id}`
  } catch { /* non-fatal */ }

  // Create subreddits (with rules scan)
  await Promise.allSettled(
    suggestedSubreddits.slice(0, 12).map(async (sub) => {
      const rules = await fetchSubredditRules(sub.name)
      return prisma.subreddit.create({
        data: {
          productId: product.id,
          name: sub.name.replace(/^\/?r\//i, ''),
          fitScore: sub.fitScore,
          fitReason: sub.fitReason,
          allowsPromotion: rules.allowsPromotion,
          rulesText: rules.rulesText,
          rulesScannedAt: new Date(),
        },
      })
    })
  )

  const full = await prisma.product.findUnique({
    where: { id: product.id },
    include: { subreddits: true },
  })

  return NextResponse.json({ data: full }, { status: 201 })
}
