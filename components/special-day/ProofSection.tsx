'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FloatingElement from './FloatingElement'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: 5000, suffix: '+',     label: 'Mais de 5.000 membros no Somma Club',  color: 'text-somma-orange' },
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
    <section ref={sectionRef} className="relative overflow-hidden bg-somma-cream px-4 py-14 sm:py-16 md:py-32">
      <FloatingElement src="/elemento-corredor.svg" alt="" speed={0.75} rotate={12}
        className="hidden md:block top-[10%] left-[5%] w-28 md:w-36 opacity-90" />
      <FloatingElement src="/elemento-tenis.svg" alt="" speed={1.25} rotate={-10}
        className="hidden md:block bottom-[5%] right-[5%] w-32 md:w-40 opacity-95" />
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 text-center sm:grid-cols-3 md:gap-12">
        {STATS.map((stat, i) => (
          <div key={stat.label}>
            <p id={`stat-${i}`} className={`font-bebas text-6xl leading-none sm:text-5xl md:text-[7vw] ${stat.color} drop-shadow-[2px_2px_0_#0a0a0a] md:drop-shadow-[3px_3px_0_#0a0a0a]`}>
              0{stat.suffix}
            </p>
            <p className="mt-3 font-dm text-xs uppercase tracking-widest text-somma-black/70 md:mt-4 md:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
