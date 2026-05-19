'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const PARTNERS = [
  'Red Bull', 'Track & Field', 'Academia Evolve', 'Corona', 'Heineken',
  'Big Box', 'Somma Club', 'COPMDF',
]

export default function MarqueeSection() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current
      if (!track) return
      const totalWidth = track.scrollWidth / 3
      gsap.to(track, {
        x: -totalWidth,
        repeat: -1,
        ease: 'none',
        duration: 22,
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="py-10 bg-somma-orange border-y-4 border-somma-black overflow-hidden">
      <div ref={trackRef} className="flex gap-8 md:gap-16 whitespace-nowrap will-change-transform">
        {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((name, i) => (
          <span key={i} className="flex items-center gap-4 font-bebas text-4xl text-somma-cream tracking-[0.15em]">
            {name}
            <span className="text-somma-yellow text-5xl">✦</span>
          </span>
        ))}
      </div>
    </section>
  )
}
