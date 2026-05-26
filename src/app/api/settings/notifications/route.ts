export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const allowed = ['highIntent', 'dailyDigest', 'weeklySummary', 'productNews']
  const patch: Record<string, boolean> = {}
  for (const key of allowed) {
    if (typeof body[key] === 'boolean') patch[key] = body[key]
  }

  // Merge with existing prefs
  const existing = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { notificationPrefs: true },
  })

  const merged = {
    highIntent: true,
    dailyDigest: true,
    weeklySummary: false,
    productNews: true,
    ...(existing?.notificationPrefs as object ?? {}),
    ...patch,
  }

  await prisma.user.update({
    where: { id: authUser.id },
    data: { notificationPrefs: merged },
  })

  return NextResponse.json({ ok: true, prefs: merged })
}
