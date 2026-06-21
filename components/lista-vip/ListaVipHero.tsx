'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Image from 'next/image'
import FloatingElement from '@/components/special-day/FloatingElement'
import PresaleSignupForm from '@/components/special-day/PresaleSignupForm'
import OfferCountdown from './OfferCountdown'

export default function ListaVipHero({ closed = false }: { closed?: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.lv-anim', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] w-full overflow-hidden bg-somma-black px-4 py-10 sm:py-14 md:min-h-screen md:py-24"
    >
      {/* Floating decorative elements */}
      <FloatingElement
        src="/elemento-relogio.svg"
        alt=""
        speed={0.8}
        rotate={-15}
        className="top-[3%] left-[2%] w-14 opacity-20 sm:w-20 md:w-32 md:opacity-30"
      />
      <FloatingElement
        src="/elemento-tenis.svg"
        alt=""
        speed={0.9}
        rotate={-8}
        className="hidden md:block top-[8%] right-[4%] w-28 md:w-40 opacity-25"
      />
      <FloatingElement
        src="/elemento-corredor.svg"
        alt=""
        speed={1.1}
        rotate={10}
        className="bottom-[4%] left-[-6%] w-20 opacity-15 sm:left-[4%] sm:w-24 md:w-36 md:opacity-25"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        {/* COLUNA ESQUERDA — Branding + storytelling */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="lv-anim mb-7 w-48 sm:w-56 md:w-72 lg:w-full lg:max-w-md">
            <Image
              src="/logo-special-day.svg"
              alt="Somma Special Day"
              width={800}
              height={400}
              className="h-auto w-full"
              priority
            />
          </div>

          <div className="lv-anim mb-5 inline-flex items-center gap-2 rounded-full border border-somma-orange/40 bg-somma-orange/10 px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-somma-orange" />
            <span className="font-dm text-xs font-semibold uppercase tracking-widest text-somma-orange">
              Algo grande está chegando
            </span>
          </div>

          <div className="mb-6 w-full max-w-md">
            <OfferCountdown />
          </div>

          <h1 className="lv-anim mb-5 font-bebas leading-[0.9] tracking-wide">
            <span className="block text-4xl text-somma-cream sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl">EM BREVE,</span>
            <span className="block text-4xl text-somma-yellow sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl">SEJA O PRIMEIRO</span>
            <span className="block text-4xl text-somma-cream sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl">A SABER.</span>
          </h1>

          <p className="lv-anim mb-8 max-w-xl font-dm text-base leading-relaxed text-somma-cream/75">
            A line-up do maior evento do ano do Somma ainda é{' '}
            <span className="font-semibold text-somma-orange">segredo</span>. Quem entrar na Lista VIP
            descobre antes de todo mundo e garante uma das{' '}
            <span className="font-semibold text-somma-yellow">pouquíssimas vagas</span>.
          </p>

          <div className="lv-anim flex w-full max-w-md items-center gap-3 rounded-2xl border-4 border-somma-yellow bg-somma-yellow/10 px-4 py-4 shadow-[4px_4px_0_#FDB716] sm:gap-4 sm:px-5 sm:shadow-[6px_6px_0_#FDB716]">
            <div className="flex flex-col items-center justify-center rounded-xl bg-somma-yellow px-3 py-2 text-somma-black shadow-inner">
              <span className="font-dm text-[10px] font-bold uppercase tracking-widest">Julho</span>
              <span className="font-bebas text-3xl leading-none">18</span>
              <span className="font-dm text-[10px] font-bold uppercase tracking-widest">2026</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col text-left">
              <span className="font-bebas text-xl tracking-widest text-somma-yellow">Reserve a data</span>
              <span className="font-dm text-xs leading-snug text-somma-cream/80">18 de julho de 2026 · Brasília · DF</span>
              <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-somma-orange/20 px-2.5 py-1 font-dm text-[11px] font-bold uppercase tracking-wide text-somma-orange">
                1º lote aberto · o preço sobe na virada
              </span>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA — Formulário (mesmo fluxo, componente compartilhado) */}
        <div className="lv-anim w-full justify-self-center lg:justify-self-end">
          <PresaleSignupForm closed={closed} />
        </div>
      </div>
    </section>
  )
}
