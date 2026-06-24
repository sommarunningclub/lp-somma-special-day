'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { AdminParticipant, ContestStatus } from '@/lib/contest/types'

const STATUS: Record<string, string> = {
  draft: 'bg-somma-yellow/30 text-somma-black/70',
  published: 'bg-[#1faa59]/15 text-[#1faa59]',
  hidden: 'bg-somma-black/10 text-somma-black/60',
  disqualified: 'bg-red-100 text-red-600',
}
const FILTROS: (ContestStatus | 'todos')[] = ['todos', 'published', 'draft', 'hidden', 'disqualified']

export default function AdminParticipantTable({ participants }: { participants: AdminParticipant[] }) {
  const router = useRouter()
  const [filtro, setFiltro] = useState<ContestStatus | 'todos'>('todos')
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<AdminParticipant | null>(null)
  const [foto, setFoto] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const lista = useMemo(() => {
    let arr = participants
    if (filtro !== 'todos') arr = arr.filter((p) => p.status === filtro)
    const q = busca.trim().toLowerCase()
    if (q) arr = arr.filter((p) => [p.display_name, p.full_name, p.email].some((v) => (v ?? '').toLowerCase().includes(q)))
    return arr
  }, [participants, filtro, busca])

  async function acao(id: string, body: Record<string, unknown>) {
    setBusy(true)
    const r = await fetch(`/api/admin/concurso/participante/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setBusy(false)
    if (r.ok) {
      setEditando(null)
      router.refresh()
    } else alert('Falha na ação.')
  }
  async function excluir(id: string) {
    if (!confirm('Excluir esta inscrição e as fotos?')) return
    setBusy(true)
    const r = await fetch(`/api/admin/concurso/participante/${id}`, { method: 'DELETE' })
    setBusy(false)
    if (r.ok) router.refresh()
    else alert('Falha ao excluir.')
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((f) => (
            <button key={f} onClick={() => setFiltro(f)} className={`rounded-full border-2 px-3 py-1 font-dm text-xs font-bold uppercase ${filtro === f ? 'border-somma-black bg-somma-orange text-somma-cream' : 'border-somma-black/20 bg-white text-somma-black/60'}`}>
              {f === 'todos' ? `Todos (${participants.length})` : f}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar nome / e-mail" className="rounded-xl border-2 border-somma-black/15 bg-white px-3 py-2 font-dm text-sm focus:border-somma-blue focus:outline-none" />
          <a href="/api/admin/concurso/export?type=participants" className="rounded-xl border-2 border-somma-black bg-white px-3 py-2 font-dm text-xs font-bold uppercase">CSV inscritos</a>
          <a href="/api/admin/concurso/export?type=votes" className="rounded-xl border-2 border-somma-black bg-white px-3 py-2 font-dm text-xs font-bold uppercase">CSV votos</a>
        </div>
      </div>

      <div className="space-y-2">
        {lista.length === 0 && <p className="rounded-2xl border-2 border-dashed border-somma-black/20 bg-white/50 p-8 text-center font-dm text-sm text-somma-black/50">Nenhum participante.</p>}
        {lista.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-somma-black bg-somma-cream p-3 shadow-[3px_3px_0_#0a0a0a]">
            <button onClick={() => setFoto(p.main_photo_signed)} className="shrink-0">
              {p.main_photo_signed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.main_photo_signed} alt="" className="h-14 w-14 rounded-xl border-2 border-somma-black object-cover" />
              ) : (
                <span className="block h-14 w-14 rounded-xl border-2 border-somma-black bg-white" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-dm text-sm font-bold text-somma-black">
                {p.display_name} <span className="font-normal text-somma-black/50">· {p.look_title}</span>
              </p>
              <p className="truncate font-dm text-xs text-somma-black/55">
                {p.email}
                {p.whatsapp ? ` · ${p.whatsapp}` : ''}
                {p.city ? ` · ${p.city}` : ''}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 font-dm text-[10px] font-bold uppercase ${STATUS[p.status]}`}>{p.status}</span>
                <span className="font-dm text-xs font-bold text-somma-black/70">{p.votes} votos</span>
                <Link href={`/esquenta-junino/concurso/looks/${p.slug}`} className="font-dm text-xs font-bold text-somma-blue underline-offset-2 hover:underline">ver</Link>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p.status !== 'published' && <button disabled={busy} onClick={() => acao(p.id, { status: 'published' })} className="rounded-lg border-2 border-somma-black bg-[#1faa59]/15 px-2 py-1 font-dm text-[11px] font-bold text-[#1faa59]">Publicar</button>}
              {p.status !== 'hidden' && <button disabled={busy} onClick={() => acao(p.id, { status: 'hidden' })} className="rounded-lg border-2 border-somma-black bg-white px-2 py-1 font-dm text-[11px] font-bold text-somma-black/70">Esconder</button>}
              {p.status !== 'disqualified' && <button disabled={busy} onClick={() => acao(p.id, { status: 'disqualified' })} className="rounded-lg border-2 border-somma-black bg-red-50 px-2 py-1 font-dm text-[11px] font-bold text-red-600">Desq.</button>}
              <button disabled={busy} onClick={() => setEditando(p)} className="rounded-lg border-2 border-somma-black bg-white px-2 py-1 font-dm text-[11px] font-bold text-somma-black/70">Editar</button>
              <button disabled={busy} onClick={() => excluir(p.id)} className="rounded-lg border-2 border-somma-black bg-somma-black px-2 py-1 font-dm text-[11px] font-bold text-somma-cream">Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox de foto */}
      {foto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-somma-black/80 p-6" onClick={() => setFoto(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto} alt="" className="max-h-[85vh] max-w-full rounded-2xl border-4 border-somma-cream object-contain" />
        </div>
      )}

      {/* Editar */}
      {editando && (
        <EditModal p={editando} onClose={() => setEditando(null)} onSave={(fields) => acao(editando.id, fields)} busy={busy} />
      )}
    </div>
  )
}

function EditModal({ p, onClose, onSave, busy }: { p: AdminParticipant; onClose: () => void; onSave: (f: Record<string, string>) => void; busy: boolean }) {
  const [f, setF] = useState({ display_name: p.display_name, look_title: p.look_title, look_description: p.look_description ?? '', city: p.city ?? '', instagram_handle: p.instagram_handle ?? '' })
  const inp = 'w-full rounded-xl border-2 border-somma-black/15 bg-white px-3 py-2 font-dm text-sm focus:border-somma-blue focus:outline-none'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-somma-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md space-y-3 rounded-3xl border-4 border-somma-black bg-somma-cream p-5 shadow-[8px_8px_0_#FF4800]" onClick={(e) => e.stopPropagation()}>
        <p className="font-bebas text-2xl uppercase tracking-wide text-somma-black">Editar participante</p>
        <input className={inp} value={f.display_name} onChange={(e) => setF({ ...f, display_name: e.target.value })} placeholder="Nome de exibição" />
        <input className={inp} value={f.look_title} onChange={(e) => setF({ ...f, look_title: e.target.value })} placeholder="Título do look" />
        <textarea className={`${inp} resize-none`} rows={3} value={f.look_description} onChange={(e) => setF({ ...f, look_description: e.target.value })} placeholder="Descrição" />
        <div className="grid grid-cols-2 gap-2">
          <input className={inp} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="Cidade" />
          <input className={inp} value={f.instagram_handle} onChange={(e) => setF({ ...f, instagram_handle: e.target.value })} placeholder="Instagram" />
        </div>
        <div className="flex gap-2 pt-1">
          <button disabled={busy} onClick={() => onSave(f)} className="flex-1 rounded-xl border-4 border-somma-black bg-somma-orange px-3 py-2.5 font-bebas tracking-widest text-somma-cream shadow-[3px_3px_0_#0a0a0a]">Salvar</button>
          <button onClick={onClose} className="rounded-xl border-2 border-somma-black bg-white px-4 py-2.5 font-bebas tracking-widest text-somma-black">Cancelar</button>
        </div>
      </div>
    </div>
  )
}
