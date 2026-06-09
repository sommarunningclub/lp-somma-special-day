import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import LeadManager, { type ListaVipLead } from '@/components/admin/LeadManager'
import LogoutButton from '@/components/admin/LogoutButton'
import PresaleControl from '@/components/admin/PresaleControl'
import { getPresaleStatus } from '@/lib/presale'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  if (!(await isAuthenticated())) {
    redirect('/login-admin')
  }

  const supabase = createServerClient()
  const { data: leads } = await supabase
    .from('lista_vip')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = (leads ?? []) as ListaVipLead[]
  const presale = await getPresaleStatus()

  return (
    <main className="min-h-screen bg-somma-cream px-4 py-8 font-dm text-somma-black md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 md:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-bebas text-4xl tracking-wider text-somma-orange">Lista VIP — Leads</h1>
            <p className="mt-1 text-sm text-somma-black/60">{rows.length} pessoa{rows.length !== 1 ? 's' : ''} na lista</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/admin" className="w-full rounded-full border-4 border-somma-black/20 px-5 py-2.5 text-center font-bebas tracking-widest text-somma-black transition-all hover:border-somma-black hover:bg-somma-black/10 sm:w-auto">
              Propostas
            </Link>
            <Link href="/listavip" className="w-full rounded-full border-4 border-somma-blue bg-somma-blue/20 px-5 py-2.5 text-center font-bebas tracking-widest text-somma-blue transition-all hover:bg-somma-blue hover:text-somma-cream sm:w-auto">
              Ver página
            </Link>
            <LogoutButton />
          </div>
        </div>

        <PresaleControl limit={presale.limit} count={presale.count} />

        <LeadManager leads={rows} />
      </div>
    </main>
  )
}
