'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ATTRACTIONS = [
  { emoji: '🏃', title: '8km Percurso Inédito', desc: 'Região das embaixadas com vista para o Lago Paranoá' },
  { emoji: '🍳', title: 'Café da Manhã Big Box', desc: 'Café especial para todos os participantes' },
  { emoji: '🥋', title: 'Red Bull', desc: 'Coolers, ativação e kit exclusivo' },
  { emoji: '💪', title: 'Academia Evolve', desc: 'Aulas exclusivas no evento' },
  { emoji: '🎶', title: 'Roda de Samba ao Vivo', desc: '08h às 11h — comemore correndo e sambando' },
  { emoji: '🎧', title: 'DJ até 15h', desc: 'A festa continua depois da chegada' },
  { emoji: '🏐', title: 'Futevôlei + Altinha + Recovery', desc: 'Atividades extras para quem fica' },
  { emoji: '🎯', title: 'Gincana Somma', desc: 'Competição interna com premiação' },
  { emoji: '👕', title: 'Kit Exclusivo', desc: 'Camiseta Thermodry Track&Field + Gym Bag + brindes' },
  { emoji: '🍺', title: 'Bar Somma', desc: 'Corona, Heineken, drinks e combos em baldes' },
  { emoji: '🍽️', title: 'Almoço a Custo Popular', desc: 'Não precisa sair com fome' },
]

export default function AttractionsSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.attraction-card', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
        },
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="py-24 px-4 bg-somma-black">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-bebas text-5xl md:text-7xl text-somma-yellow text-center mb-4 tracking-wider">
          O que vai rolar
        </h2>
        <p className="font-dm text-somma-white/60 text-center mb-14 text-lg">
          Um sabado inteiro de celebracao. 400 vagas. Nao fique de fora.
        </p>

        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ATTRACTIONS.map((a) => (
            <div
              key={a.title}
              className="attraction-card bg-somma-blue/20 border border-somma-blue/30 rounded-2xl p-6 flex gap-4"
            >
              <span className="text-3xl">{a.emoji}</span>
              <div>
                <p className="font-bebas text-xl text-somma-yellow tracking-wide">{a.title}</p>
                <p className="font-dm text-somma-white/70 text-sm mt-1">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
