'use client'

import { useEffect, useRef, useState } from 'react'
import { REACAO_EMOJIS, getCorreioFingerprint } from '@/lib/correio-fingerprint'

type Reacoes = { counts: Record<string, number>; minhas: string[] }

type Comentario = {
  id: string
  autor_nome: string | null
  autor_instagram: string | null
  texto: string
  oculto: boolean
  created_at: string
}

interface Props {
  correioId: string
  admin?: boolean
}

function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'agora'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// Web Component do emoji-picker-element. Lazy import só quando abre.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'emoji-picker': any
    }
  }
}

export default function CorreioInteracoes({ correioId, admin = false }: Props) {
  const fp = useRef('')
  const [reacoes, setReacoes] = useState<Reacoes>({ counts: {}, minhas: [] })
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [carregandoReacao, setCarregandoReacao] = useState<string | null>(null)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerCarregado, setPickerCarregado] = useState(false)
  const pickerWrapRef = useRef<HTMLDivElement | null>(null)
  const pickerElRef = useRef<HTMLElement | null>(null)

  // Mount: gera fingerprint, carrega reacoes e comentarios.
  useEffect(() => {
    fp.current = getCorreioFingerprint()
    let abortado = false
    Promise.all([
      fetch(`/api/correio/${correioId}/reacoes?fp=${encodeURIComponent(fp.current)}`).then((r) => r.json()),
      fetch(`/api/correio/${correioId}/comentarios`).then((r) => r.json()),
    ])
      .then(([rea, com]) => {
        if (abortado) return
        setReacoes({ counts: rea?.counts ?? {}, minhas: rea?.minhas ?? [] })
        setComentarios(com?.comentarios ?? [])
      })
      .catch(() => {})

    return () => {
      abortado = true
    }
  }, [correioId])

  // Lazy import + setup do picker quando abre pela primeira vez.
  useEffect(() => {
    if (!pickerOpen) return
    let cancelado = false
    ;(async () => {
      if (!pickerCarregado) {
        await import('emoji-picker-element')
        if (cancelado) return
        setPickerCarregado(true)
      }
      // Espera o custom element registrar
      requestAnimationFrame(() => {
        const el = pickerWrapRef.current?.querySelector('emoji-picker') as HTMLElement | null
        if (!el) return
        pickerElRef.current = el
        const handler = (e: Event) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const detail = (e as any).detail
          const unicode: string = detail?.unicode ?? detail?.emoji?.unicode ?? ''
          if (unicode) {
            toggleReacao(unicode)
            setPickerOpen(false)
          }
        }
        el.addEventListener('emoji-click', handler)
        ;(el as unknown as { _correioCleanup?: () => void })._correioCleanup = () =>
          el.removeEventListener('emoji-click', handler)
      })
    })()
    return () => {
      cancelado = true
      const el = pickerElRef.current as unknown as { _correioCleanup?: () => void } | null
      el?._correioCleanup?.()
      pickerElRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen])

  // ESC fecha o picker
  useEffect(() => {
    if (!pickerOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPickerOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [pickerOpen])

  async function toggleReacao(emoji: string) {
    if (carregandoReacao) return
    setCarregandoReacao(emoji)
    const minha = reacoes.minhas.includes(emoji)
    setReacoes((r) => ({
      counts: { ...r.counts, [emoji]: Math.max(0, (r.counts[emoji] ?? 0) + (minha ? -1 : 1)) },
      minhas: minha ? r.minhas.filter((e) => e !== emoji) : [...r.minhas, emoji],
    }))
    try {
      const res = await fetch(`/api/correio/${correioId}/reacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, fingerprint: fp.current }),
      })
      const d = await res.json().catch(() => null)
      if (res.ok && d?.success) {
        setReacoes({ counts: d.counts ?? {}, minhas: d.minhas ?? [] })
      }
    } finally {
      setCarregandoReacao(null)
    }
  }

  async function enviarComentario(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (!texto.trim()) {
      setErro('Escreve o comentario.')
      return
    }
    setEnviando(true)
    try {
      const res = await fetch(`/api/correio/${correioId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, fingerprint: fp.current }),
      })
      const d = await res.json().catch(() => null)
      if (!res.ok || !d?.success) {
        setErro(d?.error ?? 'Nao foi possivel comentar agora.')
        return
      }
      setComentarios((c) => [...c, d.comentario])
      setTexto('')
    } catch {
      setErro('Erro de conexao. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  async function excluirComentario(cid: string) {
    if (!confirm('Excluir esse comentario?')) return
    const res = await fetch(`/api/correio/${correioId}/comentarios/${cid}`, { method: 'DELETE' })
    if (res.ok) setComentarios((c) => c.filter((x) => x.id !== cid))
  }

  async function ocultarComentario(cid: string, valor: boolean) {
    const res = await fetch(`/api/correio/${correioId}/comentarios/${cid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oculto: valor }),
    })
    if (res.ok) {
      setComentarios((c) => c.map((x) => (x.id === cid ? { ...x, oculto: valor } : x)))
    }
  }

  // Lista das reações que já têm count > 0 (ordenadas) — alem dos atalhos fixos.
  const reacoesAtivas = Object.entries(reacoes.counts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([e]) => e)

  // Atalhos = REACAO_EMOJIS + as ativas que nao estao nos atalhos (até 12 total)
  const atalhos = Array.from(new Set([...REACAO_EMOJIS, ...reacoesAtivas])).slice(0, 12)

  return (
    <div className="mt-5 space-y-4 border-t-2 border-dashed border-somma-black/10 pt-4">
      {/* REACOES */}
      <div>
        <p className="mb-2 text-left font-dm text-[10px] font-bold uppercase tracking-widest text-somma-black/50">
          Reaja com um emoji
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {atalhos.map((e) => {
            const ativo = reacoes.minhas.includes(e)
            const count = reacoes.counts[e] ?? 0
            const busy = carregandoReacao === e
            return (
              <button
                key={e}
                type="button"
                onClick={() => toggleReacao(e)}
                disabled={busy}
                aria-pressed={ativo}
                aria-label={`Reagir com ${e}${count ? `, ${count} ${count === 1 ? 'reacao' : 'reacoes'}` : ''}`}
                className={`group flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 font-dm text-sm font-bold transition-all active:scale-95 disabled:opacity-60 ${
                  ativo
                    ? 'border-somma-orange bg-somma-orange/15 text-somma-orange shadow-[2px_2px_0_rgba(255,72,0,0.3)]'
                    : 'border-somma-black/10 bg-white text-somma-black/70 hover:border-somma-black/30'
                }`}
              >
                <span className={`text-lg leading-none transition-transform ${ativo ? 'scale-110' : 'group-hover:scale-110'}`}>{e}</span>
                {count > 0 && <span className="tabular-nums">{count}</span>}
              </button>
            )
          })}
          {/* Botão "+" abre o picker completo */}
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            aria-label="Mais emojis"
            aria-expanded={pickerOpen}
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed font-dm text-lg transition-all active:scale-95 ${
              pickerOpen
                ? 'border-somma-orange bg-somma-orange/15 text-somma-orange'
                : 'border-somma-black/25 bg-white text-somma-black/55 hover:border-somma-black/45'
            }`}
          >
            {pickerOpen ? '×' : '+'}
          </button>
        </div>

        {/* Picker dropdown */}
        {pickerOpen && (
          <div className="relative mt-3" ref={pickerWrapRef}>
            <div className="overflow-hidden rounded-2xl border-4 border-somma-black bg-white shadow-[5px_5px_0_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between border-b-2 border-somma-black/10 bg-somma-cream px-3 py-2">
                <span className="font-dm text-[11px] font-bold uppercase tracking-widest text-somma-black/70">
                  Escolha um emoji
                </span>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  aria-label="Fechar emojis"
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-somma-black bg-white text-somma-black transition-colors hover:bg-somma-black hover:text-somma-cream"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              {pickerCarregado ? (
                <emoji-picker
                  style={{
                    width: '100%',
                    height: '320px',
                    display: 'block',
                    ...({
                      '--background': '#ffffff',
                      '--border-color': 'transparent',
                      '--input-border-color': 'rgba(10,10,10,0.15)',
                      '--button-active-background': 'rgba(255,72,0,0.15)',
                      '--button-hover-background': 'rgba(255,72,0,0.08)',
                      '--indicator-color': '#FF4800',
                    } as React.CSSProperties),
                  }}
                />
              ) : (
                <div className="flex h-[320px] items-center justify-center font-dm text-xs text-somma-black/50">
                  Carregando emojis…
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* COMENTARIOS */}
      <div className="text-left">
        <p className="mb-2 font-dm text-[10px] font-bold uppercase tracking-widest text-somma-black/50">
          Comentarios {comentarios.length > 0 && <span className="text-somma-black/40">· {comentarios.length}</span>}
        </p>

        {comentarios.length > 0 && (
          <ul className="mb-3 max-h-48 space-y-2 overflow-y-auto pr-1">
            {comentarios.map((c) => (
              <li
                key={c.id}
                className={`rounded-xl bg-somma-blue/5 px-3 py-2 ${c.oculto ? 'opacity-50' : ''}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-dm text-xs font-bold text-somma-black/55">
                    Anônimo
                    {admin && c.oculto && (
                      <span className="ml-1.5 inline-block rounded-full bg-somma-black px-1.5 py-px font-dm text-[9px] font-bold uppercase tracking-wide text-somma-cream">
                        oculto
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-dm text-[10px] text-somma-black/40">{tempoRelativo(c.created_at)}</span>
                </div>
                <p className="mt-1 font-dm text-sm leading-snug text-somma-black/85 [overflow-wrap:anywhere]">{c.texto}</p>
                {admin && (
                  <div className="mt-1.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => ocultarComentario(c.id, !c.oculto)}
                      className="font-dm text-[10px] font-bold uppercase tracking-wide text-somma-blue underline-offset-2 hover:underline"
                    >
                      {c.oculto ? 'Reexibir' : 'Ocultar'}
                    </button>
                    <span className="text-somma-black/15">|</span>
                    <button
                      type="button"
                      onClick={() => excluirComentario(c.id)}
                      className="font-dm text-[10px] font-bold uppercase tracking-wide text-red-600 underline-offset-2 hover:underline"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={enviarComentario} className="space-y-2">
          <div className="flex items-end gap-2">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escreve um comentario anonimo..."
              rows={2}
              maxLength={280}
              className="min-h-[44px] flex-1 resize-none rounded-lg border-2 border-somma-black/10 bg-white px-3 py-2 font-dm text-sm text-somma-black placeholder:text-somma-black/35 focus:border-somma-blue focus:outline-none"
            />
            <button
              type="submit"
              disabled={enviando}
              className="shrink-0 rounded-lg border-2 border-somma-black bg-somma-orange px-3 py-2 font-bebas text-sm tracking-widest text-somma-cream shadow-[2px_2px_0_#0a0a0a] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#0a0a0a] disabled:opacity-60"
            >
              {enviando ? '...' : 'Comentar'}
            </button>
          </div>
          {erro && <p className="font-dm text-xs text-red-600">{erro}</p>}
          <p className="text-right font-dm text-[10px] text-somma-black/35">{texto.length}/280</p>
        </form>
      </div>
    </div>
  )
}
