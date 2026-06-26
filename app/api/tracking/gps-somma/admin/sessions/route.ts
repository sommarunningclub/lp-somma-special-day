import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/insider'
import { trackingDb } from '@/lib/tracking/db'
import { publicSession } from '@/lib/tracking/session'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// GET — lista de sessões pro painel (polling ao vivo). Protegido pelo admin existente.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data } = await trackingDb()
    .from('gps_tracking_sessions')
    .select('*')
    .order('last_point_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  const sessions = (data ?? []).map((s) => publicSession(s))
  return NextResponse.json({ sessions }, { headers: { 'Cache-Control': 'no-store' } })
}
