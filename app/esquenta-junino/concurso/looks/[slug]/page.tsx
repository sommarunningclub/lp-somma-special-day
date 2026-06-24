import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLookBySlug, getLookOgImage } from '@/lib/contest/public'
import { getContestSettings } from '@/lib/contest/settings'
import LookDetail from '@/components/concurso/LookDetail'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const look = await getLookBySlug(params.slug)
  if (!look) return { title: 'Look não encontrado · Concurso Junino SOMMA' }
  const og = await getLookOgImage(params.slug)
  const title = `Vote no look de ${look.display_name} no Concurso Junino SOMMA`
  const description = `${look.display_name} está concorrendo ao prêmio de melhor look do Esquenta Junino.`
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', images: og ? [{ url: og, width: 800, height: 1000 }] : [] },
    twitter: { card: 'summary_large_image', title, description, images: og ? [og] : [] },
  }
}

export default async function LookPage({ params }: { params: { slug: string } }) {
  const [look, settings] = await Promise.all([getLookBySlug(params.slug), getContestSettings()])
  if (!look) notFound()
  const showVotes = settings?.show_vote_count_publicly ?? true

  return (
    <main className="min-h-[100svh] bg-somma-cream px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link href="/esquenta-junino/concurso/looks" className="font-dm text-sm font-bold uppercase tracking-wide text-somma-orange underline-offset-2 hover:underline">
          ← Todos os looks
        </Link>
        <div className="mt-6">
          <LookDetail look={look} showVotes={showVotes} />
        </div>
      </div>
    </main>
  )
}
