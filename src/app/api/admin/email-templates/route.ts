export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { DEFAULT_EMAIL_TEMPLATES } from '@/lib/email-templates'

function isAdmin() {
  return cookies().get('admin_session')?.value === '1'
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const dbTemplates = await prisma.emailTemplate.findMany({ orderBy: { key: 'asc' } })
  const dbByKey = Object.fromEntries(dbTemplates.map(t => [t.key, t]))

  const templates = DEFAULT_EMAIL_TEMPLATES.map(def => ({
    ...(dbByKey[def.key] ?? { id: null, key: def.key, name: def.name, subject: def.subject, html: def.html, variables: def.variables }),
    isCustomised: !!dbByKey[def.key],
  }))

  return NextResponse.json(templates)
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { key, subject, html } = await req.json()
  if (!key || typeof subject !== 'string' || typeof html !== 'string') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const def = DEFAULT_EMAIL_TEMPLATES.find(t => t.key === key)
  if (!def) return NextResponse.json({ error: 'Unknown template key' }, { status: 400 })

  const updated = await prisma.emailTemplate.upsert({
    where: { key },
    create: { key, name: def.name, subject, html, variables: def.variables },
    update: { subject, html },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { key } = await req.json()
  await prisma.emailTemplate.deleteMany({ where: { key } })
  return NextResponse.json({ ok: true })
}
