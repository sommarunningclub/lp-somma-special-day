'use client'

import Link from 'next/link'
import type { LookCard } from '@/lib/contest/types'

const MEDAL = ['🥇', '🥈', '🥉']

export default function RankingList({ rows, showVotes }: { rows: LookCard[]; showVotes: boolean }) {
  return (
    <ol className="space-y-2">
      {rows.map((l, i) => (
        <li key={l.id}>
          <Link
            href={`/esquenta-junino/concurso/looks/${l.slug}`}
            className="flex items-center gap-3 rounded-2xl border-2 border-somma-black bg-somma-cream p-3 shadow-[3px_3px_0_#0a0a0a] transition-transform hover:translate-x-[1px]"
          >
            <span className="w-8 shrink-0 text-center font-bebas text-2xl text-somma-black">{i < 3 ? MEDAL[i] : `${i + 1}º`}</span>
            {l.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={l.photo} alt="" className="h-12 w-12 shrink-0 rounded-full border-2 border-somma-black object-cover" />
            ) : (
              <span className="h-12 w-12 shrink-0 rounded-full border-2 border-somma-black bg-white" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-dm text-sm font-bold text-somma-black">{l.display_name}</span>
              <span className="block truncate font-dm text-xs text-somma-black/55">{l.look_title}</span>
            </span>
            {showVotes && (
              <span className="shrink-0 rounded-full border-2 border-somma-black bg-somma-orange px-3 py-1 font-bebas text-sm tracking-wide text-somma-cream">
                {l.votes}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ol>
  )
}
