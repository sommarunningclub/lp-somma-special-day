'use client'

import { useEffect, useRef, useState } from 'react'
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
  'Liberando seu cupom...',
  'Avisando a galera...',
  'Aquecendo os tênis...',
  'Acelerando o ritmo...',
  'Quase lá...',
  'Cupom liberado!',
]

const TOTAL_DURATION_MS = 9000

export default function TicketLoader({ onComplete }: { onComplete: () => void }) {
  const [ready, setReady] = useState(false)
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLParagraphElement>(null)

  // Pré-carrega todas as GIFs antes de iniciar o ciclo
  useEffect(() => {
    let cancelled = false
    let settled = 0

    const finish = () => {
      if (cancelled) return
      setReady(true)
    }

    // Fallback: se algum GIF demorar muito, libera depois de 4s mesmo assim
    const fallback = setTimeout(finish, 4000)

    GIFS.forEach((src) => {
      const img = new window.Image()
      img.onload = img.onerror = () => {
        settled += 1
        if (settled === GIFS.length) {
          clearTimeout(fallback)
          finish()
        }
      }
      img.src = src
    })

    return () => {
      cancelled = true
      clearTimeout(fallback)
    }
  }, [])

  // Ciclo de troca de GIFs (só inicia quando pré-carregamento terminar)
  useEffect(() => {
    if (!ready) return
    const stepDuration = TOTAL_DURATION_MS / GIFS.length
    let step = 0

    const interval = setInterval(() => {
      step += 1
      if (step >= GIFS.length) {
        clearInterval(interval)
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
  }, [ready, onComplete])

  // Anima troca de mensagem
  useEffect(() => {
    if (!ready || !messageRef.current) return
    gsap.fromTo(
      messageRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    )
  }, [index, ready])

  // Estado de pré-carregamento (spinner enquanto baixa os GIFs)
  if (!ready) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center justify-center gap-5 py-12">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-somma-cream/20 border-t-somma-orange" />
        <p className="font-bebas text-xl tracking-widest text-somma-cream md:text-2xl">
          Liberando seu cupom...
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex w-full max-w-sm flex-col items-center justify-center gap-6 py-8"
    >
      {/* GIF card — todas as imagens já em DOM, troca via opacity */}
      <div className="relative aspect-square w-64 overflow-hidden rounded-2xl border-4 border-somma-cream bg-somma-black shadow-[6px_6px_0_#FF4800]">
        {GIFS.map((src, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
            draggable={false}
          />
        ))}
        {/* Sticker decorativo */}
        <div className="absolute -right-3 -top-3 z-10 rotate-12 rounded-full border-2 border-somma-black bg-somma-yellow px-3 py-1 font-bebas text-xs tracking-widest text-somma-black">
          18.07
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

      {/* Barra de progresso — anima por keyframe CSS, independente de re-render */}
      <div className="h-3 w-full overflow-hidden rounded-full border-2 border-somma-cream bg-somma-cream/10">
        <div
          className="h-full bg-gradient-to-r from-somma-orange via-somma-yellow to-somma-pink"
          style={{
            width: '100%',
            transformOrigin: 'left',
            animation: `loader-progress ${TOTAL_DURATION_MS}ms linear forwards`,
          }}
        />
      </div>

      {/* Dots indicator */}
      <div className="flex gap-2">
        {GIFS.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index
                ? 'w-6 bg-somma-orange'
                : i < index
                  ? 'w-2 bg-somma-yellow'
                  : 'w-2 bg-somma-cream/30'
            }`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes loader-progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}
