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
      const totalWidth = track.scrollWidth / 2

      gsap.to(track, {
        x: -totalWidth,
        repeat: -1,
        ease: 'none',
        duration: 18,
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="py-8 bg-somma-orange overflow-hidden">
      <div ref={trackRef} className="flex gap-12 whitespace-nowrap will-change-transform">
        {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((name, i) => (
          <span key={i} className="font-bebas text-2xl text-somma-white tracking-[0.2em]">
            {name} <span className="text-somma-yellow">*</span>
          </span>
        ))}
      </div>
    </section>
  )
}
