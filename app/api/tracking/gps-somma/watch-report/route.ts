import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { trackingDb } from '@/lib/tracking/db'
import { findSessionByToken } from '@/lib/tracking/session'
import { computeSplits, computeElevation } from '@/lib/tracking/analytics'
import { buildConsolidated } from '@/lib/tracking/consolidate'
import { watchAiReport } from '@/lib/tracking/openai'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const BUCKET = 'gps-watch'

function parseDataUrl(d: string) {
  const m = /^data:(image\/(jpeg|png|webp));base64,(.+)$/i.exec(d)
  if (!m) return null
  const mime = m[1].toLowerCase()
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'
  return { mime, ext, buffer: Buffer.from(m[3], 'base64') }
}

// POST { token, photo(dataUrl) } — sobe a foto do relógio, extrai métricas e gera o relatório (IA).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const token = typeof body.token === 'string' ? body.token : ''
    const photo = typeof body.photo === 'string' ? body.photo : ''
    if (!token || !photo) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })

    const session = await findSessionByToken(token)
    if (!session) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 })

    const img = parseDataUrl(photo)
    if (!img) return NextResponse.json({ error: 'Imagem inválida.' }, { status: 400 })
    if (img.buffer.byteLength > 10 * 1024 * 1024) return NextResponse.json({ error: 'Imagem muito grande (máx 10MB).' }, { status: 400 })

    const db = trackingDb()
    const path = `watch/${session.id}-${randomUUID()}.${img.ext}`
    const up = await db.storage.from(BUCKET).upload(path, img.buffer, { contentType: img.mime, upsert: false })
    if (up.error) return NextResponse.json({ error: 'Falha no upload da foto.' }, { status: 500 })

    // contexto do GPS
    const { data: pts } = await db
      .from('gps_tracking_points')
      .select('latitude, longitude, altitude_m, captured_at')
      .eq('session_id', session.id)
      .eq('is_valid', true)
      .order('captured_at', { ascending: true })
    const splits = computeSplits(pts ?? [])
    const gpsElevationGain = computeElevation(pts ?? []).gain

    const ai = await watchAiReport(photo, {
      activity_type: session.activity_type ?? 'rua',
      reference: session.reference_location_name,
      gps_distance_km: Number(session.total_distance_m ?? 0) / 1000,
      gps_duration_seconds: Number(session.total_duration_seconds ?? 0),
      gps_pace_seconds_per_km: session.average_pace_seconds_per_km,
      splits,
    })

    if ('error' in ai && ai.error === 'no_key') {
      // guarda a foto mesmo sem IA; avisa o cliente
      await db.from('gps_tracking_sessions').update({ watch_photo_url: path }).eq('id', session.id)
      return NextResponse.json({ error: 'IA não configurada (defina OPENAI_API_KEY).', code: 'no_key' }, { status: 503 })
    }
    if ('error' in ai) {
      await db.from('gps_tracking_sessions').update({ watch_photo_url: path }).eq('id', session.id)
      return NextResponse.json({ error: 'A IA não conseguiu ler a foto agora. Tente de novo.' }, { status: 502 })
    }

    // Consolidação determinística (GPS + relógio) + fator de calibração.
    const { consolidated, calibration_factor } = buildConsolidated(
      { distance_m: Number(session.total_distance_m ?? 0), duration_seconds: Number(session.total_duration_seconds ?? 0), pace_seconds_per_km: session.average_pace_seconds_per_km },
      ai.metrics,
      gpsElevationGain
    )

    const full = { watch_photo_url: path, watch_metrics: ai.metrics, ai_report: ai.report, consolidated, calibration_factor }
    let { error: upErr } = await db.from('gps_tracking_sessions').update(full).eq('id', session.id)
    if (upErr && (upErr.code === '42703' || /column .* does not exist/i.test(upErr.message))) {
      // 0004 ainda não rodou: salva sem consolidated/calibration_factor
      ;({ error: upErr } = await db.from('gps_tracking_sessions').update({ watch_photo_url: path, watch_metrics: ai.metrics, ai_report: ai.report }).eq('id', session.id))
    }

    // Atualiza a calibração acumulada do corredor (média móvel). Tolerante se a tabela não existir.
    if (calibration_factor != null && session.participant_name) {
      try {
        const runnerKey = String(session.participant_name).trim().toLowerCase()
        const { data: cur } = await db.from('gps_tracking_calibration').select('distance_factor, samples').eq('runner_key', runnerKey).maybeSingle()
        if (cur) {
          const samples = Number(cur.samples) + 1
          const distance_factor = (Number(cur.distance_factor) * Number(cur.samples) + calibration_factor) / samples
          await db.from('gps_tracking_calibration').update({ distance_factor, samples, updated_at: new Date().toISOString() }).eq('runner_key', runnerKey)
        } else {
          await db.from('gps_tracking_calibration').insert({ runner_key: runnerKey, distance_factor: calibration_factor, samples: 1 })
        }
      } catch {
        /* tabela de calibração ainda não existe (pré-0004) */
      }
    }

    const signed = await db.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 6)
    return NextResponse.json({ ok: true, metrics: ai.metrics, report: ai.report, consolidated, calibration_factor, photo: signed.data?.signedUrl ?? null })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
