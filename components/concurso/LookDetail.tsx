'use client'

import { useState } from 'react'
import Link from 'next/link'
import VoteModal from './VoteModal'
import { track } from '@/lib/analytics'
import type { LookDetail as LD } from '@/lib/contest/types'

export default function LookDetail({ look, showVotes, votingOpen = true }: { look: LD; showVotes: boolean; votingOpen?: boolean }) {
  const fotos = [look.photo, look.second_photo].filter(Boolean) as string[]
  const [idx, setIdx] = useState(0)
  const [votar, setVotar] = useState(false)
  const [votos, setVotos] = useState(look.votes)

  async function compartilhar() {
    track('contest_share_clicked', { slug: look.slug })
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const data = { title: `Vote no look de ${look.display_name}`, text: `${look.display_name} tá concorrendo ao prêmio de melhor look do Esquenta Junino SOMMA. Vota lá!`, url }
    try {
      if (navigator.share) await navigator.share(data)
      else {
        await navigator.clipboard.writeText(url)
        alert('Link copiado!')
      }
    } catch {
      /* usuário cancelou */
    }
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Carrossel */}
      <div className="relative overflow-hidden rounded-3xl border-4 border-somma-black shadow-[8px_8px_0_#FF4800]">
        {fotos.length ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fotos[idx]} alt={`Look de ${look.display_name}`} className="aspect-[4/5] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center bg-white font-dm text-sm text-somma-black/30">sem foto</div>
        )}
        {fotos.length > 1 && (
          <>
            <button onClick={() => setIdx((i) => (i - 1 + fotos.length) % fotos.length)} aria-label="Anterior" className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-somma-black bg-somma-cream font-dm text-lg font-bold shadow-[2px_2px_0_#0a0a0a]">
              ‹
            </button>
            <button onClick={() => setIdx((i) => (i + 1) % fotos.length)} aria-label="Próxima" className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-2 border-somma-black bg-somma-cream font-dm text-lg font-bold shadow-[2px_2px_0_#0a0a0a]">
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {fotos.map((_, i) => (
                <span key={i} className={`h-2 w-2 rounded-full border border-somma-black ${i === idx ? 'bg-somma-orange' : 'bg-somma-cream'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Infos */}
      <div className="mt-5 text-center">
        <h1 className="font-bebas text-4xl uppercase leading-tight tracking-wide text-somma-black">{look.look_title}</h1>
        <p className="mt-1 font-dm text-base text-somma-black/70">
          {look.display_name}
          {look.city ? ` · ${look.city}` : ''}
          {look.instagram ? (
            <>
              {' · '}
              <a href={`https://instagram.com/${look.instagram}`} target="_blank" rel="noopener noreferrer" className="font-bold text-somma-orange underline-offset-2 hover:underline">
                @{look.instagram}
              </a>
            </>
          ) : null}
        </p>
        {look.look_description && <p className="mx-auto mt-3 max-w-sm font-dm text-sm italic leading-relaxed text-somma-black/70">“{look.look_description}”</p>}

        {showVotes && (
          <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border-2 border-somma-black bg-white px-5 py-3 shadow-[3px_3px_0_#0a0a0a]">
            <span className="font-bebas text-3xl text-somma-orange">{votos}</span>
            <span className="font-dm text-xs font-bold uppercase tracking-wide text-somma-black/60">
              {votos === 1 ? 'voto' : 'votos'}
              {look.rank > 0 && ` · ${look.rank}º de ${look.total}`}
            </span>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="mt-6 flex flex-col gap-3">
        {votingOpen ? (
          <button onClick={() => setVotar(true)} className="w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-4 font-bebas text-xl tracking-widest text-somma-cream shadow-[5px_5px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#0a0a0a]">
            Votar neste look
          </button>
        ) : (
          <div className="w-full rounded-2xl border-4 border-somma-black bg-somma-yellow px-3 py-4 text-center shadow-[5px_5px_0_#0a0a0a]">
            <p className="font-bebas text-xl uppercase tracking-widest text-somma-black">🏁 Votação encerrada</p>
            <p className="mt-0.5 font-dm text-xs text-somma-black/70">Obrigado por participar!</p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={compartilhar} className="flex-1 rounded-2xl border-2 border-somma-black bg-somma-cream px-3 py-3 font-bebas text-base tracking-widest text-somma-black">
            Compartilhar
          </button>
          <Link href="/esquenta-junino/concurso/looks" className="flex-1 rounded-2xl border-2 border-somma-black bg-white px-3 py-3 text-center font-bebas text-base tracking-widest text-somma-black">
            Ver todos
          </Link>
        </div>
      </div>

      {votar && (
        <VoteModal
          participant={{ id: look.id, display_name: look.display_name, look_title: look.look_title }}
          onClose={() => setVotar(false)}
          onVoted={() => setVotos((v) => v + 1)}
        />
      )}
    </div>
  )
}
