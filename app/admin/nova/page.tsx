import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import PropostaForm from '@/components/proposta-admin/PropostaForm'

export const dynamic = 'force-dynamic'

export default async function NovaPropostaPage() {
  if (!(await isAuthenticated())) {
    redirect('/login-admin')
  }
  return (
    <main className="min-h-screen bg-somma-black px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo-special-day.svg" alt="Somma Special Day" width={120} height={60} className="h-10 w-auto" />
            <div>
              <h1 className="font-bebas text-4xl tracking-wider text-somma-yellow">Nova proposta</h1>
              <p className="font-dm text-sm text-somma-cream/60">Preencha os dados do cliente e personalize a proposta</p>
            </div>
          </div>
          <Link
            href="/admin"
            className="rounded-full border-4 border-somma-cream/20 px-5 py-2.5 font-bebas tracking-widest text-somma-cream transition-all hover:border-somma-cream hover:bg-somma-cream/10"
          >
            Voltar
          </Link>
        </div>
        <PropostaForm mode="create" />
      </div>
    </main>
  )
}
