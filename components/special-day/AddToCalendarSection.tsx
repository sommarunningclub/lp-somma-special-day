'use client'

import { useState } from 'react'
import CalendarSubscribeModal from './CalendarSubscribeModal'

export default function AddToCalendarSection() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <section className="relative overflow-hidden bg-somma-black px-4 py-16 text-somma-cream md:py-24">
        {/* mesh decorativo */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* COLUNA ESQUERDA */}
          <div className="text-center lg:text-left">
            <p className="font-dm text-xs uppercase tracking-[0.3em] text-somma-yellow md:text-sm">
              Adicione na sua agenda
            </p>
            <h2 className="mt-3 font-bebas text-4xl leading-[0.95] tracking-wide md:text-6xl">
              NUNCA MAIS PERCA <span className="text-somma-orange">UM EVENTO SOMMA!</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl font-dm text-base leading-relaxed text-somma-cream/80 lg:mx-0 md:text-lg">
              Assina uma vez só e pronto. O calendário do seu celular recebe
              <span className="font-semibold text-somma-cream"> automaticamente</span> tudo o que rola
              no Somma o ano inteiro, com lembretes na hora certa.
            </p>

            <ul className="mx-auto mt-6 max-w-md space-y-2.5 text-left lg:mx-0">
              <li className="flex items-start gap-3 font-dm text-sm text-somma-cream/90 md:text-base">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-somma-orange bg-somma-orange/20 text-xs">⭐</span>
                <span><strong className="text-somma-orange">Somma Special Day</strong>, 18 de julho no COPMDF</span>
              </li>
              <li className="flex items-start gap-3 font-dm text-sm text-somma-cream/90 md:text-base">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-somma-yellow bg-somma-yellow/20 text-xs">📅</span>
                <span>Todos os <strong className="text-somma-cream">eventos Somma Club</strong> do ano inteiro</span>
              </li>
              <li className="flex items-start gap-3 font-dm text-sm text-somma-cream/90 md:text-base">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-somma-blue bg-somma-blue/20 text-xs">🏁</span>
                <span>Curadoria das <strong className="text-somma-cream">principais corridas do DF</strong>, selecionadas pelo Somma</span>
              </li>
            </ul>

            <p className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-somma-cream/20 bg-somma-cream/5 px-4 py-2 font-dm text-xs uppercase tracking-widest text-somma-cream/80">
              iPhone · Mac · Google Calendar · Outlook
            </p>
          </div>

          {/* COLUNA DIREITA — card de CTA */}
          <div className="mx-auto w-full max-w-md lg:justify-self-end">
            <div className="rounded-3xl border-4 border-somma-orange bg-somma-cream p-7 text-somma-black shadow-[10px_10px_0_#FF4800] sm:p-8">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-somma-black bg-somma-orange font-bebas text-3xl text-somma-cream">
                🗓
              </div>
              <h3 className="font-bebas text-3xl tracking-widest text-somma-black sm:text-4xl">
                ASSINAR A AGENDA
              </h3>
              <p className="mt-3 font-dm text-sm leading-relaxed text-somma-black/70">
                10 segundos e tá feito! Você assina uma vez só, e o calendário se atualiza
                sozinho com tudo que a gente publicar.
              </p>

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-6 block w-full rounded-full border-4 border-somma-black bg-somma-black px-6 py-4 text-center font-bebas text-lg tracking-widest text-somma-cream shadow-[5px_5px_0_#FF4800] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-somma-orange hover:shadow-[3px_3px_0_#FF4800] md:text-xl"
              >
                Escolher meu calendário →
              </button>

              <p className="mt-4 text-center font-dm text-[11px] text-somma-black/50">
                iPhone · Mac · Google Calendar · Outlook
              </p>
            </div>
          </div>
        </div>
      </section>

      <CalendarSubscribeModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
