'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 5000, suffix: '+',     label: 'Mais de 5.000 mil membros no Somma Club',  color: 'text-somma-orange' },
  { value: 400,  suffix: '',      label: 'vagas no evento',         color: 'text-somma-blue'   },
  { value: 1,    suffix: ' ANO',  label: 'de historia e corrida',   color: 'text-somma-pink'   },
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
    <section ref={sectionRef} className="py-16 md:py-32 px-4 bg-somma-cream">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
        {STATS.map((stat, i) => (
          <div key={stat.label}>
            <p id={`stat-${i}`} className={`font-bebas text-[12vw] md:text-[7vw] leading-none ${stat.color} drop-shadow-[2px_2px_0_#0a0a0a] md:drop-shadow-[3px_3px_0_#0a0a0a]`}>
              0{stat.suffix}
            </p>
            <p className="font-dm text-somma-black/70 mt-4 text-sm tracking-widest uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
