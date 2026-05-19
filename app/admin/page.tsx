import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

interface Lead {
  id: string
  nome: string
  email: string
  cpf: string
  telefone: string
  created_at: string
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>
}) {
  const params = await searchParams
  if (params.key !== process.env.ADMIN_SECRET_KEY) {
    redirect('/')
  }

  const supabase = createServerClient()
  const { data: leads } = await supabase
    .from('vip_leads')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = (leads ?? []) as Lead[]

  return (
    <main className="min-h-screen bg-somma-black text-somma-white p-8 font-dm">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-bebas text-4xl text-somma-yellow tracking-wider">
              Lista VIP — Admin
            </h1>
            <p className="text-somma-white/60 text-sm mt-1">
              {rows.length} pessoa{rows.length !== 1 ? 's' : ''} na lista
            </p>
          </div>
          <a
            href={`/api/admin/export?key=${params.key}`}
            className="bg-somma-orange hover:bg-somma-orange/90 text-white font-bebas text-lg tracking-widest px-6 py-3 rounded-full transition"
          >
            Exportar CSV
          </a>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-somma-blue/30">
          <table className="w-full text-sm">
            <thead className="bg-somma-blue/30 text-somma-yellow font-bebas text-base tracking-wide">
              <tr>
                {['Nome', 'E-mail', 'CPF', 'Telefone', 'Data'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((lead, i) => (
                <tr
                  key={lead.id}
                  className={i % 2 === 0 ? 'bg-somma-black' : 'bg-somma-blue/10'}
                >
                  <td className="px-4 py-3">{lead.nome}</td>
                  <td className="px-4 py-3">{lead.email}</td>
                  <td className="px-4 py-3">{lead.cpf}</td>
                  <td className="px-4 py-3">{lead.telefone}</td>
                  <td className="px-4 py-3 text-somma-white/50">
                    {new Date(lead.created_at).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-somma-white/40">
                    Nenhum lead ainda.
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
