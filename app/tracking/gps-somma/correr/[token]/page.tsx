import type { Viewport } from 'next'
import { notFound } from 'next/navigation'
import { findSessionByToken, toTrackSession } from '@/lib/tracking/session'
import { trackingDb } from '@/lib/tracking/db'
import TrackingRun from '@/components/tracking/TrackingRun'
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

export default async function CorrerPage({ params }: { params: { token: string } }) {
  const raw = await findSessionByToken(params.token)
  if (!raw) notFound()

  const { data: pts } = await trackingDb()
    .from('gps_tracking_points')
    .select('latitude, longitude, accuracy_m, captured_at')
    .eq('session_id', raw.id)
    .eq('is_valid', true)
    .order('captured_at', { ascending: true })

  return <TrackingRun token={params.token} session={toTrackSession(raw) as TrackSession} initialPoints={(pts ?? []) as TrackPoint[]} />
}
