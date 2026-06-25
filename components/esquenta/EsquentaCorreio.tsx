'use client'

import Link from 'next/link'
import { CORREIO_EXEMPLOS } from '@/lib/esquenta-constants'
import Reveal from './Reveal'
import { JuninoIcon } from './JuninoIcons'
import CorreioForm from './CorreioForm'

export default function EsquentaCorreio() {
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
            <CorreioForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
