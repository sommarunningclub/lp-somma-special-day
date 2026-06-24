import type { Metadata } from 'next'
import Link from 'next/link'
import { getContestSettings } from '@/lib/contest/settings'
import ContestHero from '@/components/concurso/ContestHero'
import ContestSteps from '@/components/concurso/ContestSteps'
import ContestRules from '@/components/concurso/ContestRules'
import ContestCTA from '@/components/concurso/ContestCTA'
import Reveal from '@/components/esquenta/Reveal'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: 'Concurso Junino · Esquenta SOMMA Special Day',
  description: 'Cadastre seu look junino, publique e dispute o prêmio de melhor caracterização. O público vota e o look mais arretado leva!',
}

export default async function ConcursoPage() {
  const settings = await getContestSettings()

  return (
    <main className="min-h-[100svh] bg-somma-cream">
      <div className="px-4 pt-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/esquenta-junino" className="font-dm text-sm font-bold uppercase tracking-wide text-somma-orange underline-offset-2 hover:underline">
            ← Esquenta Junino
          </Link>
        </div>
      </div>

      <ContestHero prize={settings?.prize_title || undefined} />

      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal as="h2" className="font-bebas text-4xl leading-[1.02] tracking-tight text-somma-black sm:text-5xl">
            Como funciona
          </Reveal>
          <Reveal as="p" delay={60} className="mb-8 mt-2 font-dm text-base text-somma-black/65">
            É rapidinho e tudo pelo celular.
          </Reveal>
          <ContestSteps />
          <div className="mt-8">
            <ContestRules rules={settings?.rules_content} />
          </div>
        </div>
      </section>

      <section className="bg-somma-blue px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal as="h2" className="font-bebas text-4xl leading-[0.95] tracking-tight text-somma-cream sm:text-6xl">
            Bora pra disputa?
          </Reveal>
          <Reveal as="p" delay={60} className="mx-auto mb-8 mt-3 max-w-xl font-dm text-base text-somma-cream/80">
            Cadastra teu look, chama a galera e acompanha a corrida pelo prêmio ao vivo.
          </Reveal>
          <Reveal delay={120} className="mx-auto w-fit">
            <ContestCTA variant="hero" />
          </Reveal>
        </div>
      </section>
    </main>
  )
}
