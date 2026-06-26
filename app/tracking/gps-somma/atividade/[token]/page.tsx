import type { Viewport } from 'next'
import { notFound } from 'next/navigation'
import { findSessionByToken, toTrackSession } from '@/lib/tracking/session'
import { trackingDb } from '@/lib/tracking/db'
import { computeSplits, computeElevation } from '@/lib/tracking/analytics'
import ActivityReport from '@/components/tracking/ActivityReport'
import type { TrackPoint, TrackSession } from '@/lib/tracking/types'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
}

export default async function AtividadePage({ params }: { params: { token: string } }) {
  const raw = await findSessionByToken(params.token)
  if (!raw) notFound()
  const db = trackingDb()

  const { data: pts } = await db
    .from('gps_tracking_points')
    .select('latitude, longitude, altitude_m, captured_at, is_valid')
    .eq('session_id', raw.id)
    .eq('is_valid', true)
    .order('captured_at', { ascending: true })

  const points = (pts ?? []) as TrackPoint[]
  const splits = computeSplits(points)
  const elevation = computeElevation(points)

  const session = toTrackSession(raw) as TrackSession
  if (raw.watch_photo_url) {
    const signed = await db.storage.from('gps-watch').createSignedUrl(raw.watch_photo_url, 60 * 60 * 6)
    session.watch_photo_signed = signed.data?.signedUrl ?? null
  }

  return <ActivityReport token={params.token} session={session} points={points} splits={splits} elevation={elevation} />
}
