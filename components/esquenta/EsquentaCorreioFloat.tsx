'use client'

import { useEffect, useState } from 'react'

// Destaque flutuante do Correio Elegante em formato "stories":
// GIF circular com anel gradiente. Aparece ao rolar e leva para a seção #correio.
export default function EsquentaCorreioFloat() {
  const [visivel, setVisivel] = useState(false)
  const [fechado, setFechado] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisivel(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (fechado) return null

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 sm:bottom-6 sm:right-6 ${
        visivel ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <div className="relative flex flex-col items-center">
        <a href="#correio" aria-label="Correio Elegante — manda o seu" className="group block">
          {/* Anel gradiente estilo stories */}
          <div
            className="rounded-full p-[3px] shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(45deg, #FF4800, #FDB716, #FD6FDB, #005EFF)' }}
          >
            <div className="rounded-full bg-somma-cream p-[3px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/yas_correio.gif"
                alt="Correio Elegante Somma"
                className="h-[72px] w-[72px] rounded-full object-cover sm:h-20 sm:w-20"
              />
            </div>
          </div>
          {/* Legenda */}
          <span className="mx-auto mt-1.5 block w-fit rounded-full border-2 border-somma-black bg-somma-orange px-3 py-0.5 font-bebas text-xs tracking-widest text-somma-cream shadow-[2px_2px_0_#0a0a0a]">
            Correio 💌
          </span>
        </a>

        <button
          onClick={() => setFechado(true)}
          aria-label="Fechar"
          className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-somma-black bg-somma-cream font-dm text-xs font-bold leading-none text-somma-black shadow-[2px_2px_0_#0a0a0a]"
        >
          ×
        </button>
      </div>
    </div>
  )
}
