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
    <main className="min-h-screen bg-somma-cream px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Image src="/logo-special-day.svg" alt="Somma Special Day" width={120} height={60} className="h-10 w-auto" />
            <div className="min-w-0">
              <h1 className="font-bebas text-4xl tracking-wider text-somma-orange">Nova proposta</h1>
              <p className="font-dm text-sm text-somma-black/60">Preencha os dados do cliente e personalize a proposta</p>
            </div>
          </div>
          <Link
            href="/admin"
            className="w-full rounded-full border-4 border-somma-black/20 px-5 py-2.5 text-center font-bebas tracking-widest text-somma-black transition-all hover:border-somma-black hover:bg-somma-black/10 sm:w-auto"
          >
            Voltar
          </Link>
        </div>
        <PropostaForm mode="create" />
      </div>
    </main>
  )
}
