'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function FormSuccess() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.from(ref.current, {
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.4)',
    })
  }, [])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const whatsappText = encodeURIComponent(
    `Vai ter o Somma Special Day dia 18/07! Entra na lista VIP: ${shareUrl}`
  )

  return (
    <div ref={ref} className="text-center py-12 px-6">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="font-bebas text-4xl text-somma-yellow tracking-wider mb-4">
        Voce esta na lista!
      </h3>
      <p className="font-dm text-somma-white/80 text-base max-w-md mx-auto mb-8 leading-relaxed">
        Assim que as inscricoes abrirem, voce recebe no WhatsApp e e-mail com
        acesso antecipado e desconto exclusivo.
        <br />
        <strong className="text-somma-yellow">18 de julho. COPMDF. Nos vemos na largada.</strong>
      </p>
      <a
        href={`https://wa.me/?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-green-500 hover:bg-green-600 text-white font-bebas text-xl tracking-widest px-8 py-4 rounded-full transition-transform hover:scale-105"
      >
        Chama um amigo
      </a>
    </div>
  )
}
