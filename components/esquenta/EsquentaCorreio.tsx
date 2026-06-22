'use client'

import { useState } from 'react'
import { CORREIO_EXEMPLOS } from '@/lib/esquenta-constants'
import Reveal from './Reveal'
import { JuninoIcon } from './JuninoIcons'

const inputCls =
  'w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20'
const labelCls = 'mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70'

export default function EsquentaCorreio() {
  const [form, setForm] = useState({ nome: '', instagram: '', mensagem: '', contato: '' })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (!form.nome || !form.instagram || !form.mensagem) {
      setErro('Preencha nome, Instagram e mensagem.')
      return
    }
    setSalvando(true)
    try {
      // Espera no mínimo 5s (experiência de "guardando a mensagem") + a gravação real.
      const [res] = await Promise.all([
        fetch('/api/correio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, origem: 'site' }),
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
            Durante o Esquenta, teremos um ponto especial para você enviar mensagens para alguém da comunidade. Pode ser
            elogio, brincadeira, convite para correr junto ou aquela mensagem que você não teria coragem de falar pessoalmente.
            Manda agora ou lança o seu no dia do evento.
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
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
              <h3 className="mt-1 font-bebas text-3xl uppercase tracking-wide text-somma-black">Deixe seu recado</h3>

              {salvando ? (
                /* Estado: guardando a mensagem (~5s) com GIF em loop */
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="rounded-full p-[3px]" style={{ background: 'linear-gradient(45deg, #FF4800, #FDB716, #FD6FDB, #005EFF)' }}>
                    <div className="rounded-full bg-somma-cream p-[3px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/yas_correio_parabens.gif" alt="Guardando sua mensagem" className="h-28 w-28 rounded-full object-cover sm:h-32 sm:w-32" />
                    </div>
                  </div>
                  <p className="mt-5 font-bebas text-2xl uppercase tracking-wide text-somma-black">Guardando sua mensagem…</p>
                  <p className="mt-2 max-w-sm font-dm text-sm leading-relaxed text-somma-black/65">
                    Estamos guardando sua mensagem e vamos divulgar ela no dia do evento. Vai dar certo, você será notado —
                    tudo pra alinhar os paces. 🧡
                  </p>
                  <div className="mt-4 flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-somma-orange [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-somma-orange [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-somma-orange" />
                  </div>
                </div>
              ) : enviado ? (
                <div className="mt-6 rounded-2xl border-2 border-dashed border-somma-orange/50 bg-somma-orange/[0.06] p-6 text-center">
                  <JuninoIcon name="correio" className="mx-auto h-9 w-9 text-somma-orange" />
                  <p className="mt-3 font-bebas text-2xl uppercase tracking-wide text-somma-black">Correio enviado! 💌</p>
                  <p className="mt-1 font-dm text-sm text-somma-black/65">
                    Recebemos seu recado. No dia do Esquenta ele entra no nosso Correio Elegante. 🧡
                  </p>
                  <button onClick={() => { setEnviado(false); setForm({ nome: '', instagram: '', mensagem: '', contato: '' }) }} className="mt-4 font-dm text-sm font-bold uppercase tracking-wide text-somma-orange underline-offset-2 hover:underline">
                    Mandar outro
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
                  <div>
                    <label className={labelCls}>Seu nome</label>
                    <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Como você quer ser identificado?" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>@ do Instagram</label>
                    <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@seuuser" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Mensagem</label>
                    <textarea rows={3} value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} placeholder="Escreve aquele recado especial..." className={`${inputCls} resize-none`} />
                  </div>
                  <div>
                    <label className={labelCls}>Contato <span className="font-normal text-somma-black/40">(opcional)</span></label>
                    <input value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} placeholder="WhatsApp ou @ — caso queiram te encontrar depois" className={inputCls} />
                  </div>

                  {erro && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center font-dm text-sm text-red-600">{erro}</p>
                  )}

                  <button type="submit" className="w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-3.5 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#0a0a0a]">
                    Enviar Correio Elegante
                  </button>
                  <p className="text-center font-dm text-xs text-somma-black/45">Você pode mandar agora — e também lançar o seu no dia do evento.</p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
