export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { plan: true, dodoSubscriptionId: true },
  })

  if (!user || user.plan === 'FREE') {
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
  }

  if (!user.dodoSubscriptionId) {
    return NextResponse.json({ error: 'No subscription ID on file — contact support.' }, { status: 400 })
  }

  const apiKey = process.env.DODO_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Server config error' }, { status: 500 })

  // Cancel at period end so user keeps access until billing cycle ends
  const res = await fetch(`https://live.dodopayments.com/subscriptions/${user.dodoSubscriptionId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cancel_at_next_billing_date: true }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Dodo cancel error:', err)
    return NextResponse.json({ error: 'Failed to cancel with Dodo. Please try again.' }, { status: 500 })
  }

  // Mark locally — plan stays active until period end, webhook will downgrade on expiry
  await prisma.user.update({
    where: { id: authUser.id },
    data: { planExpiresAt: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000) }, // conservative 32 days
  })

  return NextResponse.json({ ok: true })
}
