import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedLooks } from '@/lib/contest/public'
import { getContestSettings } from '@/lib/contest/settings'
import LiveRankingTrack from '@/components/concurso/LiveRankingTrack'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: 'Ranking · Concurso Junino SOMMA',
  description: 'A corrida pelo prêmio de melhor look junino. Acompanhe quem está na frente ao vivo.',
}

export default async function RankingPage() {
  const [looks, settings] = await Promise.all([getPublishedLooks(), getContestSettings()])
  const showVotes = settings?.show_vote_count_publicly ?? true

  return (
    <main className="min-h-[100svh] bg-somma-blue px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Link href="/esquenta-junino/concurso" className="font-dm text-sm font-bold uppercase tracking-wide text-somma-yellow underline-offset-2 hover:underline">
          ← Concurso Junino
        </Link>
        <h1 className="mt-4 font-bebas text-5xl leading-[0.95] tracking-tight text-somma-cream sm:text-7xl">
          A corrida pelo <span className="text-somma-yellow">prêmio</span>
        </h1>
        <p className="mt-3 max-w-xl font-dm text-base leading-relaxed text-somma-cream/80">
          Os looks correndo no Eixão rumo à vitória. Quanto mais votos, mais perto da chegada. Atualiza sozinho! 🏁
        </p>

        <div className="mt-8 flex gap-2">
          <Link href="/esquenta-junino/concurso/looks" className="rounded-xl border-2 border-somma-cream/40 px-4 py-2.5 font-bebas text-sm tracking-widest text-somma-cream">
            Ver looks e votar
          </Link>
          <Link href="/esquenta-junino/concurso/participar" className="rounded-xl border-2 border-somma-black bg-somma-orange px-4 py-2.5 font-bebas text-sm tracking-widest text-somma-cream shadow-[2px_2px_0_#0a0a0a]">
            Participar
          </Link>
        </div>

        <div className="mt-8">
          <LiveRankingTrack initial={looks} showVotes={showVotes} />
        </div>
      </div>
    </main>
  )
}
