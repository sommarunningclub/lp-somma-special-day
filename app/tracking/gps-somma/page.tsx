import type { Metadata, Viewport } from 'next'
import TrackingEntry from '@/components/tracking/TrackingEntry'

export const metadata: Metadata = {
  title: 'SOMMA GPS Tracking',
  description: 'Registre seu corre ao vivo no mapa: distância, tempo e ritmo em tempo real.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
}

export default function GpsSommaPage() {
  return <TrackingEntry />
}
