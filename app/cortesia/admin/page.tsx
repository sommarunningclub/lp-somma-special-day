import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { isCortesiaBloqueada } from '@/lib/cortesia/settings'
import { CORTESIA_LIMITE } from '@/lib/validations/cortesia'
import LogoutButton from '@/components/admin/LogoutButton'
import RefreshButton from '@/components/admin/RefreshButton'
import CortesiaBlockToggle from '@/components/special-day/cortesia/CortesiaBlockToggle'
import CortesiaAdminDashboard, {
  type CortesiaLead,
} from '@/components/special-day/cortesia/CortesiaAdminDashboard'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Formata no fuso do evento (Brasil) no servidor, evitando divergência de
// hidratação e mostrando sempre o horário local correto.
function fmtBR(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function CortesiaAdminPage() {
  if (!(await isAuthenticated())) redirect('/login-admin')

  const supabase = createServerClient()
  const [{ data }, bloqueada] = await Promise.all([
    supabase.from('cortesia').select('*').order('created_at', { ascending: false }),
    isCortesiaBloqueada(),
  ])

  const leads: CortesiaLead[] = (data ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    nome: (r.nome as string) ?? '',
    email: (r.email as string) ?? '',
    telefone: (r.telefone as string) ?? '',
    data_nascimento: (r.data_nascimento as string) ?? '',
    genero: (r.genero as string) ?? '',
    cpf: (r.cpf as string) ?? '',
    created_at_fmt: r.created_at ? fmtBR(String(r.created_at)) : '',
  }))

  return (
    <main className="min-h-screen bg-somma-cream px-4 py-8 font-dm text-somma-black md:px-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-5 md:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Image
              src="/logo-special-day.svg"
              alt="Somma Special Day"
              width={120}
              height={60}
              className="h-10 w-auto"
            />
            <div className="min-w-0">
              <h1 className="font-bebas text-4xl tracking-wider text-somma-orange">Cortesias</h1>
              <p className="mt-0.5 text-sm text-somma-black/60">
                {leads.length} cadastro{leads.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <RefreshButton />
            <Link
              href="/admin"
              className="w-full rounded-full border-4 border-somma-black/20 px-5 py-2.5 text-center font-bebas tracking-widest text-somma-black transition-all hover:border-somma-black hover:bg-somma-black/10 sm:w-auto"
            >
              ← Admin
            </Link>
            <Link
              href="/cortesia"
              className="w-full rounded-full border-4 border-somma-blue bg-somma-blue/20 px-5 py-2.5 text-center font-bebas tracking-widest text-somma-blue transition-all hover:bg-somma-blue hover:text-somma-cream sm:w-auto"
            >
              Ver formulário
            </Link>
            <LogoutButton />
          </div>
        </div>

        <CortesiaBlockToggle
          initialBlocked={bloqueada}
          total={leads.length}
          limite={CORTESIA_LIMITE}
        />

        <CortesiaAdminDashboard leads={leads} />
      </div>
    </main>
  )
}
