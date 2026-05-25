export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export async function DELETE() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Delete all app data — cascade handles related rows
  await prisma.user.delete({ where: { id: user.id } }).catch(() => null)

  // Delete Supabase auth user if service role key is available
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    await admin.auth.admin.deleteUser(user.id).catch(() => null)
  }

  // Sign out the session
  await supabase.auth.signOut()

  return NextResponse.json({ ok: true })
}
