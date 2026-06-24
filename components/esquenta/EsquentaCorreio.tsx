'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CORREIO_EXEMPLOS } from '@/lib/esquenta-constants'
import Reveal from './Reveal'
import { JuninoIcon } from './JuninoIcons'

const inputCls =
  'w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20'
const labelCls = 'mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70'

// Comprime a imagem no navegador (máx 800px, JPEG) pra subir leve.
async function comprimirImagem(file: File): Promise<string> {
  const dataUrl: string = await new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
  const img: HTMLImageElement = await new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = dataUrl
  })
  const max = 800
  let { width, height } = img
  if (width >= height && width > max) {
    height = Math.round((height * max) / width)
    width = max
  } else if (height > max) {
    width = Math.round((width * max) / height)
    height = max
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', 0.82)
}

function FotoPicker({ value, onChange, hint }: { value: string; onChange: (d: string) => void; hint: string }) {
  const [carregando, setCarregando] = useState(false)
  return (
    <div className="flex items-center gap-3">
      <label className="group relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-somma-black/25 bg-white">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl text-somma-black/30">
            {carregando ? '…' : '＋'}
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (!f) return
            setCarregando(true)
            try {
              onChange(await comprimirImagem(f))
            } catch {
              /* ignora */
            } finally {
              setCarregando(false)
            }
          }}
        />
      </label>
      <div className="font-dm text-xs leading-tight text-somma-black/55">
        {value ? (
          <button type="button" onClick={() => onChange('')} className="font-bold text-somma-orange underline-offset-2 hover:underline">
            Remover foto
          </button>
        ) : (
          hint
        )}
      </div>
    </div>
  )
}

export default function EsquentaCorreio() {
  const [para, setPara] = useState({ nome: '', instagram: '', foto: '' })
  const [de, setDe] = useState({ nome: '', instagram: '', contato: '', foto: '' })
  const [mensagem, setMensagem] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  function reset() {
    setPara({ nome: '', instagram: '', foto: '' })
    setDe({ nome: '', instagram: '', contato: '', foto: '' })
    setMensagem('')
    setEnviado(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (!mensagem.trim()) {
      setErro('Escreve o recado.')
      return
    }
    if (!para.nome.trim() && !para.instagram.trim() && !para.foto) {
      setErro('Diz pra quem é: nome, @ do Instagram ou foto.')
      return
    }
    setSalvando(true)
    try {
      const [res] = await Promise.all([
        fetch('/api/correio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ de, para, mensagem, origem: 'site' }),
        }),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ])
      const data = await res.json()
      if (res.ok) setEnviado(true)
      else setErro(data.error ?? 'Não foi possível enviar agora.')
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section id="correio" className="bg-somma-blue px-4 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center sm:mb-14">
          <Reveal as="p" className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-cream/70 sm:text-sm">
            Correio Elegante
          </Reveal>
          <Reveal as="h2" delay={60} className="mx-auto max-w-3xl font-bebas text-4xl leading-[1.02] tracking-tight text-somma-cream sm:text-5xl md:text-6xl">
            Tem mensagem que merece chegar pessoalmente.
          </Reveal>
          <Reveal as="p" delay={120} className="mx-auto mt-5 max-w-2xl font-dm text-base leading-relaxed text-somma-cream/80">
            Escolhe pra quem é, capricha no recado e, se quiser, se identifica pra rolar o match. Elogio, zoeira, convite
            pra correr junto ou aquela cantada. Solta agora ou lança o seu no dia.
          </Reveal>
          <Reveal delay={160}>
            <Link href="/esquenta-junino/correio" className="mt-5 inline-block font-dm text-sm font-bold uppercase tracking-wide text-somma-yellow underline-offset-2 hover:underline">
              Tem recado pra você? Ver o mural →
            </Link>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1fr] lg:items-start">
          {/* Exemplos */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CORREIO_EXEMPLOS.map((msg, i) => (
              <Reveal key={i} delay={i * 70}>
                <div className="flex h-full items-start gap-3 rounded-2xl bg-somma-cream p-5 shadow-[5px_5px_0_rgba(0,0,0,0.25)]">
                  <JuninoIcon name="correio" className="mt-0.5 h-6 w-6 shrink-0 text-somma-orange" />
                  <p className="font-dm text-[15px] font-medium italic leading-snug text-somma-black">“{msg}”</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Form funcional */}
          <Reveal delay={120}>
            <div className="rounded-3xl border-4 border-somma-cream bg-somma-cream p-6 shadow-[8px_8px_0_#FF4800] sm:p-8">
              <p className="font-dm text-[11px] font-bold uppercase tracking-[0.25em] text-somma-orange">Manda um correio</p>
              <h3 className="mt-1 font-bebas text-3xl uppercase tracking-wide text-somma-black">Solta o teu recado</h3>

              {salvando ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="rounded-full p-[3px]" style={{ background: 'linear-gradient(45deg, #FF4800, #FDB716, #FD6FDB, #005EFF)' }}>
                    <div className="rounded-full bg-somma-cream p-[3px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/yas_correio_parabens.gif" alt="Guardando sua mensagem" className="h-28 w-28 rounded-full object-cover sm:h-32 sm:w-32" />
                    </div>
                  </div>
                  <p className="mt-5 font-bebas text-2xl uppercase tracking-wide text-somma-black">Guardando sua mensagem…</p>
                  <p className="mt-2 max-w-sm font-dm text-sm leading-relaxed text-somma-black/65">
                    Guardando seu recado com carinho pra soltar no dia do evento. Relaxa que vai dar certo, você vai ser
                    notado. Tudo pra alinhar os paces. 🧡
                  </p>
                  <div className="mt-4 flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-somma-orange [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-somma-orange [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-somma-orange" />
                  </div>
                </div>
              ) : enviado ? (
                <div className="mt-6 rounded-2xl border-2 border-dashed border-somma-orange/50 bg-somma-orange/[0.06] p-6 text-center">
                  <div className="mx-auto w-fit rounded-full p-[3px]" style={{ background: 'linear-gradient(45deg, #FF4800, #FDB716, #FD6FDB, #005EFF)' }}>
                    <div className="rounded-full bg-somma-cream p-[3px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/yas_correio_parabens.gif" alt="Recado guardado" className="h-24 w-24 rounded-full object-cover" />
                    </div>
                  </div>
                  <p className="mt-4 font-bebas text-2xl uppercase tracking-wide text-somma-black">Correio enviado! 💌</p>
                  <p className="mt-1 font-dm text-sm text-somma-black/65">
                    Anotado! No dia do Esquenta seu recado entra no Correio Elegante. 🧡
                  </p>
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <Link href="/esquenta-junino/correio" className="font-dm text-sm font-bold uppercase tracking-wide text-somma-orange underline-offset-2 hover:underline">
                      Ver no mural
                    </Link>
                    <button onClick={reset} className="font-dm text-sm font-bold uppercase tracking-wide text-somma-black/60 underline-offset-2 hover:underline">
                      Mandar outro
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-6">
                  {/* PARA */}
                  <div className="rounded-2xl border-2 border-somma-orange/30 bg-white/60 p-4">
                    <p className="mb-3 font-bebas text-lg uppercase tracking-wide text-somma-orange">Pra quem é? <span>*</span></p>
                    <FotoPicker value={para.foto} onChange={(d) => setPara({ ...para, foto: d })} hint="Foto da pessoa (opcional)" />
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input value={para.nome} onChange={(e) => setPara({ ...para, nome: e.target.value })} placeholder="Nome (ou apelido)" className={inputCls} />
                      <input value={para.instagram} onChange={(e) => setPara({ ...para, instagram: e.target.value })} placeholder="@ do Instagram" className={inputCls} />
                    </div>
                    <p className="mt-2 font-dm text-[11px] text-somma-black/45">Preenche pelo menos um: nome, @ ou foto.</p>
                  </div>

                  {/* MENSAGEM */}
                  <div>
                    <label className={labelCls}>Mensagem <span className="text-somma-orange">*</span></label>
                    <textarea rows={3} value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Escreve aquele recado especial..." className={`${inputCls} resize-none`} />
                  </div>

                  {/* DE */}
                  <div className="rounded-2xl border-2 border-somma-black/10 bg-white/40 p-4">
                    <p className="mb-1 font-bebas text-lg uppercase tracking-wide text-somma-black/80">
                      De você <span className="font-dm text-xs font-normal normal-case text-somma-black/40">(opcional · pode mandar anônimo)</span>
                    </p>
                    <p className="mb-3 font-dm text-[11px] text-somma-black/45">Quer dar a chance da pessoa te responder? Se identifica. 😉</p>
                    <FotoPicker value={de.foto} onChange={(d) => setDe({ ...de, foto: d })} hint="Sua foto (opcional)" />
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input value={de.nome} onChange={(e) => setDe({ ...de, nome: e.target.value })} placeholder="Seu nome" className={inputCls} />
                      <input value={de.instagram} onChange={(e) => setDe({ ...de, instagram: e.target.value })} placeholder="@seuuser" className={inputCls} />
                    </div>
                    <input value={de.contato} onChange={(e) => setDe({ ...de, contato: e.target.value })} placeholder="WhatsApp (pra pessoa te chamar)" className={`${inputCls} mt-3`} inputMode="tel" />
                  </div>

                  {erro && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center font-dm text-sm text-red-600">{erro}</p>
                  )}

                  <button type="submit" className="w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-3.5 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#0a0a0a]">
                    Enviar Correio Elegante
                  </button>
                  <p className="text-center font-dm text-xs text-somma-black/45">Pode mandar agora e lançar o seu também no dia do evento.</p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
