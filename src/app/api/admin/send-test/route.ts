export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Resend } from 'resend'

const ADMIN_EMAIL = 'divyeshp125@gmail.com'
const resend = new Resend(process.env.RESEND_API_KEY)

function isAdmin() {
  return cookies().get('admin_session')?.value === '1'
}

export async function POST(req: NextRequest) {
  if (!isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { subject, html } = await req.json()
  if (!subject || !html) {
    return NextResponse.json({ error: 'Missing subject or html' }, { status: 400 })
  }

  const result = await resend.emails.send({
    from: 'Div from Redgrow <div@redgrow.app>',
    to: ADMIN_EMAIL,
    subject: `[TEST] ${subject}`,
    html,
  })

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: result.data?.id })
}
