import { NextRequest, NextResponse } from 'next/server'
import { trackingDb } from '@/lib/tracking/db'
import { tokenOnlySchema } from '@/lib/tracking/schemas'
import { findSessionByToken } from '@/lib/tracking/session'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const parsed = tokenOnlySchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'Token inválido.' }, { status: 400 })
  const session = await findSessionByToken(parsed.data.token)
  if (!session) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 })
  if (session.status !== 'paused') return NextResponse.json({ error: 'Sessão não está pausada.' }, { status: 409 })

  const { error } = await trackingDb()
    .from('gps_tracking_sessions')
    .update({ status: 'running', paused_at: null })
    .eq('id', session.id)
  if (error) return NextResponse.json({ error: 'Falha ao retomar.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
