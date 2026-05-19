'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'

const GIFS = [
  '/loader-gifs/2678581b-aedb-4c2d-86ce-5a06b5f6b047.gif',
  '/loader-gifs/2e3c3b25-1796-4596-8385-6cd6966d8f67.gif',
  '/loader-gifs/794d5380-72d9-42e2-8150-f50af2f0ebc5.gif',
  '/loader-gifs/79ffaa1e-b0ff-4a55-ac0e-78c694b21cc7.gif',
  '/loader-gifs/7c9dc51e-0631-4079-872a-bb9496c9fdfd.gif',
  '/loader-gifs/9cc979b9-f8bb-49ba-a2c8-91bfcfc1ede6.gif',
  '/loader-gifs/f7ac9253-bf01-4e1e-990f-eba060aa5f74.gif',
]

const MESSAGES = [
  'Conferindo sua vibe...',
  'Reservando sua vaga...',
  'Avisando a galera...',
  'Aquecendo os tênis...',
  'Acelerando o ritmo...',
  'Quase lá...',
  'Imprimindo seu ticket!',
]

export default function TicketLoader({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const gifRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLParagraphElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Total: 5 segundos / 6 gifs ≈ 833ms cada
    const stepDuration = 5000 / GIFS.length
    let step = 0

    const interval = setInterval(() => {
      step += 1
      if (step >= GIFS.length) {
        clearInterval(interval)
        // Pequeno fade-out antes de chamar onComplete
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.4,
          ease: 'power2.in',
          onComplete,
        })
        return
      }
      setIndex(step)
    }, stepDuration)

    return () => clearInterval(interval)
  }, [onComplete])

  // Anima a barra de progresso
  useEffect(() => {
    if (progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        { width: '0%' },
        { width: '100%', duration: 5, ease: 'none' }
      )
    }
  }, [])

  // Anima a troca de GIF
  useEffect(() => {
    if (gifRef.current) {
      gsap.fromTo(
        gifRef.current,
        { opacity: 0, scale: 0.85, rotate: -3 },
        { opacity: 1, scale: 1, rotate: 0, duration: 0.45, ease: 'back.out(2)' }
      )
    }
    if (messageRef.current) {
      gsap.fromTo(
        messageRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      )
    }
  }, [index])

  return (
    <div
      ref={containerRef}
      className="flex w-full max-w-sm flex-col items-center justify-center gap-6 py-8"
    >
      {/* GIF card */}
      <div
        ref={gifRef}
        className="relative aspect-square w-64 overflow-hidden rounded-2xl border-4 border-somma-cream bg-somma-black shadow-[6px_6px_0_#FF4800]"
      >
        <Image
          key={GIFS[index]}
          src={GIFS[index]}
          alt=""
          fill
          unoptimized
          className="object-cover"
          priority
        />
        {/* Sticker decorativo */}
        <div className="absolute -right-3 -top-3 rotate-12 rounded-full border-2 border-somma-black bg-somma-yellow px-3 py-1 font-bebas text-xs tracking-widest text-somma-black">
          VIP
        </div>
      </div>

      {/* Mensagem rotativa */}
      <p
        ref={messageRef}
        key={MESSAGES[index]}
        className="text-center font-bebas text-2xl tracking-widest text-somma-cream md:text-3xl"
      >
        {MESSAGES[index]}
      </p>

      {/* Barra de progresso */}
      <div className="h-3 w-full overflow-hidden rounded-full border-2 border-somma-cream bg-somma-cream/10">
        <div
          ref={progressRef}
          className="h-full bg-gradient-to-r from-somma-orange via-somma-yellow to-somma-pink"
          style={{ width: '0%' }}
        />
      </div>

      {/* Dots indicator */}
      <div className="flex gap-2">
        {GIFS.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === index
                ? 'w-6 bg-somma-orange'
                : i < index
                  ? 'bg-somma-yellow'
                  : 'bg-somma-cream/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
