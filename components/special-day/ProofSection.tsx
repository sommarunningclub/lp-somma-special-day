'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 4000, suffix: '+', label: 'Membros no Somma Club' },
  { value: 400,  suffix: '',  label: 'Vagas disponíveis' },
  { value: 1,    suffix: ' ANO', label: 'De historia e corrida' },
]

export default function ProofSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      STATS.forEach((stat, i) => {
        const el = document.querySelector(`#stat-${i}`)
        if (!el) return
        const obj = { val: 0 }
        gsap.to(obj, {
          val: stat.value,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toLocaleString('pt-BR') + stat.suffix
          },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-somma-blue">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
        {STATS.map((stat, i) => (
          <div key={stat.label}>
            <p id={`stat-${i}`} className="font-bebas text-6xl md:text-8xl text-somma-yellow">
              0{stat.suffix}
            </p>
            <p className="font-dm text-somma-white/70 mt-2 text-sm tracking-widest uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
