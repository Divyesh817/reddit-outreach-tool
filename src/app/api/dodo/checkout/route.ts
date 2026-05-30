export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const DODO_BASE = 'https://live.dodopayments.com'

const PRODUCT_IDS: Record<string, string> = {
  STARTER: process.env.DODO_STARTER_PRODUCT_ID ?? '',
  GROWTH:  process.env.DODO_GROWTH_PRODUCT_ID ?? '',
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  const productId = PRODUCT_IDS[plan as string]
  if (!productId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true, name: true },
  })

  const res = await fetch(`${DODO_BASE}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer_details: {
        email: dbUser?.email ?? user.email ?? '',
        name: dbUser?.name ?? 'User',
      },
      metadata: { user_id: user.id, plan },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&plan=${plan}`,
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    console.error('Dodo checkout error:', detail)
    return NextResponse.json({ error: 'Checkout creation failed' }, { status: 500 })
  }

  const data = await res.json()
  return NextResponse.json({ checkout_url: data.checkout_url, session_id: data.session_id })
}
