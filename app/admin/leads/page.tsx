import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/admin/LogoutButton'

interface Lead {
  id: string
  nome: string
  email: string
  cpf: string
  telefone: string
  created_at: string
}

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  if (!(await isAuthenticated())) {
    redirect('/login-admin')
  }

  const supabase = createServerClient()
  const { data: leads } = await supabase
    .from('vip_leads')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = (leads ?? []) as Lead[]

  return (
    <main className="min-h-screen bg-somma-black p-4 font-dm text-somma-cream md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-8">
          <div>
            <h1 className="font-bebas text-4xl tracking-wider text-somma-yellow">Lista VIP — Leads</h1>
            <p className="mt-1 text-sm text-somma-cream/60">{rows.length} pessoa{rows.length !== 1 ? 's' : ''} na lista</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="rounded-full border-4 border-somma-cream/20 px-5 py-2.5 font-bebas tracking-widest text-somma-cream transition-all hover:border-somma-cream hover:bg-somma-cream/10">
              Propostas
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-somma-blue/30">
          <table className="w-full text-sm">
            <thead className="bg-somma-blue/30 font-bebas text-base tracking-wide text-somma-yellow">
              <tr>
                {['Nome', 'E-mail', 'CPF', 'Telefone', 'Data'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((lead, i) => (
                <tr key={lead.id} className={i % 2 === 0 ? 'bg-somma-black' : 'bg-somma-blue/10'}>
                  <td className="px-4 py-3">{lead.nome}</td>
                  <td className="px-4 py-3">{lead.email}</td>
                  <td className="px-4 py-3">{lead.cpf}</td>
                  <td className="px-4 py-3">{lead.telefone}</td>
                  <td className="px-4 py-3 text-somma-cream/50">{new Date(lead.created_at).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-somma-cream/40">Nenhum lead ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
