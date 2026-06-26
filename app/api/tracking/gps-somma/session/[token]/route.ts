import { NextRequest, NextResponse } from 'next/server'
import { trackingDb } from '@/lib/tracking/db'
import { findSessionByToken, publicSession } from '@/lib/tracking/session'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// GET — busca a própria sessão pelo token. ?points=1 inclui os pontos válidos (pra redesenhar).
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const session = await findSessionByToken(params.token)
  if (!session) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 })

  const out: Record<string, unknown> = { session: publicSession(session) }
  if (request.nextUrl.searchParams.get('points') === '1') {
    const { data } = await trackingDb()
      .from('gps_tracking_points')
      .select('latitude, longitude, accuracy_m, captured_at')
      .eq('session_id', session.id)
      .eq('is_valid', true)
      .order('captured_at', { ascending: true })
    out.points = data ?? []
  }
  return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } })
}
