'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import RankingList from './RankingList'
import { track as analytics } from '@/lib/analytics'
import type { LookCard } from '@/lib/contest/types'

function rerank(list: LookCard[]): LookCard[] {
  const ord = [...list].sort((a, b) => b.votes - a.votes)
  return ord.map((l, i) => ({ ...l, rank: i + 1 }))
}

const MEDAL = ['🥇', '🥈', '🥉']
const TRACK_MAX = 12

export default function LiveRankingTrack({ initial, showVotes }: { initial: LookCard[]; showVotes: boolean }) {
  const [looks, setLooks] = useState<LookCard[]>(() => rerank(initial))

  useEffect(() => {
    analytics('contest_ranking_viewed')
    const id = setInterval(async () => {
      try {
        const r = await fetch('/api/concurso/leaderboard')
        const j = await r.json()
        const m = new Map<string, number>((j.participants ?? []).map((p: { id: string; votes: number }) => [p.id, p.votes]))
        setLooks((prev) => rerank(prev.map((l) => ({ ...l, votes: m.get(l.id) ?? l.votes }))))
      } catch {
        /* mantém */
      }
    }, 6000)
    return () => clearInterval(id)
  }, [])

  const stats = useMemo(() => {
    const total = looks.reduce((s, l) => s + l.votes, 0)
    const lider = looks[0]
    const segundo = looks[1]
    return { total, lider, gap: lider && segundo ? lider.votes - segundo.votes : lider ? lider.votes : 0, n: looks.length }
  }, [looks])

  const maxVotes = Math.max(1, ...looks.map((l) => l.votes))
  const pista = looks.slice(0, TRACK_MAX)

  if (looks.length === 0) {
    return (
      <div className="rounded-3xl border-4 border-dashed border-somma-cream/30 bg-somma-cream/5 p-12 text-center">
        <p className="font-bebas text-3xl uppercase tracking-wide text-somma-cream">A corrida ainda não começou</p>
        <p className="mt-1 font-dm text-sm text-somma-cream/70">Assim que tiver look publicado, a disputa aparece aqui.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Bloco de stats */}
      <div className="rounded-3xl border-4 border-somma-black bg-somma-orange p-5 text-somma-cream shadow-[8px_8px_0_#0a0a0a] sm:p-6">
        <p className="font-dm text-xs font-bold uppercase tracking-[0.3em] text-somma-cream/80">Corrida pelo prêmio</p>
        <h2 className="font-bebas text-3xl uppercase leading-none tracking-wide sm:text-4xl">Quem está na frente agora?</h2>
        {stats.lider && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-somma-black/20 p-3">
              <p className="font-dm text-[10px] font-bold uppercase tracking-wide text-somma-cream/70">Liderando 👑</p>
              <p className="truncate font-bebas text-xl">{stats.lider.display_name}</p>
            </div>
            {showVotes && (
              <div className="rounded-2xl bg-somma-black/20 p-3">
                <p className="font-dm text-[10px] font-bold uppercase tracking-wide text-somma-cream/70">Votos do líder</p>
                <p className="font-bebas text-xl">{stats.lider.votes}</p>
              </div>
            )}
            {showVotes && (
              <div className="rounded-2xl bg-somma-black/20 p-3">
                <p className="font-dm text-[10px] font-bold uppercase tracking-wide text-somma-cream/70">Vantagem p/ 2º</p>
                <p className="font-bebas text-xl">{stats.gap}</p>
              </div>
            )}
            <div className="rounded-2xl bg-somma-black/20 p-3">
              <p className="font-dm text-[10px] font-bold uppercase tracking-wide text-somma-cream/70">{showVotes ? 'Total de votos' : 'Participantes'}</p>
              <p className="font-bebas text-xl">{showVotes ? stats.total : stats.n}</p>
            </div>
          </div>
        )}
      </div>

      {/* Pista do Eixão */}
      <div className="overflow-hidden rounded-3xl border-4 border-somma-black bg-somma-cream p-4 shadow-[8px_8px_0_#FF4800] sm:p-6">
        <div className="mb-3 flex items-center justify-between font-dm text-[11px] font-bold uppercase tracking-widest text-somma-black/50">
          <span>Largada · 106 Sul</span>
          <span>Chegada · 🏁</span>
        </div>
        <div className="space-y-2.5">
          {pista.map((l, i) => {
            const pct = 4 + (l.votes / maxVotes) * 82
            const top3 = i < 3
            const av = top3 ? 56 : 40
            return (
              <div key={l.id} className="relative h-16 overflow-hidden rounded-2xl border-2 border-somma-black" style={{ background: 'repeating-linear-gradient(90deg,#0a0a0a 0 28px,#141414 28px 56px)' }}>
                {/* linha central tracejada */}
                <div className="pointer-events-none absolute left-0 right-10 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-somma-yellow/60" />
                {/* chegada */}
                <div className="absolute right-0 top-0 flex h-full w-9 items-center justify-center bg-somma-cream/10 text-lg">🏁</div>
                {/* posição */}
                <span className="absolute left-2 top-1/2 -translate-y-1/2 font-bebas text-base text-somma-cream/70">{i < 3 ? MEDAL[i] : `${i + 1}º`}</span>
                {/* corredor */}
                <Link
                  href={`/esquenta-junino/concurso/looks/${l.slug}`}
                  className="absolute top-1/2 z-10 flex -translate-y-1/2 items-center gap-2"
                  style={{ left: `${pct}%`, transition: 'left 0.8s cubic-bezier(.22,.61,.36,1)' }}
                  title={`${l.display_name}${showVotes ? ` · ${l.votes} votos` : ''}`}
                >
                  <span className="relative">
                    {l.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.photo}
                        alt={l.display_name}
                        style={{ width: av, height: av }}
                        className={`rounded-full border-[3px] object-cover ${top3 ? 'border-somma-yellow shadow-[0_0_14px_rgba(253,183,22,0.9)]' : 'border-somma-cream'}`}
                      />
                    ) : (
                      <span style={{ width: av, height: av }} className="block rounded-full border-[3px] border-somma-cream bg-somma-orange" />
                    )}
                    {i === 0 && <span className="absolute -right-1 -top-2 text-lg">👑</span>}
                  </span>
                  {showVotes && (
                    <span className="rounded-full border-2 border-somma-black bg-somma-cream px-2 py-0.5 font-bebas text-xs text-somma-black shadow-[2px_2px_0_#0a0a0a]">{l.votes}</span>
                  )}
                </Link>
              </div>
            )
          })}
        </div>
        {looks.length > TRACK_MAX && (
          <p className="mt-3 text-center font-dm text-xs text-somma-black/50">+ {looks.length - TRACK_MAX} na disputa (lista completa abaixo)</p>
        )}
      </div>

      {/* Lista completa (acessibilidade / leitura rápida) */}
      <div>
        <h3 className="mb-3 font-bebas text-2xl uppercase tracking-wide text-somma-cream">Classificação completa</h3>
        <RankingList rows={looks} showVotes={showVotes} />
      </div>
    </div>
  )
}
