'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminParticipantTable from './AdminParticipantTable'
import ContestSettingsForm from './ContestSettingsForm'
import type { AdminParticipant, ContestSettings } from '@/lib/contest/types'

export default function AdminContestDashboard({ participants, settings }: { participants: AdminParticipant[]; settings: ContestSettings }) {
  const router = useRouter()
  const [aba, setAba] = useState<'inscricoes' | 'config'>('inscricoes')
  const [resetando, setResetando] = useState(false)

  const total = participants.length
  const publicados = participants.filter((p) => p.status === 'published').length
  const votos = participants.reduce((s, p) => s + p.votes, 0)

  async function zerarVotos() {
    if (votos === 0) {
      alert('Já está zerado.')
      return
    }
    const txt = window.prompt(
      `Vai apagar TODOS os ${votos} votos do concurso. Essa ação não tem volta.\n\nDigite ZERAR pra confirmar:`,
    )
    if (txt !== 'ZERAR') return
    setResetando(true)
    try {
      const r = await fetch('/api/admin/concurso/votos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'X-Confirm': 'ZERAR' },
        body: JSON.stringify({}),
      })
      const d = await r.json().catch(() => null)
      if (r.ok) {
        alert(`Pronto. ${d?.removed ?? 0} voto(s) removido(s).`)
        router.refresh()
      } else {
        alert(d?.error ?? 'Falha ao zerar votos.')
      }
    } finally {
      setResetando(false)
    }
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { l: 'Inscritos', v: total },
          { l: 'Publicados', v: publicados },
          { l: 'Votos', v: votos },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border-4 border-somma-black bg-somma-cream p-4 text-center shadow-[4px_4px_0_#0a0a0a]">
            <p className="font-bebas text-4xl leading-none text-somma-orange">{s.v}</p>
            <p className="mt-1 font-dm text-xs font-bold uppercase tracking-wide text-somma-black/60">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(['inscricoes', 'config'] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)} className={`rounded-xl border-2 px-4 py-2 font-bebas tracking-widest ${aba === a ? 'border-somma-black bg-somma-orange text-somma-cream' : 'border-somma-black/20 bg-white text-somma-black/60'}`}>
            {a === 'inscricoes' ? 'Inscrições' : 'Configurações'}
          </button>
        ))}
        <button
          type="button"
          onClick={zerarVotos}
          disabled={resetando || votos === 0}
          className="ml-auto rounded-xl border-2 border-red-600 bg-red-50 px-4 py-2 font-bebas tracking-widest text-red-700 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:hover:bg-red-50 disabled:hover:text-red-700"
          title={votos === 0 ? 'Não há votos pra zerar' : 'Zerar todos os votos do concurso'}
        >
          {resetando ? 'Zerando…' : '⚠ Zerar votos'}
        </button>
      </div>

      {aba === 'inscricoes' ? <AdminParticipantTable participants={participants} /> : <ContestSettingsForm settings={settings} />}
    </div>
  )
}
