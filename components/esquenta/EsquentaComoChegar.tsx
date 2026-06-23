'use client'

import { useState } from 'react'
import { ESQUENTA } from '@/lib/esquenta-constants'
import Reveal from './Reveal'

type Mode = 'metro' | 'carro'

const METRO = [
  { label: 'Embarque no metrô', detail: 'Pegue o metrô no sentido Central e desça na estação 106 Sul.' },
  { label: 'Caminhada de ~5 minutos', detail: 'Da saída da estação, siga em direção ao ponto de encontro do SOMMA, entre a 106 e 107 Sul.', tag: '~5 min a pé' },
  { label: 'Chegou! Local do evento', detail: 'Procure pela estrutura do SOMMA, pelas ativações das marcas e pelo espaço do café da manhã.', tag: `${ESQUENTA.concentracao}`, destaque: true },
]

const CARRO = [
  { label: 'Chegue com antecedência', detail: 'Procure estacionar nas vias próximas, entre a 106 e 107 Sul. Evite parar em áreas de circulação.' },
  { label: 'Dividam a carona', detail: 'Chama a galera e venham juntos. Menos carro, mais encontro.' },
  { label: 'Chegou! Local do evento', detail: 'Procure pela estrutura do SOMMA e pelo espaço do café da manhã.', tag: `${ESQUENTA.concentracao}`, destaque: true },
]

const MAPS = [
  { label: 'Google Maps', href: ESQUENTA.maps.google, icon: 'https://cdn.simpleicons.org/googlemaps/FF4800' },
  { label: 'Waze', href: ESQUENTA.maps.waze, icon: 'https://cdn.simpleicons.org/waze/FF4800' },
  { label: 'Apple Maps', href: ESQUENTA.maps.apple, icon: 'https://cdn.simpleicons.org/apple/0a0a0a' },
]

export default function EsquentaComoChegar() {
  const [mode, setMode] = useState<Mode>('metro')
  const steps = mode === 'metro' ? METRO : CARRO

  return (
    <section id="como-chegar" className="bg-somma-black px-4 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 sm:mb-12">
          <Reveal as="p" className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
            Como chegar
          </Reveal>
          <Reveal as="h2" delay={60} className="font-bebas text-4xl leading-[1.02] tracking-tight text-somma-cream sm:text-6xl md:text-7xl">
            Chegando entre a 106 e 107 Sul
          </Reveal>
          <Reveal as="p" delay={120} className="mt-4 max-w-lg font-dm text-sm leading-relaxed text-somma-cream/65 sm:text-base">
            A concentração começa às {ESQUENTA.concentracao}. Se programa pra chegar com calma, fazer o check-in, curtir
            as ativações e já entrar no clima antes do corre começar.
          </Reveal>
        </div>

        {/* Abas */}
        <div className="mb-8 flex gap-2">
          {([
            { id: 'metro', label: 'De Metrô' },
            { id: 'carro', label: 'De Carro' },
          ] as const).map((t) => {
            const active = mode === t.id
            return (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                aria-pressed={active}
                className={`rounded-xl px-5 py-3 font-bebas text-base tracking-widest transition-all ${
                  active ? 'bg-somma-orange text-somma-cream' : 'border border-somma-cream/20 text-somma-cream/60 hover:text-somma-cream'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Passos */}
        <ol className="space-y-0">
          {steps.map((step, i) => {
            const last = i === steps.length - 1
            return (
              <li key={`${mode}-${i}`} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bebas text-sm ${step.destaque ? 'bg-somma-orange text-somma-cream' : 'border border-somma-cream/25 text-somma-cream/70'}`}>
                    {i + 1}
                  </span>
                  {!last && <span className="my-1 w-px flex-1 bg-gradient-to-b from-somma-orange/40 to-somma-orange/5" />}
                </div>
                <div className={`flex-1 ${last ? 'pb-0' : 'pb-7'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bebas text-lg uppercase tracking-wide text-somma-cream sm:text-xl">{step.label}</p>
                    {step.tag && <span className="rounded-full bg-somma-orange/15 px-2 py-0.5 font-dm text-[11px] font-bold text-somma-orange">{step.tag}</span>}
                  </div>
                  <p className="mt-1 font-dm text-sm leading-relaxed text-somma-cream/60">{step.detail}</p>
                </div>
              </li>
            )
          })}
        </ol>

        {/* Botões de mapa */}
        <div className="mt-8">
          <p className="mb-3 font-dm text-[11px] uppercase tracking-[0.2em] text-somma-cream/40">Abrir no seu app favorito</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {MAPS.map((m) => (
              <a
                key={m.label}
                href={m.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-somma-cream/20 bg-somma-cream px-5 py-3.5 font-bebas text-base tracking-widest text-somma-black transition-all hover:bg-somma-orange hover:text-somma-cream"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.icon} alt="" className="h-4 w-4" />
                {m.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
