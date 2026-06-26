import { redirect, notFound } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { trackingDb } from '@/lib/tracking/db'
import { toTrackSession } from '@/lib/tracking/session'
import SessionDetail from '@/components/tracking/SessionDetail'
import type { TrackPoint, TrackSession } from '@/lib/tracking/types'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export default async function GpsSessionDetailPage({ params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) redirect('/login-admin')
  const db = trackingDb()

  const { data: raw } = await db.from('gps_tracking_sessions').select('*').eq('id', params.id).maybeSingle()
  if (!raw) notFound()

  const { data: points } = await db
    .from('gps_tracking_points')
    .select('latitude, longitude, accuracy_m, speed_mps, captured_at, is_valid, rejection_reason')
    .eq('session_id', params.id)
    .order('captured_at', { ascending: true })

  const all = (points ?? []) as TrackPoint[]
  const valid = all.filter((p) => p.is_valid !== false)
  const accs = valid.map((p) => Number(p.accuracy_m)).filter((n) => Number.isFinite(n))
  const stats = {
    total: all.length,
    valid: valid.length,
    rejected: all.length - valid.length,
    avg_accuracy_m: accs.length ? Math.round(accs.reduce((s, n) => s + n, 0) / accs.length) : null,
  }

  return <SessionDetail session={toTrackSession(raw) as TrackSession} points={all} stats={stats} />
}
