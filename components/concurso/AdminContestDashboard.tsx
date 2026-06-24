'use client'

import { useState } from 'react'
import AdminParticipantTable from './AdminParticipantTable'
import ContestSettingsForm from './ContestSettingsForm'
import type { AdminParticipant, ContestSettings } from '@/lib/contest/types'

export default function AdminContestDashboard({ participants, settings }: { participants: AdminParticipant[]; settings: ContestSettings }) {
  const [aba, setAba] = useState<'inscricoes' | 'config'>('inscricoes')

  const total = participants.length
  const publicados = participants.filter((p) => p.status === 'published').length
  const votos = participants.reduce((s, p) => s + p.votes, 0)

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

      <div className="mb-5 flex gap-2">
        {(['inscricoes', 'config'] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)} className={`rounded-xl border-2 px-4 py-2 font-bebas tracking-widest ${aba === a ? 'border-somma-black bg-somma-orange text-somma-cream' : 'border-somma-black/20 bg-white text-somma-black/60'}`}>
            {a === 'inscricoes' ? 'Inscrições' : 'Configurações'}
          </button>
        ))}
      </div>

      {aba === 'inscricoes' ? <AdminParticipantTable participants={participants} /> : <ContestSettingsForm settings={settings} />}
    </div>
  )
}
