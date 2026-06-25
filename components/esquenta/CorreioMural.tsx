'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

const MAX_FOTO_BYTES = 3 * 1024 * 1024
const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp']

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(new Error('Falha ao ler o arquivo'))
    r.readAsDataURL(file)
  })
}

export type Correio = {
  id: string
  nome: string | null // DE: nome
  instagram: string | null // DE: @
  tem_contato: boolean // se há contato a revelar (telefone não vai no payload)
  de_foto_url: string | null
  para_nome: string | null
  para_instagram: string | null
  para_foto_url: string | null
  mensagem: string
  oculto?: boolean
  created_at: string
}

type ContatoInfo = { rotulo: string; display: string; href: string | null }

function Heart({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

const PALETA = ['#FF4800', '#FDB716', '#FD6FDB', '#005EFF']
function corDe(seed: string) {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return PALETA[h % PALETA.length]
}
function iniciais(nome?: string | null, ig?: string | null) {
  const base = (nome || ig || '?').replace(/^@+/, '').trim()
  const parts = base.split(/[\s._]+/).filter(Boolean)
  const ii = (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
  return (ii || base[0] || '?').toUpperCase()
}
const rotuloPara = (m: Correio) => m.para_nome?.trim() || (m.para_instagram ? `@${m.para_instagram}` : 'alguém especial')
const rotuloDe = (m: Correio) => m.nome?.trim() || (m.instagram ? `@${m.instagram}` : 'Anônimo')

function Avatar({ foto, nome, ig, size }: { foto: string | null; nome?: string | null; ig?: string | null; size: number }) {
  const dim = { width: size, height: size }
  if (foto) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={foto} alt="" style={dim} className="rounded-full border-4 border-somma-cream object-cover shadow-[3px_3px_0_rgba(0,0,0,0.25)]" />
  }
  return (
    <div
      style={{ ...dim, background: corDe(nome || ig || '?') }}
      className="flex items-center justify-center rounded-full border-4 border-somma-cream font-bebas text-somma-cream shadow-[3px_3px_0_rgba(0,0,0,0.25)]"
    >
      <span style={{ fontSize: size * 0.4 }}>{iniciais(nome, ig)}</span>
    </div>
  )
}

const KEYFRAMES = `
@keyframes correioBeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
@keyframes correioBurst { from{transform:scale(.6);opacity:.5} to{transform:scale(2.1);opacity:0} }
@keyframes correioPop { 0%{transform:scale(.2);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
@keyframes correioReveal { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
`

export default function CorreioMural({ mensagens, admin = false }: { mensagens: Correio[]; admin?: boolean }) {
  const [lista, setLista] = useState<Correio[]>(mensagens)
  const [busca, setBusca] = useState('')
  const [aberta, setAberta] = useState<Correio | null>(null)
  // contato: undefined = não revelado; null = sem contato; objeto = revelado
  const [contato, setContato] = useState<ContatoInfo | null | undefined>(undefined)
  const [revelando, setRevelando] = useState(false)
  const [uploadingLado, setUploadingLado] = useState<'de' | 'para' | null>(null)
  const inputDeRef = useRef<HTMLInputElement>(null)
  const inputParaRef = useRef<HTMLInputElement>(null)

  // ESC fecha + trava o scroll do body com o overlay aberto.
  useEffect(() => {
    if (!aberta) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [aberta])

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase().replace(/^@+/, '')
    if (!q) return lista
    return lista.filter((m) =>
      [m.para_nome, m.para_instagram].some((v) => (v ?? '').toLowerCase().replace(/^@+/, '').includes(q))
    )
  }, [lista, busca])

  function abrir(m: Correio) {
    setContato(undefined)
    setRevelando(false)
    setAberta(m)
  }
  function fechar() {
    setAberta(null)
    setContato(undefined)
  }

  async function revelarContato(m: Correio) {
    setRevelando(true)
    try {
      const r = await fetch(`/api/correio/${m.id}/contato`)
      const d = await r.json()
      setContato(d.contato ?? null)
    } catch {
      setContato(null)
    } finally {
      setRevelando(false)
    }
  }

  async function ocultar(m: Correio) {
    const novo = !m.oculto
    const r = await fetch(`/api/correio/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oculto: novo }),
    })
    if (!r.ok) {
      alert('Não foi possível atualizar (sessão de moderação expirada?).')
      return
    }
    setLista((l) => l.map((x) => (x.id === m.id ? { ...x, oculto: novo } : x)))
    setAberta((a) => (a && a.id === m.id ? { ...a, oculto: novo } : a))
  }
  async function excluir(m: Correio) {
    if (!confirm('Excluir esse recado de vez?')) return
    const r = await fetch(`/api/correio/${m.id}`, { method: 'DELETE' })
    if (!r.ok) {
      alert('Não foi possível excluir (sessão de moderação expirada?).')
      return
    }
    setLista((l) => l.filter((x) => x.id !== m.id))
    fechar()
  }

  async function selecionarFoto(m: Correio, lado: 'de' | 'para', file: File | null) {
    if (!file) return
    if (!TIPOS_FOTO.includes(file.type)) {
      alert('Formato inválido. Use JPG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_FOTO_BYTES) {
      alert('Imagem muito grande (máx 3MB).')
      return
    }
    setUploadingLado(lado)
    try {
      const dataUrl = await fileToDataUrl(file)
      const r = await fetch(`/api/correio/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lado === 'de' ? { de_foto: dataUrl } : { para_foto: dataUrl }),
      })
      const d = await r.json().catch(() => null)
      if (!r.ok || !d?.success) {
        alert(d?.error || 'Não foi possível enviar a foto.')
        return
      }
      setLista((l) =>
        l.map((x) =>
          x.id === m.id
            ? { ...x, de_foto_url: d.de_foto_url ?? null, para_foto_url: d.para_foto_url ?? null }
            : x,
        ),
      )
      setAberta((a) =>
        a && a.id === m.id
          ? { ...a, de_foto_url: d.de_foto_url ?? null, para_foto_url: d.para_foto_url ?? null }
          : a,
      )
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro inesperado ao enviar a foto.')
    } finally {
      setUploadingLado(null)
      if (inputDeRef.current) inputDeRef.current.value = ''
      if (inputParaRef.current) inputParaRef.current.value = ''
    }
  }

  async function removerFoto(m: Correio, lado: 'de' | 'para') {
    if (!confirm(`Remover a foto ${lado === 'de' ? 'do remetente' : 'do destinatário'}?`)) return
    setUploadingLado(lado)
    try {
      const r = await fetch(`/api/correio/${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lado === 'de' ? { de_foto: null } : { para_foto: null }),
      })
      const d = await r.json().catch(() => null)
      if (!r.ok || !d?.success) {
        alert(d?.error || 'Não foi possível remover a foto.')
        return
      }
      setLista((l) =>
        l.map((x) =>
          x.id === m.id
            ? { ...x, de_foto_url: d.de_foto_url ?? null, para_foto_url: d.para_foto_url ?? null }
            : x,
        ),
      )
      setAberta((a) =>
        a && a.id === m.id
          ? { ...a, de_foto_url: d.de_foto_url ?? null, para_foto_url: d.para_foto_url ?? null }
          : a,
      )
    } finally {
      setUploadingLado(null)
    }
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-somma-blue px-4 pb-20 pt-10 sm:pt-14">
      <style>{KEYFRAMES}</style>

      {/* Cabeçalho */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-cream/70 sm:text-sm">Correio Elegante</p>
        <h1 className="font-bebas text-5xl leading-[0.95] tracking-tight text-somma-cream sm:text-6xl md:text-7xl">
          Toque num coração <span className="text-somma-yellow">e descubra</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-dm text-base leading-relaxed text-somma-cream/80">
          Cada coração é um recado pra alguém da comunidade. Acha o seu, lê a mensagem e, se rolar química, revela o
          contato pra conversar. 🧡
        </p>
        {admin && (
          <p className="mx-auto mt-3 inline-block rounded-full bg-somma-orange px-3 py-1 font-dm text-xs font-bold uppercase tracking-wide text-somma-cream">
            Modo moderação ativo
          </p>
        )}

        {/* Busca "tem recado pra mim?" */}
        <div className="mx-auto mt-6 max-w-md">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Tem recado pra você? Busca seu nome ou @"
            className="w-full rounded-full border-2 border-somma-cream/30 bg-somma-cream/10 px-5 py-3 text-center font-dm text-sm text-somma-cream placeholder:text-somma-cream/50 focus:border-somma-cream focus:outline-none"
          />
        </div>
        <p className="mt-3 font-dm text-xs text-somma-cream/60">
          {filtradas.length} {filtradas.length === 1 ? 'recado' : 'recados'}
          {busca ? ' encontrado(s)' : ' no mural'}
        </p>
        <Link href="/esquenta-junino#correio" className="mt-2 inline-block font-dm text-sm font-bold uppercase tracking-wide text-somma-yellow underline-offset-2 hover:underline">
          Mandar um correio também
        </Link>
      </div>

      {/* Mural de corações */}
      {filtradas.length === 0 ? (
        <div className="mx-auto mt-16 max-w-md text-center">
          <Heart className="mx-auto h-20 w-20 text-somma-orange [animation:correioBeat_1.6s_ease-in-out_infinite]" />
          <p className="mt-4 font-bebas text-2xl uppercase tracking-wide text-somma-cream">
            {busca ? 'Nenhum recado com esse nome ainda' : 'Ainda não tem recado por aqui'}
          </p>
          <p className="mt-1 font-dm text-sm text-somma-cream/70">{busca ? 'Tenta outro nome ou @.' : 'Seja o primeiro a mandar um correio elegante. 💌'}</p>
        </div>
      ) : (
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-3 gap-x-3 gap-y-8 sm:grid-cols-4 sm:gap-6 md:grid-cols-5">
          {filtradas.map((m) => (
            <button
              key={m.id}
              onClick={() => abrir(m)}
              aria-label={`Abrir recado para ${rotuloPara(m)}`}
              className="group flex flex-col items-center gap-2 focus:outline-none"
            >
              <span className="relative block h-24 w-24 sm:h-28 sm:w-28">
                <Heart className="absolute inset-0 h-full w-full text-somma-pink/40 [animation:correioBurst_2.6s_ease-out_infinite]" />
                <Heart className="absolute inset-0 h-full w-full text-somma-orange drop-shadow-[3px_3px_0_rgba(0,0,0,0.25)] transition-transform duration-300 [animation:correioBeat_1.8s_ease-in-out_infinite] group-hover:scale-110 group-focus-visible:scale-110" />
                <span className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
                  <Avatar foto={m.para_foto_url} nome={m.para_nome} ig={m.para_instagram} size={44} />
                </span>
                {admin && m.oculto && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-somma-black px-1.5 py-0.5 font-dm text-[9px] font-bold uppercase text-somma-cream">oculto</span>
                )}
              </span>
              <span className="line-clamp-1 max-w-full font-dm text-xs font-semibold text-somma-cream/85">pra {rotuloPara(m)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Overlay: match card DE → PARA */}
      {aberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-somma-blue/95 px-4 py-8 backdrop-blur-sm" onClick={fechar} role="dialog" aria-modal="true">
          <button
            onClick={fechar}
            aria-label="Fechar"
            className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-somma-cream/40 font-dm text-2xl leading-none text-somma-cream transition-colors hover:bg-somma-cream hover:text-somma-blue"
          >
            ×
          </button>

          <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <Heart className="pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 text-somma-pink/15 [animation:correioBurst_2.4s_ease-out_infinite]" />
            <Heart className="pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 text-somma-yellow/10 [animation:correioBurst_2.4s_ease-out_infinite_0.8s]" />

            <div className="relative rounded-3xl border-4 border-somma-cream bg-somma-cream p-6 text-center shadow-[8px_8px_0_#FF4800] [animation:correioPop_0.5s_ease-out]">
              {/* DE → PARA */}
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <Avatar foto={aberta.de_foto_url} nome={aberta.nome} ig={aberta.instagram} size={72} />
                  <span className="font-dm text-[10px] font-bold uppercase tracking-widest text-somma-black/50">de</span>
                  <span className="max-w-[90px] truncate font-dm text-xs font-bold text-somma-black">{rotuloDe(aberta)}</span>
                </div>
                <Heart className="h-7 w-7 shrink-0 text-somma-orange [animation:correioBeat_1.2s_ease-in-out_infinite]" />
                <div className="flex flex-col items-center gap-1">
                  <Avatar foto={aberta.para_foto_url} nome={aberta.para_nome} ig={aberta.para_instagram} size={72} />
                  <span className="font-dm text-[10px] font-bold uppercase tracking-widest text-somma-orange">pra</span>
                  <span className="max-w-[90px] truncate font-dm text-xs font-bold text-somma-black">{rotuloPara(aberta)}</span>
                </div>
              </div>

              {/* mensagem */}
              <div className="mt-5 max-h-[34vh] overflow-y-auto rounded-2xl bg-somma-blue/5 px-4 py-4 [animation:correioReveal_0.6s_ease-out_0.15s_both]">
                <p className="font-dm text-base font-medium italic leading-snug text-somma-black [overflow-wrap:anywhere]">“{aberta.mensagem}”</p>
              </div>

              {/* revelar contato */}
              <div className="mt-5">
                {!aberta.tem_contato ? (
                  <p className="rounded-2xl bg-somma-blue/5 px-4 py-3 font-dm text-sm font-semibold text-somma-black/60">Remetente anônimo 🤫 (não deixou contato)</p>
                ) : contato === undefined ? (
                  <button
                    onClick={() => revelarContato(aberta)}
                    disabled={revelando}
                    className="w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-4 py-3 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#0a0a0a] disabled:opacity-60"
                  >
                    {revelando ? 'Revelando…' : 'Deu match? Revelar contato 💘'}
                  </button>
                ) : contato && contato.href ? (
                  <a
                    href={contato.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-0.5 rounded-2xl border-4 border-somma-black bg-somma-yellow px-4 py-3 text-somma-black shadow-[4px_4px_0_#0a0a0a] transition-transform hover:scale-[1.02] [animation:correioReveal_0.3s_ease-out]"
                  >
                    <span className="font-bebas text-lg tracking-widest">{contato.rotulo} →</span>
                    <span className="font-dm text-sm font-semibold [overflow-wrap:anywhere]">{contato.display}</span>
                  </a>
                ) : (
                  <p className="rounded-2xl bg-somma-blue/5 px-4 py-3 font-dm text-sm font-semibold text-somma-black/60 [animation:correioReveal_0.3s_ease-out]">
                    Não rolou revelar o contato agora.
                  </p>
                )}
              </div>

              {/* moderação */}
              {admin && (
                <div className="mt-4 space-y-3 border-t-2 border-dashed border-somma-black/15 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    {(['de', 'para'] as const).map((lado) => {
                      const tem = lado === 'de' ? !!aberta.de_foto_url : !!aberta.para_foto_url
                      const inputRef = lado === 'de' ? inputDeRef : inputParaRef
                      const busy = uploadingLado === lado
                      const label = lado === 'de' ? 'remetente' : 'destinatário'
                      return (
                        <div key={lado} className="flex flex-col items-center gap-1 rounded-xl bg-somma-blue/5 px-2 py-2">
                          <span className="font-dm text-[10px] font-bold uppercase tracking-widest text-somma-black/50">
                            Foto {label}
                          </span>
                          <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => selecionarFoto(aberta, lado, e.target.files?.[0] ?? null)}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => inputRef.current?.click()}
                              disabled={busy}
                              className="font-dm text-xs font-bold uppercase tracking-wide text-somma-blue underline-offset-2 hover:underline disabled:opacity-50"
                            >
                              {busy ? 'Enviando…' : tem ? '📷 Trocar' : '📷 Adicionar'}
                            </button>
                            {tem && !busy && (
                              <>
                                <span className="text-somma-black/20">·</span>
                                <button
                                  type="button"
                                  onClick={() => removerFoto(aberta, lado)}
                                  className="font-dm text-xs font-bold uppercase tracking-wide text-red-600 underline-offset-2 hover:underline"
                                >
                                  Remover
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => ocultar(aberta)} className="font-dm text-xs font-bold uppercase tracking-wide text-somma-blue underline-offset-2 hover:underline">
                      {aberta.oculto ? 'Reexibir' : 'Ocultar'}
                    </button>
                    <span className="text-somma-black/20">|</span>
                    <button onClick={() => excluir(aberta)} className="font-dm text-xs font-bold uppercase tracking-wide text-red-600 underline-offset-2 hover:underline">
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
