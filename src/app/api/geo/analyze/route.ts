export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { runGeoAnalysis } from '@/lib/anthropic'

const GEO_MONTHLY_LIMIT: Record<string, number> = { FREE: 1, STARTER: 10, GROWTH: 50 }

function currentWeekOf(): Date {
  const now = new Date()
  const dayOfWeek = now.getUTCDay()
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysToMonday))
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { productId } = await req.json()
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

    const [product, dbUser] = await Promise.all([
      prisma.product.findFirst({ where: { id: productId, userId: user.id, isActive: true } }),
      prisma.user.findUnique({ where: { id: user.id }, select: { plan: true } }),
    ])
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const plan = dbUser?.plan ?? 'FREE'
    const monthlyLimit = GEO_MONTHLY_LIMIT[plan] ?? 1
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
    const usedThisMonth = await prisma.geoReport.count({
      where: { userId: user.id, createdAt: { gte: monthStart } },
    })
    if (usedThisMonth >= monthlyLimit) {
      return NextResponse.json({
        error: `GEO analysis limit reached (${monthlyLimit}/month on ${plan} plan). Upgrade to run more.`,
        limitReached: true,
      }, { status: 429 })
    }

    let analysis
    try {
      analysis = await runGeoAnalysis(product)
    } catch (e: any) {
      console.error('GEO Claude call failed:', e?.message)
      return NextResponse.json({ error: 'AI analysis failed — try again' }, { status: 500 })
    }

    // Coerce geoScore to integer in case Claude returns a float or string
    const geoScore = Math.round(Number(analysis.geoScore))

    let reportId: string | null = null
    try {
      const report = await prisma.geoReport.create({
        data: {
          productId,
          userId: user.id,
          geoScore,
          analysis: analysis as object,
          weekOf: currentWeekOf(),
        },
      })
      reportId = report.id
    } catch (e: any) {
      // Non-fatal — analysis succeeded, DB save failed; still return the data
      console.error('GEO report DB save failed:', e?.message)
    }

    return NextResponse.json({ data: analysis, reportId })
  } catch (e: any) {
    console.error('GEO analyze unexpected error:', e?.message)
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
