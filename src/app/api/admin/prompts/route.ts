export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { DEFAULT_AI_PROMPTS } from '@/lib/prompt-defaults'

function isAdmin() {
  return cookies().get('admin_session')?.value === '1'
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const dbPrompts = await prisma.aiPrompt.findMany({ orderBy: { key: 'asc' } })
  const dbByKey = Object.fromEntries(dbPrompts.map(p => [p.key, p]))

  const prompts = DEFAULT_AI_PROMPTS.map(def => ({
    ...(dbByKey[def.key] ?? { id: null, key: def.key, name: def.name, content: def.content }),
    isCustomised: !!dbByKey[def.key],
  }))

  return NextResponse.json(prompts)
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { key, content } = await req.json()
  if (!key || typeof content !== 'string') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const def = DEFAULT_AI_PROMPTS.find(p => p.key === key)
  if (!def) return NextResponse.json({ error: 'Unknown prompt key' }, { status: 400 })

  const updated = await prisma.aiPrompt.upsert({
    where: { key },
    create: { key, name: def.name, content },
    update: { content },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { key } = await req.json()
  await prisma.aiPrompt.deleteMany({ where: { key } })
  return NextResponse.json({ ok: true })
}
