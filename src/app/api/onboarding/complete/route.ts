export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { url, profile, selectedSubreddits, keywords } = await req.json()
    if (!url || !profile) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

    // Resolve DB user — handles the case where Supabase auth ID differs from existing DB record
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        create: { id: user.id, email: user.email ?? '' },
        update: {},
      })
    } catch {
      // Email already exists under a different ID — migrate that record to the current auth ID
      const existing = await prisma.user.findUnique({ where: { email: user.email ?? '' } })
      if (!existing) throw new Error('Could not resolve user account')

      // Update user row first (FK parent), then migrate products to the new ID
      await prisma.$executeRaw`UPDATE users SET id = ${user.id} WHERE id = ${existing.id}`
      await prisma.$executeRaw`UPDATE products SET "userId" = ${user.id} WHERE "userId" = ${existing.id}`
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        url,
        name: profile.name || 'My Product',
        description: profile.description || '',
        targetAudience: profile.targetAudience || '',
        keyBenefits: Array.isArray(profile.keyBenefits) ? profile.keyBenefits : [],
        competitors: Array.isArray(profile.competitors) ? profile.competitors : [],
        keywords: Array.isArray(keywords) ? keywords.slice(0, 30) : [],
        summary: profile.summary || profile.description || '',
        lastScrapedAt: new Date(),
      },
    })

    // Set logoUrl via raw SQL — non-fatal
    try {
      const domain = new URL(url).hostname
      const logoUrl = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=64`
      await prisma.$executeRaw`UPDATE products SET "logoUrl" = ${logoUrl} WHERE id = ${product.id}`
    } catch { /* non-fatal */ }

    // Create selected subreddits — strip any r/ prefix
    const subsToCreate: string[] = Array.isArray(selectedSubreddits) ? selectedSubreddits : []
    if (subsToCreate.length > 0) {
      await prisma.subreddit.createMany({
        data: subsToCreate.slice(0, 15).map((name: string) => ({
          productId: product.id,
          name: String(name).replace(/^\/?r\//i, '').trim(),
          fitScore: 75,
        })).filter(s => s.name.length > 0),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ productId: product.id })
  } catch (e: any) {
    console.error('[onboarding/complete]', e?.message, e?.code)
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 })
  }
}
