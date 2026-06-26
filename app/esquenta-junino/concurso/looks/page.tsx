import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedLooks } from '@/lib/contest/public'
import { getContestSettings } from '@/lib/contest/settings'
import LookGallery from '@/components/concurso/LookGallery'
import { muralFechado } from '@/lib/contest/gate'
import MuralFechado from '@/components/concurso/MuralFechado'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: 'Looks · Concurso Junino SOMMA',
  description: 'Conheça os looks juninos da comunidade SOMMA e vote no seu favorito.',
}

export default async function LooksPage() {
  if (muralFechado()) return <MuralFechado origem="Mural" />

  const [looks, settings] = await Promise.all([getPublishedLooks(), getContestSettings()])
  const showVotes = settings?.show_vote_count_publicly ?? true

  return (
    <main className="min-h-[100svh] bg-somma-cream px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <Link href="/esquenta-junino/concurso" className="font-dm text-sm font-bold uppercase tracking-wide text-somma-orange underline-offset-2 hover:underline">
          ← Concurso Junino
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-bebas text-5xl leading-[0.95] tracking-tight text-somma-black sm:text-6xl">Mural dos looks</h1>
            <p className="mt-2 max-w-xl font-dm text-base leading-relaxed text-somma-black/70">Conhece a galera, curte os looks e vota no seu favorito. Um voto por pessoa! 🌽</p>
          </div>
          <div className="flex gap-2">
            <Link href="/esquenta-junino/concurso/ranking" className="rounded-xl border-2 border-somma-black bg-white px-4 py-2.5 font-bebas text-sm tracking-widest text-somma-black">
              Ver ranking
            </Link>
            <Link href="/esquenta-junino/concurso/participar" className="rounded-xl border-2 border-somma-black bg-somma-orange px-4 py-2.5 font-bebas text-sm tracking-widest text-somma-cream shadow-[2px_2px_0_#0a0a0a]">
              Participar
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <LookGallery initial={looks} showVotes={showVotes} />
        </div>
      </div>
    </main>
  )
}
