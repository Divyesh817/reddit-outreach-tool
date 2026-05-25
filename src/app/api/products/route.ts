import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

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
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const body = await req.json().catch(() => null)
  const parsed = CreateProductSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  // Enforce plan product limit
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const productCount = await prisma.product.count({ where: { userId, isActive: true } })
  const limit = PLAN_LIMITS[user!.plan].products
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

  // Create subreddits (with rules scan)
  await Promise.allSettled(
    suggestedSubreddits.slice(0, 12).map(async (sub) => {
      const rules = await fetchSubredditRules(sub.name)
      return prisma.subreddit.create({
        data: {
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

  const full = await prisma.product.findUnique({
    where: { id: product.id },
    include: { subreddits: true },
  })

  return NextResponse.json({ data: full }, { status: 201 })
}
