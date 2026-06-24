'use client'

import Link from 'next/link'
import type { LookCard as LookCardType } from '@/lib/contest/types'

export default function LookCard({ look, showVotes, onVote }: { look: LookCardType; showVotes: boolean; onVote: (l: LookCardType) => void }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border-4 border-somma-black bg-somma-cream shadow-[6px_6px_0_#0a0a0a]">
      <div className="relative">
        {look.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={look.photo} alt={`Look de ${look.display_name}`} loading="lazy" className="aspect-[4/5] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center bg-white font-dm text-sm text-somma-black/30">sem foto</div>
        )}
        {look.rank === 1 && showVotes && look.votes > 0 && (
          <span className="absolute left-2 top-2 rounded-full border-2 border-somma-black bg-somma-yellow px-2.5 py-1 font-bebas text-xs tracking-widest text-somma-black shadow-[2px_2px_0_#0a0a0a]">
            👑 NA LIDERANÇA
          </span>
        )}
        {showVotes && (
          <span className="absolute right-2 top-2 rounded-full border-2 border-somma-black bg-somma-orange px-2.5 py-1 font-bebas text-sm tracking-wide text-somma-cream shadow-[2px_2px_0_#0a0a0a]">
            {look.votes} {look.votes === 1 ? 'voto' : 'votos'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="font-bebas text-xl uppercase leading-tight tracking-wide text-somma-black">{look.look_title}</p>
        <p className="font-dm text-sm text-somma-black/60">
          {look.display_name}
          {look.city ? ` · ${look.city}` : ''}
        </p>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/esquenta-junino/concurso/looks/${look.slug}`}
            className="flex-1 rounded-xl border-2 border-somma-black bg-white px-3 py-2.5 text-center font-bebas text-sm tracking-widest text-somma-black transition-colors hover:bg-somma-black hover:text-somma-cream"
          >
            Ver look
          </Link>
          <button
            onClick={() => onVote(look)}
            className="flex-1 rounded-xl border-2 border-somma-black bg-somma-orange px-3 py-2.5 text-center font-bebas text-sm tracking-widest text-somma-cream shadow-[2px_2px_0_#0a0a0a] transition-transform hover:translate-y-[1px]"
          >
            Votar
          </button>
        </div>
      </div>
    </div>
  )
}
