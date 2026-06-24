'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ContestSettings } from '@/lib/contest/types'

const inp = 'w-full rounded-xl border-2 border-somma-black/15 bg-white px-3 py-2 font-dm text-sm focus:border-somma-blue focus:outline-none'
const lbl = 'mb-1 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/60'

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-somma-black bg-white px-4 py-3 text-left">
      <span className="font-dm text-sm font-bold text-somma-black">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-[#1faa59]' : 'bg-somma-black/20'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}

const localDt = (v: string | null) => (v ? new Date(v).toISOString().slice(0, 16) : '')

export default function ContestSettingsForm({ settings }: { settings: ContestSettings }) {
  const router = useRouter()
  const [s, setS] = useState(settings)
  const [salvo, setSalvo] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (patch: Partial<ContestSettings>) => setS((p) => ({ ...p, ...patch }))

  async function salvar() {
    setBusy(true)
    setSalvo(false)
    const r = await fetch('/api/admin/concurso/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_active: s.is_active,
        is_registration_open: s.is_registration_open,
        is_voting_open: s.is_voting_open,
        show_vote_count_publicly: s.show_vote_count_publicly,
        max_photos: s.max_photos,
        contest_name: s.contest_name,
        prize_title: s.prize_title,
        rules_content: s.rules_content,
        registration_starts_at: s.registration_starts_at,
        registration_ends_at: s.registration_ends_at,
        voting_starts_at: s.voting_starts_at,
        voting_ends_at: s.voting_ends_at,
      }),
    })
    setBusy(false)
    if (r.ok) {
      setSalvo(true)
      router.refresh()
    } else alert('Falha ao salvar configurações.')
  }

  return (
    <div className="space-y-4 rounded-3xl border-4 border-somma-black bg-somma-cream p-5 shadow-[6px_6px_0_#0a0a0a]">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Toggle label="Concurso ativo" on={s.is_active} onChange={(v) => set({ is_active: v })} />
        <Toggle label="Inscrições abertas" on={s.is_registration_open} onChange={(v) => set({ is_registration_open: v })} />
        <Toggle label="Votação aberta" on={s.is_voting_open} onChange={(v) => set({ is_voting_open: v })} />
        <Toggle label="Mostrar votos ao público" on={s.show_vote_count_publicly} onChange={(v) => set({ show_vote_count_publicly: v })} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={lbl}>Nome do concurso</label>
          <input className={inp} value={s.contest_name} onChange={(e) => set({ contest_name: e.target.value })} />
        </div>
        <div>
          <label className={lbl}>Máx. de fotos (1-2)</label>
          <input type="number" min={1} max={2} className={inp} value={s.max_photos} onChange={(e) => set({ max_photos: Number(e.target.value) })} />
        </div>
      </div>

      <div>
        <label className={lbl}>Prêmio</label>
        <input className={inp} value={s.prize_title} onChange={(e) => set({ prize_title: e.target.value })} placeholder="Ex: Kit SOMMA + brindes dos parceiros" />
      </div>
      <div>
        <label className={lbl}>Regras (texto exibido na página)</label>
        <textarea rows={4} className={`${inp} resize-none`} value={s.rules_content} onChange={(e) => set({ rules_content: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={lbl}>Inscrição: início</label>
          <input type="datetime-local" className={inp} value={localDt(s.registration_starts_at)} onChange={(e) => set({ registration_starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
        </div>
        <div>
          <label className={lbl}>Inscrição: fim</label>
          <input type="datetime-local" className={inp} value={localDt(s.registration_ends_at)} onChange={(e) => set({ registration_ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
        </div>
        <div>
          <label className={lbl}>Votação: início</label>
          <input type="datetime-local" className={inp} value={localDt(s.voting_starts_at)} onChange={(e) => set({ voting_starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
        </div>
        <div>
          <label className={lbl}>Votação: fim</label>
          <input type="datetime-local" className={inp} value={localDt(s.voting_ends_at)} onChange={(e) => set({ voting_ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={salvar} disabled={busy} className="rounded-2xl border-4 border-somma-black bg-somma-orange px-6 py-3 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] disabled:opacity-60">
          {busy ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÕES'}
        </button>
        {salvo && <span className="font-dm text-sm font-bold text-[#1faa59]">Salvo ✓</span>}
      </div>
    </div>
  )
}
