import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import PropostaForm from '@/components/proposta-admin/PropostaForm'
import type { Proposta } from '@/lib/types/proposta'

export const dynamic = 'force-dynamic'

export default async function EditarPropostaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  if (!(await isAuthenticated())) {
    redirect('/login-admin')
  }
  const { id } = await params

  const supabase = createServerClient()
  const { data } = await supabase.from('propostas').select('*').eq('id', id).single()
  if (!data) notFound()
  const proposta = data as Proposta

  return (
    <main className="min-h-screen bg-somma-black px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo-special-day.svg" alt="Somma Special Day" width={120} height={60} className="h-10 w-auto" />
            <div>
              <h1 className="font-bebas text-4xl tracking-wider text-somma-yellow">Editar proposta</h1>
              <p className="font-dm text-sm text-somma-cream/60">
                Cliente: <span className="text-somma-cream">{proposta.cliente_nome}</span>
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="rounded-full border-4 border-somma-cream/20 px-5 py-2.5 font-bebas tracking-widest text-somma-cream transition-all hover:border-somma-cream hover:bg-somma-cream/10"
          >
            Voltar
          </Link>
        </div>
        <PropostaForm mode="edit" initial={proposta} />
      </div>
    </main>
  )
}
