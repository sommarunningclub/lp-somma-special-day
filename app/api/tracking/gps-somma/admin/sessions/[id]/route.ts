import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/insider'
import { trackingDb } from '@/lib/tracking/db'
import { publicSession } from '@/lib/tracking/session'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// GET — detalhe da sessão + pontos + estatísticas técnicas. Protegido.
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const db = trackingDb()

  const { data: session } = await db.from('gps_tracking_sessions').select('*').eq('id', params.id).maybeSingle()
  if (!session) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 })

  const { data: points } = await db
    .from('gps_tracking_points')
    .select('latitude, longitude, accuracy_m, speed_mps, captured_at, is_valid, rejection_reason')
    .eq('session_id', params.id)
    .order('captured_at', { ascending: true })

  const all = points ?? []
  const valid = all.filter((p) => p.is_valid)
  const accuracies = valid.map((p) => Number(p.accuracy_m)).filter((n) => Number.isFinite(n))
  const avgAccuracy = accuracies.length ? Math.round(accuracies.reduce((s, n) => s + n, 0) / accuracies.length) : null

  return NextResponse.json(
    {
      session: publicSession(session),
      points: all,
      stats: { total: all.length, valid: valid.length, rejected: all.length - valid.length, avg_accuracy_m: avgAccuracy },
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
