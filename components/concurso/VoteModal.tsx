'use client'

import { useState } from 'react'
import { formatCpf } from '@/lib/contest/cpf'
import { track } from '@/lib/analytics'

export default function VoteModal({
  participant,
  onClose,
  onVoted,
}: {
  participant: { id: string; display_name: string; look_title: string }
  onClose: () => void
  onVoted: (id: string) => void
}) {
  const [cpf, setCpf] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  async function votar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (!confirm) {
      setErro('Você precisa confirmar a declaração.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/concurso/votar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: participant.id, cpf, confirm, website }),
      })
      const j = await res.json()
      if (res.ok) {
        track('contest_vote_completed', { participant_id: participant.id })
        setSucesso(true)
        onVoted(participant.id)
      } else {
        setErro(j.error ?? 'Este voto não pôde ser concluído.')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-somma-black/70 px-4 py-8 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="relative w-full max-w-sm rounded-3xl border-4 border-somma-black bg-somma-cream p-6 shadow-[8px_8px_0_#FF4800]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Fechar" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border-2 border-somma-black bg-white font-dm text-lg font-bold text-somma-black">
          ×
        </button>

        {sucesso ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1faa59]/15 text-3xl">✅</div>
            <p className="mt-4 font-bebas text-3xl uppercase tracking-wide text-somma-black">Voto registrado!</p>
            <p className="mt-1 font-dm text-sm text-somma-black/65">Valeu por votar no look de {participant.display_name}. 🧡</p>
            <button onClick={onClose} className="mt-5 w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-3 font-bebas text-lg tracking-widest text-somma-cream shadow-[3px_3px_0_#0a0a0a]">
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={votar} noValidate>
            <p className="font-dm text-[11px] font-bold uppercase tracking-[0.25em] text-somma-orange">Votar no look</p>
            <h3 className="mt-1 font-bebas text-2xl uppercase leading-tight tracking-wide text-somma-black">{participant.look_title}</h3>
            <p className="font-dm text-sm text-somma-black/60">de {participant.display_name}</p>

            <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="absolute left-[-9999px] h-0 w-0 opacity-0" aria-hidden="true" />

            <label className="mt-4 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70">Seu CPF</label>
            <input
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              className="mt-1.5 w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20"
            />

            <label className="mt-3 flex items-start gap-2 font-dm text-sm text-somma-black/80">
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-somma-orange" />
              <span>Confirmo que estou votando uma única vez no Concurso Junino SOMMA.</span>
            </label>

            {erro && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center font-dm text-sm text-red-600">{erro}</p>}

            <button type="submit" disabled={loading} className="mt-4 w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-3.5 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] disabled:opacity-60">
              {loading ? 'REGISTRANDO...' : 'CONFIRMAR VOTO'}
            </button>
            <p className="mt-2 text-center font-dm text-[11px] text-somma-black/45">Seu CPF é usado só pra garantir 1 voto por pessoa. Não guardamos ele em texto.</p>
          </form>
        )}
      </div>
    </div>
  )
}
