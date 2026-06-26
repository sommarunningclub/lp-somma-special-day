import type { Metadata, Viewport } from 'next'

// PWA: SOMMA Connect roda como app instalável (standalone) em todo /tracking/gps-somma.
export const metadata: Metadata = {
  applicationName: 'SOMMA Connect',
  title: { default: 'SOMMA Connect', template: '%s · SOMMA Connect' },
  manifest: '/somma-connect.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'SOMMA Connect' },
  icons: { icon: '/icon-192.png', apple: '/apple-touch-icon.png' },
  formatDetection: { telephone: false },
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

export default function SommaConnectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
