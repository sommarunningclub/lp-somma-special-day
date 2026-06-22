'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FloatingElement from './FloatingElement'

gsap.registerPlugin(ScrollTrigger)

interface GalleryPhotoProps {
  src: string
  rot: string
  shadow: string
  index: number
}

function GalleryPhoto({ src, rot, shadow, index }: GalleryPhotoProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={`gallery-photo group relative aspect-[2/3] overflow-hidden rounded-2xl border-4 border-somma-black bg-somma-black/40 ${rot} sm:rounded-3xl`}
      style={{ boxShadow: `6px 6px 0 ${shadow}` }}
    >
      <Image
        src={src}
        alt={`Somma Special Day, edição anterior, foto ${index + 1}`}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}

const FOTOS = [
  { src: '/evento-2025-1.jpg', rot: '-rotate-2' },
  { src: '/evento-2025-2.jpg', rot: 'rotate-1' },
  { src: '/evento-2025-3.jpg', rot: '-rotate-1' },
  { src: '/evento-2025-4.jpg', rot: 'rotate-2' },
  { src: '/evento-2025-5.jpg', rot: '-rotate-1' },
  { src: '/evento-2025-6.jpg', rot: 'rotate-1' },
]

const SHADOWS = ['#FF4800', '#005EFF', '#FDB716', '#FD6FDB', '#FF4800', '#005EFF']

export default function EventGallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.gallery-photo', {
        y: 60,
        opacity: 0,
        rotate: 0,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-somma-black px-4 py-14 sm:py-16 md:py-32">
      <FloatingElement src="/elemento-tenis.svg" alt="" speed={0.8} rotate={12}
        className="hidden md:block top-[6%] left-[3%] w-28 md:w-40 opacity-90 z-10" />
      <FloatingElement src="/elemento-corredor.svg" alt="" speed={1.25} rotate={-10}
        className="hidden lg:block bottom-[6%] right-[3%] w-32 opacity-90 z-10" />

      <div className="relative mx-auto max-w-6xl">
        <p className="mb-3 text-center font-dm text-xs uppercase tracking-[0.3em] text-somma-yellow sm:text-sm">
          Spoiler da última edição
        </p>
        <h2 className="mb-12 text-center font-bebas text-4xl leading-[1.05] tracking-tight text-somma-cream sm:mb-16 sm:text-6xl md:mb-20 md:text-8xl lg:text-9xl">
          Olha o que rolou{' '}
          <span className="block text-somma-orange sm:mt-1">e o que vem por aí!</span>
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 md:gap-6">
          {FOTOS.map((foto, i) => (
            <GalleryPhoto key={foto.src} src={foto.src} rot={foto.rot} shadow={SHADOWS[i]} index={i} />
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center font-bebas text-2xl leading-tight tracking-wide text-somma-cream/80 sm:text-3xl md:mt-16">
          Comunidade, energia e celebração de verdade.{' '}
          <span className="text-somma-yellow">Em 2026 a gente vai dobrar a aposta!</span>
        </p>
      </div>
    </section>
  )
}
