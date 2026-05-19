'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import Countdown from '@/components/Countdown'

function Star({ className, color = '#FF4800' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} className={className} aria-hidden>
      <path d="M12 0l2.4 8.4L24 12l-9.6 3.6L12 24l-2.4-8.4L0 12l9.6-3.6L12 0z" />
    </svg>
  )
}

function Bolt({ className, color = '#FDB716' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color} className={className} aria-hidden>
      <path d="M13 2L3 14h7l-2 8 10-12h-7l2-8z" />
    </svg>
  )
}

export default function HeroSection() {
  const titleRef = useRef<HTMLDivElement>(null)
  const countdownRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0,
        scale: 0.85,
        y: 30,
        duration: 1.2,
        ease: 'power3.out',
      })
      gsap.from(countdownRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.5,
        ease: 'power2.out',
      })
      gsap.from(ctaRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        delay: 0.9,
        ease: 'back.out(1.4)',
      })
      gsap.from('.hero-sticker', {
        opacity: 0,
        scale: 0,
        rotate: -45,
        stagger: 0.08,
        duration: 0.6,
        delay: 0.3,
        ease: 'back.out(2)',
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-24 overflow-hidden bg-somma-cream">
      <Star className="hero-sticker sticker w-10 top-[12%] left-[8%]"  color="#FF4800" />
      <Star className="hero-sticker sticker w-8 top-[18%] right-[12%]" color="#005EFF" />
      <Bolt className="hero-sticker sticker hidden md:block w-12 top-[35%] left-[14%] rotate-12" color="#FDB716" />
      <Bolt className="hero-sticker sticker w-10 bottom-[20%] right-[10%] -rotate-12" color="#FF4800" />
      <Star className="hero-sticker sticker hidden md:block w-6 bottom-[12%] left-[20%]" color="#FD6FDB" />
      <Star className="hero-sticker sticker w-10 top-[8%] left-[48%]"   color="#FDB716" />

      <p className="font-dm text-somma-blue text-xs md:text-sm tracking-[0.3em] uppercase mb-6">
        18 . 07 . 2026 · COPMDF Brasilia
      </p>

      <div ref={titleRef} className="relative w-full max-w-[90vw] sm:max-w-md md:max-w-2xl lg:max-w-3xl px-4">
        <Image
          src="/logo-special-day.png"
          alt="Somma Special Day"
          width={1200}
          height={1500}
          priority
          className="w-full h-auto drop-shadow-2xl"
        />
      </div>

      <div ref={countdownRef} className="mt-8 md:mt-12 bg-somma-blue rounded-3xl px-4 py-4 md:px-8 md:py-6 shadow-2xl max-w-[95vw]">
        <Countdown />
      </div>

      <a
        ref={ctaRef}
        href="#formulario"
        className="mt-10 inline-block bg-somma-orange hover:bg-somma-orange/90 text-somma-cream font-bebas text-xl md:text-2xl lg:text-3xl tracking-widest px-8 py-4 md:px-12 md:py-5 rounded-full shadow-[4px_4px_0_#0a0a0a] md:shadow-[6px_6px_0_#0a0a0a] hover:shadow-[3px_3px_0_#0a0a0a] hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-center"
      >
        Quero entrar na Lista VIP
      </a>

      <p className="mt-6 font-dm text-somma-black/60 text-xs tracking-widest uppercase">
        Apenas 400 vagas · 1º lote com desconto exclusivo
      </p>
    </section>
  )
}
