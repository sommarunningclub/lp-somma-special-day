'use client'

import { useEffect, useRef, useState } from 'react'
import { ESQUENTA } from '@/lib/esquenta-constants'

const STORAGE_KEY = 'esquenta_concurso_voto'
const PAGE_URL = 'https://specialday.sommaclub.com.br/esquenta-junino'
const WPP_MSG = `Bora pro Esquenta Somma Special Day comigo? 🌽🤠 Vem caracterizado pro concurso junino que tem prêmio! Confirma aqui: ${PAGE_URL}`

export default function ConcursoVotacao() {
  const [votos, setVotos] = useState<number | null>(null)
  const [votou, setVotou] = useState(false)
  const [modal, setModal] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function carregar() {
    try {
      const r = await fetch('/api/concurso/votos', { cache: 'no-store' })
      const d = await r.json()
      if (typeof d.votos === 'number') setVotos(d.votos)
    } catch {
      /* ignora */
    }
  }

  useEffect(() => {
    setVotou(typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1')
    carregar()
    // contador ao vivo (polling)
    pollRef.current = setInterval(carregar, 8000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  async function handleVotar() {
    if (votou) {
      setModal(true)
      return
    }
    setEnviando(true)
    try {
      const r = await fetch('/api/concurso/votos', { method: 'POST' })
      const d = await r.json()
      if (typeof d.votos === 'number') setVotos(d.votos)
      localStorage.setItem(STORAGE_KEY, '1')
      setVotou(true)
      setModal(true)
    } catch {
      /* mantém estado */
    } finally {
      setEnviando(false)
    }
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(PAGE_URL)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* ignora */
    }
  }

  return (
    <div className="rounded-2xl border-4 border-somma-black bg-somma-black p-6 text-center shadow-[6px_6px_0_#FF4800] sm:p-7">
      <p className="font-dm text-[11px] font-bold uppercase tracking-[0.25em] text-somma-yellow">Votação ao vivo</p>
      <p className="mt-2 font-dm text-sm leading-snug text-somma-cream/80">Quem tá na pilha de vir caracterizado?</p>

      <div className="mt-4 flex items-end justify-center gap-2">
        <span className="font-bebas text-6xl leading-none text-somma-orange tabular-nums sm:text-7xl">
          {votos === null ? '··' : votos}
        </span>
        <span className="mb-1.5 flex items-center gap-1.5 font-dm text-xs font-semibold uppercase tracking-wide text-somma-cream/60">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#1faa59]" />
          já tão na pilha
        </span>
      </div>

      <button
        onClick={handleVotar}
        disabled={enviando}
        className={`mt-5 w-full rounded-2xl border-4 px-3 py-4 font-bebas text-lg tracking-widest shadow-[4px_4px_0_#FF4800] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#FF4800] disabled:opacity-60 sm:text-xl ${
          votou ? 'border-somma-cream bg-somma-cream text-somma-black' : 'border-somma-orange bg-somma-orange text-somma-cream'
        }`}
      >
        {enviando ? 'CONFIRMANDO...' : votou ? 'Você tá na pilha! Chamar amigo 🤠' : 'Eu vou caracterizado! 🌽'}
      </button>

      {modal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" onClick={() => setModal(false)}>
          <div className="w-full max-w-sm rounded-3xl border-4 border-somma-black bg-somma-cream p-6 text-center shadow-[8px_8px_0_#FF4800] sm:p-8" onClick={(e) => e.stopPropagation()}>
            <p className="text-4xl">🎉</p>
            <h3 className="mt-2 font-bebas text-3xl uppercase tracking-wide text-somma-black">Tá confirmado!</h3>
            <p className="mt-2 font-dm text-sm leading-relaxed text-somma-black/65">
              Agora chama um amigo pra entrar no clima junino com você. Quanto mais gente, melhor o arraiá. 🌽
            </p>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(WPP_MSG)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-4 border-somma-black bg-[#25D366] px-3 py-3.5 font-bebas text-lg tracking-widest text-white shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#0a0a0a]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" className="h-5 w-5" />
              Chamar amigo no WhatsApp
            </a>
            <button
              onClick={copiarLink}
              className="mt-2 w-full rounded-2xl border-2 border-somma-black/20 bg-white px-3 py-3 font-bebas text-base tracking-widest text-somma-black transition-colors hover:border-somma-black/40"
            >
              {copiado ? 'Link copiado! ✅' : 'Copiar link'}
            </button>
            <button onClick={() => setModal(false)} className="mt-3 font-dm text-xs font-bold uppercase tracking-wide text-somma-black/50 hover:text-somma-black">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
