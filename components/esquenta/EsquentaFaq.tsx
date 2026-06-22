'use client'

import { useState } from 'react'
import { FAQ } from '@/lib/esquenta-constants'
import Reveal from './Reveal'

export default function EsquentaFaq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="bg-somma-black px-4 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center sm:mb-12">
          <Reveal as="p" className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
            Perguntas frequentes
          </Reveal>
          <Reveal as="h2" delay={60} className="font-bebas text-4xl leading-[1.02] tracking-tight text-somma-cream sm:text-6xl">
            Ficou alguma dúvida?
          </Reveal>
        </div>

        <div className="space-y-3">
          {FAQ.map((item, i) => {
            const aberto = open === i
            return (
              <Reveal key={i} delay={i * 40}>
                <div className="overflow-hidden rounded-2xl border border-somma-cream/12 bg-somma-cream/[0.04]">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(aberto ? null : i)}
                      aria-expanded={aberto}
                      aria-controls={`faq-panel-${i}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-somma-cream/[0.04]"
                    >
                      <span className="font-bebas text-lg uppercase tracking-wide text-somma-cream sm:text-xl">{item.q}</span>
                      <span className={`shrink-0 font-dm text-2xl leading-none text-somma-orange transition-transform duration-200 ${aberto ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    className={`grid transition-all duration-300 ease-out ${aberto ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 font-dm text-sm leading-relaxed text-somma-cream/65 sm:text-base">{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
