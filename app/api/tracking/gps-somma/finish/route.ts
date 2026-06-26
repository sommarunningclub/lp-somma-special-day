import { NextRequest, NextResponse } from 'next/server'
import { trackingDb } from '@/lib/tracking/db'
import { tokenOnlySchema } from '@/lib/tracking/schemas'
import { findSessionByToken } from '@/lib/tracking/session'
import { paceSecondsPerKm } from '@/lib/tracking/geo'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const parsed = tokenOnlySchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'Token inválido.' }, { status: 400 })
  const session = await findSessionByToken(parsed.data.token)
  if (!session) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 })

  const distance = Number(session.total_distance_m ?? 0)
  const finishedAt = new Date()
  const startedAt = session.started_at ? Date.parse(session.started_at) : finishedAt.getTime()
  const duration = session.status === 'finished'
    ? Number(session.total_duration_seconds ?? 0)
    : Math.max(0, Math.round((finishedAt.getTime() - startedAt) / 1000))
  const pace = paceSecondsPerKm(distance, duration)

  if (session.status !== 'finished') {
    const { error } = await trackingDb()
      .from('gps_tracking_sessions')
      .update({
        status: 'finished',
        finished_at: finishedAt.toISOString(),
        total_duration_seconds: duration,
        average_pace_seconds_per_km: pace,
      })
      .eq('id', session.id)
    if (error) return NextResponse.json({ error: 'Falha ao finalizar.' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    total_distance_m: distance,
    total_duration_seconds: duration,
    average_pace_seconds_per_km: pace,
  })
}
