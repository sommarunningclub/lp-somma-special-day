import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/auth'
import { getAllParticipantsAdmin } from '@/lib/contest/admin'
import { getContestSettings } from '@/lib/contest/settings'
import AdminContestDashboard from '@/components/concurso/AdminContestDashboard'
import type { ContestSettings } from '@/lib/contest/types'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const DEFAULTS: ContestSettings = {
  id: 1,
  contest_name: 'Concurso Junino SOMMA',
  is_registration_open: true,
  is_voting_open: true,
  registration_starts_at: null,
  registration_ends_at: null,
  voting_starts_at: null,
  voting_ends_at: null,
  prize_title: '',
  rules_content: '',
  max_photos: 2,
  show_vote_count_publicly: true,
  is_active: true,
}

export default async function AdminConcursoPage() {
  if (!(await isAuthenticated())) redirect('/login-admin')

  const [participants, settings] = await Promise.all([getAllParticipantsAdmin(), getContestSettings()])

  return (
    <main className="min-h-screen bg-somma-cream px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-dm text-xs font-bold uppercase tracking-[0.3em] text-somma-orange">Admin</p>
            <h1 className="font-bebas text-4xl uppercase tracking-wide text-somma-black sm:text-5xl">Concurso Junino</h1>
          </div>
          <Link href="/admin" className="rounded-xl border-2 border-somma-black bg-white px-4 py-2 font-dm text-sm font-bold text-somma-black">← Admin</Link>
        </div>
        <AdminContestDashboard participants={participants} settings={settings ?? DEFAULTS} />
      </div>
    </main>
  )
}
