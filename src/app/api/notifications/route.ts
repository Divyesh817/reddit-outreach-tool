import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Placeholder — returns empty list until notification events are wired in.
  // Future: query a Notification model keyed by userId, ordered by createdAt desc.
  const notifications: Notification[] = []

  return NextResponse.json({ data: notifications })
}

export async function POST(req: Request) {
  // Internal route for creating notifications (called by Inngest jobs, API routes, etc.)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, message, type = 'info', link } = body as {
    title: string
    message: string
    type?: 'info' | 'success' | 'warning' | 'error'
    link?: string
  }

  if (!title || !message) {
    return NextResponse.json({ error: 'title and message are required' }, { status: 400 })
  }

  // Placeholder response — when the Notification model is added to schema,
  // replace with: prisma.notification.create({ data: { userId: user.id, title, message, type, link } })
  return NextResponse.json({
    data: { id: 'pending', userId: user.id, title, message, type, link, read: false, createdAt: new Date() },
  })
}

export async function PATCH(req: Request) {
  // Mark notification(s) as read
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, markAllRead } = await req.json()

  // Placeholder — replace with prisma update once model exists
  if (markAllRead) {
    return NextResponse.json({ ok: true, updated: 'all' })
  }
  if (id) {
    return NextResponse.json({ ok: true, updated: id })
  }
  return NextResponse.json({ error: 'id or markAllRead required' }, { status: 400 })
}

interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  link?: string | null
  read: boolean
  createdAt: Date
}
