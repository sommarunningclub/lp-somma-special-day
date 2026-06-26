import { NextRequest, NextResponse } from 'next/server'
import { trackingDb } from '@/lib/tracking/db'
import { pointBatchSchema } from '@/lib/tracking/schemas'
import { findSessionByToken } from '@/lib/tracking/session'
import { processPoints, paceSecondsPerKm, type Anchor } from '@/lib/tracking/geo'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// POST { token, points[] } — recebe um ou vários pontos (a fila offline manda em lote).
export async function POST(request: NextRequest) {
  try {
    const parsed = pointBatchSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 })
    }
    const { token, points } = parsed.data

    const session = await findSessionByToken(token)
    if (!session) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 })
    if (session.status !== 'running') {
      return NextResponse.json({ error: 'Sessão não está ativa.', status: session.status }, { status: 409 })
    }

    const anchor: Anchor =
      session.latest_lat != null && session.latest_lng != null
        ? { lat: Number(session.latest_lat), lng: Number(session.latest_lng), at: session.last_point_at ? Date.parse(session.last_point_at) : 0 }
        : null

    const result = processPoints(points, anchor)
    const db = trackingDb()

    const rows = result.rows.map((r) => ({
      session_id: session.id,
      latitude: r.p.lat,
      longitude: r.p.lng,
      accuracy_m: r.p.accuracy ?? null,
      altitude_m: r.p.altitude ?? null,
      speed_mps: r.p.speed ?? null,
      heading: r.p.heading ?? null,
      captured_at: new Date(r.at).toISOString(),
      is_valid: r.is_valid,
      rejection_reason: r.rejection_reason,
    }))

    // upsert ignorando duplicados (fila offline pode reenviar o mesmo ponto)
    const { error: insErr } = await db
      .from('gps_tracking_points')
      .upsert(rows, { onConflict: 'session_id,captured_at,latitude,longitude', ignoreDuplicates: true })
    if (insErr) {
      console.error('[gps-point] insert:', insErr.message)
      return NextResponse.json({ error: 'Não foi possível salvar os pontos.' }, { status: 500 })
    }

    const newDistance = Number(session.total_distance_m ?? 0) + result.addedDistance
    const startedAt = session.started_at ? Date.parse(session.started_at) : Date.now()
    const duration = Math.max(0, Math.round((Date.now() - startedAt) / 1000))
    const pace = paceSecondsPerKm(newDistance, duration)

    const update: Record<string, unknown> = {
      total_distance_m: newDistance,
      total_duration_seconds: duration,
      average_pace_seconds_per_km: pace,
    }
    if (result.latest) {
      update.latest_lat = result.latest.lat
      update.latest_lng = result.latest.lng
      update.latest_accuracy_m = result.latest.accuracy
      update.last_point_at = new Date(result.latest.at).toISOString()
    }
    await db.from('gps_tracking_sessions').update(update).eq('id', session.id)

    const accepted = result.rows.filter((r) => r.is_valid).length
    return NextResponse.json({
      ok: true,
      accepted,
      rejected: result.rows.length - accepted,
      total_distance_m: newDistance,
      total_duration_seconds: duration,
      average_pace_seconds_per_km: pace,
      latest: result.latest ? { lat: result.latest.lat, lng: result.latest.lng, accuracy: result.latest.accuracy } : null,
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
