export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const PLAN_BY_PRODUCT: Record<string, 'STARTER' | 'GROWTH'> = {
  [process.env.DODO_STARTER_PRODUCT_ID ?? '__none__']: 'STARTER',
  [process.env.DODO_GROWTH_PRODUCT_ID  ?? '__none__']: 'GROWTH',
}

function verifySignature(payload: string, header: string, secret: string): boolean {
  try {
    // Dodo sends: "t=<timestamp>,v1=<sig>"
    const parts = Object.fromEntries(header.split(',').map(p => p.split('=')))
    const signed = `${parts.t}.${payload}`
    const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(parts.v1 ?? ''), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const secret = process.env.DODO_WEBHOOK_SECRET
  if (secret) {
    const sig = req.headers.get('webhook-signature') ?? ''
    if (!verifySignature(rawBody, sig, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  }

  const eventType: string = event.type ?? event.event_type ?? ''
  const payload = event.data ?? event

  // Extract user ID from metadata (set during checkout session creation)
  const userId: string =
    payload?.metadata?.user_id ??
    payload?.subscription?.metadata?.user_id ??
    ''

  const productId: string =
    payload?.product_id ??
    payload?.subscription?.product_id ??
    payload?.items?.[0]?.product_id ??
    ''

  const subscriptionId: string =
    payload?.subscription_id ??
    payload?.subscription?.id ??
    payload?.id ??
    ''

  if (!userId) {
    console.warn('Dodo webhook: no user_id in metadata', eventType)
    return NextResponse.json({ ok: true })
  }

  if (eventType === 'subscription.active' || eventType === 'payment.succeeded') {
    const plan = PLAN_BY_PRODUCT[productId]
    if (plan) {
      await prisma.user.update({
        where: { id: userId },
        data: { plan, ...(subscriptionId ? { dodoSubscriptionId: subscriptionId } : {}) },
      }).catch(console.error)
    }
  }

  if (eventType === 'subscription.cancelled' || eventType === 'subscription.expired' || eventType === 'subscription.failed') {
    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'FREE', dodoSubscriptionId: null },
    }).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
