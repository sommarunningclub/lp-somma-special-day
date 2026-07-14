import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { isAuthenticated } from '@/lib/auth'
import type { DayUseOrder } from '@/lib/dayuse/types'
import DayUseAdminDashboard from '@/components/admin/dayuse/DayUseAdminDashboard'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function AdminDayUsePage() {
  if (!(await isAuthenticated())) redirect('/login-admin')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
  const { data } = await supabase
    .from('dayuse_orders')
    .select('*')
    .order('created_at', { ascending: false })

  const orders = (data ?? []) as DayUseOrder[]

  return (
    <main className="min-h-screen bg-somma-cream px-4 py-8 font-dm text-somma-black md:px-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-dm text-xs font-bold uppercase tracking-[0.3em] text-somma-orange">Admin</p>
            <h1 className="font-bebas text-4xl uppercase tracking-wide text-somma-black sm:text-5xl">Day Use</h1>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border-2 border-somma-black bg-white px-4 py-2 font-dm text-sm font-bold text-somma-black"
          >
            ← Admin
          </Link>
        </div>
        <DayUseAdminDashboard orders={orders} />
      </div>
    </main>
  )
}
