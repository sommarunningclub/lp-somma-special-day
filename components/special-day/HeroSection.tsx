'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Countdown from '@/components/Countdown'

export default function HeroSection() {
  const logoRef = useRef<HTMLDivElement>(null)
  const countdownRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, {
        opacity: 0,
        scale: 0.85,
        duration: 1.2,
        ease: 'power3.out',
      })
      gsap.from(countdownRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.6,
        ease: 'power2.out',
      })
      gsap.from(ctaRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 1.0,
        ease: 'power2.out',
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-somma-blue">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,#FAC775,transparent_70%)]" />

      <div ref={logoRef} className="relative z-10 flex flex-col items-center">
        <h1 className="font-bebas text-6xl md:text-8xl lg:text-9xl text-somma-yellow drop-shadow-2xl tracking-wider text-center leading-none">
          SOMMA<br/>
          <span className="text-somma-orange">SPECIAL</span><br/>
          DAY
        </h1>
        <p className="mt-6 font-dm text-somma-white/80 text-sm md:text-base tracking-widest uppercase">
          18 de Julho de 2026 — COPMDF, Brasilia
        </p>
      </div>

      <div ref={countdownRef} className="relative z-10 mt-10">
        <Countdown />
      </div>

      <a
        ref={ctaRef}
        href="#formulario"
        className="relative z-10 mt-10 inline-block bg-somma-orange hover:bg-somma-orange/90 text-somma-white font-bebas text-2xl tracking-widest px-10 py-4 rounded-full transition-transform hover:scale-105 active:scale-95"
      >
        Garantir meu lugar na Lista VIP
      </a>
    </section>
  )
}
