import type { Metadata } from 'next'
import Link from 'next/link'
import { getContestSettings, inscricaoAberta } from '@/lib/contest/settings'
import { getParticipantId } from '@/lib/contest/session'
import ParticipantForm from '@/components/concurso/ParticipantForm'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: 'Participar · Concurso Junino SOMMA',
  description: 'Cadastre seu look junino e dispute o prêmio de melhor caracterização do Esquenta SOMMA.',
  robots: { index: false, follow: false },
}

export default async function ParticiparPage() {
  const settings = await getContestSettings()
  const aberta = inscricaoAberta(settings)
  const jaLogado = !!(await getParticipantId())

  return (
    <main className="min-h-[100svh] bg-somma-cream px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link href="/esquenta-junino/concurso" className="font-dm text-sm font-bold uppercase tracking-wide text-somma-orange underline-offset-2 hover:underline">
          ← Concurso Junino
        </Link>
        <h1 className="mt-4 font-bebas text-5xl leading-[0.95] tracking-tight text-somma-black sm:text-6xl">Bora pro concurso</h1>
        <p className="mt-3 font-dm text-base leading-relaxed text-somma-black/70">
          Capricha no look, manda até duas fotos e publica sua participação. O público vota e o look mais arretado leva o prêmio. 🌽
        </p>

        {jaLogado && (
          <Link href="/esquenta-junino/concurso/minha-inscricao" className="mt-5 block rounded-2xl border-4 border-somma-black bg-white px-4 py-3 text-center font-dm text-sm font-bold text-somma-black shadow-[4px_4px_0_#0a0a0a]">
            Você já tem uma inscrição. Ir pra minha área →
          </Link>
        )}

        <div className="mt-7">
          {aberta ? (
            <div className="rounded-3xl border-4 border-somma-black bg-white/60 p-5 shadow-[8px_8px_0_#FF4800] sm:p-7">
              <ParticipantForm maxPhotos={settings?.max_photos ?? 2} />
            </div>
          ) : (
            <div className="rounded-3xl border-4 border-somma-black bg-white p-7 text-center shadow-[8px_8px_0_#FF4800]">
              <p className="font-bebas text-3xl uppercase tracking-wide text-somma-black">Inscrições fechadas</p>
              <p className="mt-2 font-dm text-sm text-somma-black/65">As inscrições do concurso não estão abertas agora. Mas você já pode conhecer e votar nos looks!</p>
              <Link href="/esquenta-junino/concurso/looks" className="mt-5 inline-block rounded-2xl border-4 border-somma-black bg-somma-orange px-6 py-3 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a]">
                Ver looks e votar
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
