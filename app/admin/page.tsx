import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import PropostaTableRow from '@/components/proposta-admin/PropostaTableRow'
import LogoutButton from '@/components/admin/LogoutButton'
import type { Proposta } from '@/lib/types/proposta'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    redirect('/login-admin')
  }

  const supabase = createServerClient()
  const { data } = await supabase
    .from('propostas')
    .select('*')
    .order('created_at', { ascending: false })

  const propostas = (data ?? []) as Proposta[]

  return (
    <main className="min-h-screen bg-somma-black px-4 py-8 font-dm text-somma-cream md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo-special-day.svg" alt="Somma Special Day" width={120} height={60} className="h-10 w-auto" />
            <div>
              <h1 className="font-bebas text-4xl tracking-wider text-somma-yellow">Propostas</h1>
              <p className="mt-0.5 text-sm text-somma-cream/60">
                {propostas.length} proposta{propostas.length !== 1 ? 's' : ''} cadastrada{propostas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/nova"
              className="rounded-full border-4 border-somma-black bg-somma-orange px-7 py-3.5 font-bebas text-lg tracking-widest text-somma-cream shadow-[5px_5px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#0a0a0a]"
            >
              + Nova proposta
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border-4 border-somma-black shadow-[6px_6px_0_#005EFF]">
          <table className="w-full text-sm">
            <thead className="bg-somma-blue font-bebas text-base tracking-widest text-somma-cream">
              <tr>
                <th className="px-5 py-4 text-left">Cliente</th>
                <th className="px-5 py-4 text-left">Slug</th>
                <th className="px-5 py-4 text-left">Recomendada</th>
                <th className="px-5 py-4 text-left">Validade</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-somma-black/80">
              {propostas.map(p => (
                <PropostaTableRow key={p.id} proposta={p} />
              ))}
              {propostas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-somma-cream/40">
                    Nenhuma proposta ainda. Clique em <strong className="text-somma-orange">+ Nova proposta</strong> para criar a primeira.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
