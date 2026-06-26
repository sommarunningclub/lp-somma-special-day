import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import AdminTrackingDashboard from '@/components/tracking/AdminTrackingDashboard'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export const metadata: Metadata = { title: 'Painel' }

export default async function GpsAdminPage() {
  if (!(await isAuthenticated())) redirect('/login-admin')
  return <AdminTrackingDashboard />
}
