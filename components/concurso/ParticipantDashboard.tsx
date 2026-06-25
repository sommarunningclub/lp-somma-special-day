'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { edicaoSchema, type EdicaoInput } from '@/lib/contest/schemas'
import { compressImage } from './image'
import { track } from '@/lib/analytics'
import type { ParticipantWithSigned } from '@/lib/contest/types'

const input =
  'w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20'
const label = 'mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70'

const STATUS: Record<string, { txt: string; cls: string }> = {
  draft: { txt: 'Rascunho', cls: 'bg-somma-yellow/25 text-somma-black/70' },
  published: { txt: 'Publicado', cls: 'bg-[#1faa59]/15 text-[#1faa59]' },
  hidden: { txt: 'Escondido', cls: 'bg-somma-black/10 text-somma-black/60' },
  disqualified: { txt: 'Desqualificado', cls: 'bg-red-100 text-red-600' },
}

export default function ParticipantDashboard({ p }: { p: ParticipantWithSigned }) {
  const router = useRouter()
  const [msg, setMsg] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const mainRef = useRef<HTMLInputElement>(null)
  const secondRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EdicaoInput>({
    resolver: zodResolver(edicaoSchema),
    defaultValues: {
      display_name: p.display_name ?? '',
      instagram: p.instagram_handle ?? '',
      city: p.city ?? '',
      look_title: p.look_title ?? '',
      look_description: p.look_description ?? '',
    },
  })

  const faltaCompletar = !p.main_photo_signed || !p.look_title || !p.display_name

  const status = STATUS[p.status] ?? STATUS.draft
  const podeEditar = p.status !== 'disqualified'

  async function salvar(data: EdicaoInput) {
    setErro(null)
    setMsg(null)
    const res = await fetch('/api/concurso/inscricao', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setMsg('Alterações salvas!')
      router.refresh()
    } else {
      const j = await res.json().catch(() => ({}))
      setErro(j.error ?? 'Não foi possível salvar.')
    }
  }

  async function trocarFoto(file: File, slot: 'main' | 'second') {
    setBusy(true)
    setErro(null)
    try {
      const d = await compressImage(file, '4:5')
      const res = await fetch('/api/concurso/inscricao', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: p.display_name,
          instagram: p.instagram_handle ?? '',
          city: p.city ?? '',
          look_title: p.look_title,
          look_description: p.look_description ?? '',
          [slot === 'main' ? 'main_foto' : 'second_foto']: d,
        }),
      })
      if (res.ok) router.refresh()
      else setErro('Não foi possível trocar a foto.')
    } finally {
      setBusy(false)
    }
  }

  async function removerSegunda() {
    setBusy(true)
    const res = await fetch('/api/concurso/inscricao', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: p.display_name,
        instagram: p.instagram_handle ?? '',
        city: p.city ?? '',
        look_title: p.look_title,
        look_description: p.look_description ?? '',
        remove_second: true,
      }),
    })
    setBusy(false)
    if (res.ok) router.refresh()
  }

  async function publicar(publish: boolean) {
    setErro(null)
    setBusy(true)
    const res = await fetch('/api/concurso/inscricao/publicar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publish }),
    })
    setBusy(false)
    const j = await res.json().catch(() => ({}))
    if (res.ok) {
      if (publish) track('contest_entry_published')
      router.refresh()
    } else setErro(j.error ?? 'Não foi possível atualizar.')
  }

  async function excluir() {
    if (!confirm('Tem certeza? Isso apaga sua inscrição e as fotos.')) return
    setBusy(true)
    const res = await fetch('/api/concurso/inscricao', { method: 'DELETE' })
    setBusy(false)
    if (res.ok) router.push('/esquenta-junino/concurso')
    else setErro('Não foi possível excluir.')
  }

  async function sair() {
    await fetch('/api/concurso/sair', { method: 'POST' })
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-bebas text-3xl uppercase tracking-wide text-somma-black">Sua inscrição</span>
          <span className={`rounded-full px-3 py-1 font-dm text-xs font-bold uppercase tracking-wide ${status.cls}`}>{status.txt}</span>
        </div>
        <button onClick={sair} className="font-dm text-sm font-bold uppercase tracking-wide text-somma-black/50 underline-offset-2 hover:underline">
          Sair
        </button>
      </div>

      {p.status === 'published' && (
        <Link
          href={`/esquenta-junino/concurso/looks/${p.slug}`}
          className="block rounded-2xl border-4 border-somma-black bg-[#1faa59]/10 px-4 py-3 text-center font-dm text-sm font-bold text-[#1faa59]"
        >
          Sua página está no ar 🎉 Ver / compartilhar →
        </Link>
      )}

      {p.status === 'draft' && faltaCompletar && (
        <div className="rounded-2xl border-4 border-somma-yellow bg-somma-yellow/15 px-4 py-3 text-left">
          <p className="font-bebas text-base uppercase tracking-wide text-somma-black">Falta completar pra disputar!</p>
          <ul className="mt-1.5 list-inside list-disc font-dm text-sm text-somma-black/75">
            {!p.main_photo_signed && <li>Envia pelo menos a <strong>foto principal</strong> do look 👇</li>}
            {!p.look_title && <li>Coloca um <strong>título</strong> pro look (ex: "Caipira Raiz")</li>}
            {!p.display_name && <li>Confirma o <strong>nome de exibição</strong> que vai aparecer no mural</li>}
          </ul>
          <p className="mt-2 font-dm text-xs text-somma-black/55">
            Quando tudo estiver pronto, clica em <strong>Publicar participação</strong> no fim da página.
          </p>
        </div>
      )}

      {/* Fotos */}
      <div className="rounded-3xl border-4 border-somma-black bg-somma-cream p-5 shadow-[6px_6px_0_#FF4800]">
        <p className="mb-3 font-bebas text-xl uppercase tracking-wide text-somma-black">Fotos do look</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="overflow-hidden rounded-2xl border-4 border-somma-black">
              {p.main_photo_signed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.main_photo_signed} alt="Foto principal" className="aspect-[4/5] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-white font-dm text-sm text-somma-black/40">Sem foto</div>
              )}
            </div>
            {podeEditar && (
              <button onClick={() => mainRef.current?.click()} disabled={busy} className="mt-2 w-full font-dm text-xs font-bold uppercase tracking-wide text-somma-orange underline-offset-2 hover:underline">
                Trocar principal
              </button>
            )}
            <input ref={mainRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.currentTarget.files?.[0]; if (f) trocarFoto(f, 'main'); e.currentTarget.value = '' }} />
          </div>
          <div>
            <div className="overflow-hidden rounded-2xl border-4 border-somma-black">
              {p.second_photo_signed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.second_photo_signed} alt="Segunda foto" className="aspect-[4/5] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-white font-dm text-xs text-somma-black/40">Sem segunda foto</div>
              )}
            </div>
            {podeEditar && (
              <div className="mt-2 flex items-center justify-between gap-2">
                <button onClick={() => secondRef.current?.click()} disabled={busy} className="font-dm text-xs font-bold uppercase tracking-wide text-somma-orange underline-offset-2 hover:underline">
                  {p.second_photo_signed ? 'Trocar' : 'Adicionar'}
                </button>
                {p.second_photo_signed && (
                  <button onClick={removerSegunda} disabled={busy} className="font-dm text-xs font-bold uppercase tracking-wide text-red-600 underline-offset-2 hover:underline">
                    Remover
                  </button>
                )}
              </div>
            )}
            <input ref={secondRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.currentTarget.files?.[0]; if (f) trocarFoto(f, 'second'); e.currentTarget.value = '' }} />
          </div>
        </div>
      </div>

      {/* Dados */}
      {podeEditar && (
        <form onSubmit={handleSubmit(salvar)} className="space-y-4 rounded-3xl border-4 border-somma-black bg-somma-cream p-5 shadow-[6px_6px_0_#0a0a0a]">
          <p className="font-bebas text-xl uppercase tracking-wide text-somma-black">Dados do look</p>
          <div>
            <label className={label}>Nome de exibição</label>
            <input {...register('display_name')} className={input} />
            {errors.display_name && <p className="mt-1 font-dm text-xs font-semibold text-red-600">{errors.display_name.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Instagram</label>
              <input {...register('instagram')} className={input} placeholder="@seuuser" />
            </div>
            <div>
              <label className={label}>Cidade</label>
              <input {...register('city')} className={input} />
            </div>
          </div>
          <div>
            <label className={label}>Título do look</label>
            <input {...register('look_title')} className={input} />
            {errors.look_title && <p className="mt-1 font-dm text-xs font-semibold text-red-600">{errors.look_title.message}</p>}
          </div>
          <div>
            <label className={label}>Descrição</label>
            <textarea rows={3} maxLength={500} {...register('look_description')} className={`${input} resize-none`} />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl border-4 border-somma-black bg-somma-blue px-3 py-3 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] disabled:opacity-60">
            {isSubmitting ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
          </button>
        </form>
      )}

      {msg && <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-center font-dm text-sm text-green-700">{msg}</p>}
      {erro && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center font-dm text-sm text-red-600">{erro}</p>}

      {/* Publicar / excluir */}
      {podeEditar && (
        <div className="flex flex-col gap-3 rounded-3xl border-4 border-somma-black bg-somma-cream p-5 shadow-[6px_6px_0_#FDB716] sm:flex-row sm:items-center sm:justify-between">
          {p.status === 'published' ? (
            <>
              <p className="font-dm text-sm text-somma-black/70">Sua inscrição está pública no mural.</p>
              <button onClick={() => publicar(false)} disabled={busy} className="rounded-2xl border-4 border-somma-black bg-white px-5 py-3 font-bebas text-base tracking-widest text-somma-black shadow-[3px_3px_0_#0a0a0a] disabled:opacity-60">
                Despublicar
              </button>
            </>
          ) : (
            <>
              <p className="font-dm text-sm text-somma-black/70">Pronto pra disputar? Publica pra aparecer no mural e receber votos.</p>
              <button onClick={() => publicar(true)} disabled={busy} className="rounded-2xl border-4 border-somma-black bg-somma-orange px-5 py-3 font-bebas text-base tracking-widest text-somma-cream shadow-[3px_3px_0_#0a0a0a] disabled:opacity-60">
                Publicar participação
              </button>
            </>
          )}
        </div>
      )}

      <button onClick={excluir} disabled={busy} className="w-full font-dm text-sm font-bold uppercase tracking-wide text-red-600 underline-offset-2 hover:underline">
        Excluir minha inscrição
      </button>
    </div>
  )
}
