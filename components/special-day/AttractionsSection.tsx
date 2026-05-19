'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FloatingElement from './FloatingElement'

gsap.registerPlugin(ScrollTrigger)

const ATTRACTIONS = [
  { emoji: '🏃', title: '8KM PERCURSO INEDITO', desc: 'Regiao das embaixadas com vista pro Lago Paranoa' },
  { emoji: '🍳', title: 'CAFE BIG BOX', desc: 'Cafe especial pra todo mundo antes da largada' },
  { emoji: '🐂', title: 'RED BULL', desc: 'Coolers, ativacao e kit exclusivo' },
  { emoji: '💪', title: 'ACADEMIA EVOLVE', desc: 'Aulas exclusivas no evento' },
  { emoji: '🥁', title: 'RODA DE SAMBA AO VIVO', desc: '08h as 11h. Comemore correndo e sambando' },
  { emoji: '🎧', title: 'DJ ATE 15H', desc: 'A festa continua depois da chegada' },
  { emoji: '🏐', title: 'FUTEVOLEI + ALTINHA', desc: 'Atividades extras pra quem fica' },
  { emoji: '🎯', title: 'GINCANA SOMMA', desc: 'Competicao interna com premiacao' },
  { emoji: '👕', title: 'KIT EXCLUSIVO', desc: 'Camiseta Thermodry T&F + Gym Bag + brindes' },
  { emoji: '🍺', title: 'BAR SOMMA', desc: 'Corona, Heineken, drinks e combos em baldes' },
  { emoji: '🍽️', title: 'ALMOCO POPULAR', desc: 'Nao precisa sair com fome' },
]

const ROTATIONS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-1', '-rotate-2']

export default function AttractionsSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.attraction-card', {
        y: 60,
        opacity: 0,
        rotate: 0,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 80%' },
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative py-16 md:py-32 px-4 bg-somma-blue overflow-hidden">
      <FloatingElement src="/elemento-tenis.svg" alt="" speed={0.7} rotate={15}
        className="hidden md:block top-10 right-[4%] w-32 md:w-44 opacity-95 z-10" />
      <FloatingElement src="/elemento-relogio.svg" alt="" speed={1.3} rotate={-20}
        className="hidden lg:block bottom-20 left-[2%] w-36 opacity-90 z-10" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_30%,#FDB716,transparent_50%),radial-gradient(circle_at_80%_70%,#FD6FDB,transparent_50%)]" />

      <div className="relative max-w-6xl mx-auto">
        <p data-speed="1.15" className="font-dm text-somma-yellow text-xs tracking-[0.3em] uppercase text-center mb-4">
          O que vai rolar
        </p>
        <h2 data-speed="1.1" className="font-bebas text-5xl sm:text-6xl md:text-8xl lg:text-9xl text-somma-cream text-center mb-10 md:mb-20 tracking-tight leading-none">
          Um sabado inteiro<br/>
          <span className="text-somma-yellow">de celebracao</span>
        </h2>

        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ATTRACTIONS.map((a, i) => (
            <div
              key={a.title}
              className={`attraction-card bg-somma-cream border-4 border-somma-black rounded-3xl p-6 shadow-[6px_6px_0_#0a0a0a] ${ROTATIONS[i % ROTATIONS.length]}`}
            >
              <div className="text-4xl mb-3">{a.emoji}</div>
              <p className="font-bebas text-2xl text-somma-black tracking-wide leading-tight">{a.title}</p>
              <p className="font-dm text-somma-black/70 text-sm mt-2">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
