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
    <main className="min-h-screen bg-somma-cream px-4 py-8 font-dm text-somma-black md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 md:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Image src="/logo-special-day.svg" alt="Somma Special Day" width={120} height={60} className="h-10 w-auto" />
            <div className="min-w-0">
              <h1 className="font-bebas text-4xl tracking-wider text-somma-orange">Propostas</h1>
              <p className="mt-0.5 text-sm text-somma-black/60">
                {propostas.length} proposta{propostas.length !== 1 ? 's' : ''} cadastrada{propostas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/admin/leads"
              className="w-full rounded-full border-4 border-somma-blue bg-somma-blue/20 px-5 py-3 text-center font-bebas tracking-widest text-somma-blue transition-all hover:bg-somma-blue hover:text-somma-cream sm:w-auto"
            >
              Lista VIP
            </Link>
            <Link
              href="/admin/nova"
              className="w-full rounded-full border-4 border-somma-black bg-somma-orange px-7 py-3.5 text-center font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#0a0a0a] sm:w-auto sm:shadow-[5px_5px_0_#0a0a0a]"
            >
              + Nova proposta
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-4 md:hidden">
          {propostas.map((p) => (
            <article key={p.id} className="rounded-2xl border-4 border-somma-black bg-somma-black/70 p-5 shadow-[4px_4px_0_#005EFF]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words font-bebas text-2xl tracking-wider text-somma-cream">{p.cliente_nome}</h2>
                  {p.cliente_empresa && <p className="mt-1 break-words text-xs text-somma-cream/50">{p.cliente_empresa}</p>}
                </div>
                {p.cota_recomendada && (
                  <span className="shrink-0 rounded-full border-2 border-somma-orange bg-somma-orange/20 px-3 py-1 font-bebas text-xs tracking-widest text-somma-orange">
                    {p.cota_recomendada.toUpperCase()}
                  </span>
                )}
              </div>
              <code className="mt-4 block break-all rounded-xl bg-somma-cream/10 px-3 py-2 text-xs font-bold text-somma-yellow">/proposta/{p.slug}</code>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <a href={`/proposta/${p.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-full border-2 border-somma-cream/30 px-4 py-2 text-center font-bebas text-xs tracking-widest text-somma-cream/80">
                  Visualizar
                </a>
                <Link href={`/admin/${p.id}/editar`} className="rounded-full border-2 border-somma-yellow bg-somma-yellow/10 px-4 py-2 text-center font-bebas text-xs tracking-widest text-somma-yellow">
                  Editar
                </Link>
              </div>
            </article>
          ))}
          {propostas.length === 0 && (
            <div className="rounded-2xl border-4 border-somma-black bg-somma-black/70 px-5 py-12 text-center text-somma-cream/50 shadow-[4px_4px_0_#005EFF]">
              Nenhuma proposta ainda.
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto rounded-3xl border-4 border-somma-black shadow-[6px_6px_0_#005EFF] md:block">
          <table className="w-full min-w-[760px] text-sm">
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
