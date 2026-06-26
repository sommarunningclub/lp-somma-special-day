import { NextRequest, NextResponse } from 'next/server'
import { trackingDb } from '@/lib/tracking/db'
import { sessionCreateSchema } from '@/lib/tracking/schemas'
import { generateTrackingToken, hashTrackingToken } from '@/lib/tracking/token'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// POST — cria uma sessão de tracking. Devolve o token bruto (vai só na URL).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = sessionCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 })
    }
    const d = parsed.data
    const token = generateTrackingToken()

    const { data, error } = await trackingDb()
      .from('gps_tracking_sessions')
      .insert({
        tracking_token_hash: hashTrackingToken(token),
        participant_name: d.participant_name,
        reference_location_name: d.reference_location_name ?? null,
        reference_lat: d.reference_lat ?? null,
        reference_lng: d.reference_lng ?? null,
        planned_route_polyline: d.planned_route_polyline ?? null,
        status: 'created',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[gps-session] insert:', error.message)
      if (/relation .*gps_tracking_sessions.* does not exist/i.test(error.message)) {
        return NextResponse.json({ error: 'GPS Tracking ainda não está ativo (rode a migration).' }, { status: 503 })
      }
      return NextResponse.json({ error: 'Não foi possível criar a sessão.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data!.id, token }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
