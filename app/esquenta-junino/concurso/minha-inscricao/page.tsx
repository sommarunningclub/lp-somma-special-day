import type { Metadata } from 'next'
import Link from 'next/link'
import { getMyParticipant } from '@/lib/contest/me'
import AccessForm from '@/components/concurso/AccessForm'
import ParticipantDashboard from '@/components/concurso/ParticipantDashboard'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: 'Minha inscrição · Concurso Junino SOMMA',
  robots: { index: false, follow: false },
}

export default async function MinhaInscricaoPage() {
  const me = await getMyParticipant()

  return (
    <main className="min-h-[100svh] bg-somma-cream px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link href="/esquenta-junino/concurso" className="font-dm text-sm font-bold uppercase tracking-wide text-somma-orange underline-offset-2 hover:underline">
          ← Concurso Junino
        </Link>
        <div className="mt-6">{me ? <ParticipantDashboard p={me} /> : <AccessForm />}</div>
      </div>
    </main>
  )
}
