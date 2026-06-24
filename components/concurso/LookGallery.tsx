'use client'

import { useEffect, useMemo, useState } from 'react'
import LookCard from './LookCard'
import VoteModal from './VoteModal'
import type { LookCard as L } from '@/lib/contest/types'

type Ordem = 'votos' | 'recentes' | 'aleatorio'

// Recalcula o rank (por votos) — usado pro selo "Na liderança" continuar certo após o poll.
function rerank(list: L[]): L[] {
  const ord = [...list].sort((a, b) => b.votes - a.votes)
  const pos = new Map(ord.map((l, i) => [l.id, i + 1]))
  return list.map((l) => ({ ...l, rank: pos.get(l.id) ?? l.rank }))
}
function hash(s: string): number {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

export default function LookGallery({ initial, showVotes }: { initial: L[]; showVotes: boolean }) {
  const [looks, setLooks] = useState<L[]>(() => rerank(initial))
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState<Ordem>('votos')
  const [cidade, setCidade] = useState('')
  const [limite, setLimite] = useState(12)
  const [seed, setSeed] = useState(1)
  const [votar, setVotar] = useState<L | null>(null)

  // Atualização "ao vivo" das contagens (poll a cada 8s).
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch('/api/concurso/leaderboard')
        const j = await r.json()
        const m = new Map<string, number>((j.participants ?? []).map((p: { id: string; votes: number }) => [p.id, p.votes]))
        setLooks((prev) => rerank(prev.map((l) => ({ ...l, votes: m.get(l.id) ?? l.votes }))))
      } catch {
        /* mantém estado atual */
      }
    }, 8000)
    return () => clearInterval(id)
  }, [])

  const cidades = useMemo(() => Array.from(new Set(looks.map((l) => l.city).filter(Boolean))) as string[], [looks])

  const filtradas = useMemo(() => {
    let arr = looks
    const q = busca.trim().toLowerCase()
    if (q) arr = arr.filter((l) => l.display_name.toLowerCase().includes(q) || l.look_title.toLowerCase().includes(q))
    if (cidade) arr = arr.filter((l) => l.city === cidade)
    arr = [...arr]
    if (ordem === 'votos') arr.sort((a, b) => b.votes - a.votes)
    else if (ordem === 'recentes') arr.sort((a, b) => (Date.parse(b.published_at ?? '') || 0) - (Date.parse(a.published_at ?? '') || 0))
    else arr.sort((a, b) => (hash(a.id + seed) % 100000) - (hash(b.id + seed) % 100000))
    return arr
  }, [looks, busca, cidade, ordem, seed])

  const visiveis = filtradas.slice(0, limite)

  function onVoted(id: string) {
    setLooks((prev) => rerank(prev.map((l) => (l.id === id ? { ...l, votes: l.votes + 1 } : l))))
  }

  return (
    <div>
      {/* Controles */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou look..."
          className="w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none"
        />
        <select
          value={ordem}
          onChange={(e) => {
            setOrdem(e.target.value as Ordem)
            if (e.target.value === 'aleatorio') setSeed((s) => s + 1)
          }}
          className="rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-sm font-semibold text-somma-black focus:border-somma-blue focus:outline-none"
        >
          <option value="votos">Mais votados</option>
          <option value="recentes">Mais recentes</option>
          <option value="aleatorio">Aleatório</option>
        </select>
        {cidades.length > 0 && (
          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-sm font-semibold text-somma-black focus:border-somma-blue focus:outline-none"
          >
            <option value="">Todas as cidades</option>
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Grade / vazio */}
      {filtradas.length === 0 ? (
        <div className="rounded-3xl border-4 border-dashed border-somma-black/20 bg-white/50 p-12 text-center">
          <p className="font-bebas text-3xl uppercase tracking-wide text-somma-black">
            {looks.length === 0 ? 'Ainda não tem look publicado' : 'Nada encontrado'}
          </p>
          <p className="mt-1 font-dm text-sm text-somma-black/60">
            {looks.length === 0 ? 'Seja o primeiro a entrar na disputa!' : 'Tenta outra busca ou filtro.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visiveis.map((l) => (
              <LookCard key={l.id} look={l} showVotes={showVotes} onVote={setVotar} />
            ))}
          </div>
          {limite < filtradas.length && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setLimite((n) => n + 12)}
                className="rounded-2xl border-4 border-somma-black bg-somma-cream px-8 py-3 font-bebas text-lg tracking-widest text-somma-black shadow-[4px_4px_0_#0a0a0a]"
              >
                Ver mais ({filtradas.length - limite})
              </button>
            </div>
          )}
        </>
      )}

      {votar && <VoteModal participant={votar} onClose={() => setVotar(null)} onVoted={onVoted} />}
    </div>
  )
}
