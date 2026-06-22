'use client'

import { useEffect, useState } from 'react'
import { JuninoIcon } from './JuninoIcons'

// Pílula flutuante destacando o Correio Elegante. Aparece ao rolar a página
// e leva para a seção #correio. Pode ser dispensada.
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
      <div className="relative">
        <a
          href="#correio"
          className="flex items-center gap-3 rounded-2xl border-4 border-somma-black bg-somma-orange py-3 pl-4 pr-5 shadow-[4px_4px_0_#0a0a0a] transition-transform hover:translate-x-[1px] hover:translate-y-[1px]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-somma-cream text-somma-orange">
            <JuninoIcon name="correio" className="h-5 w-5" />
          </span>
          <span className="text-left leading-tight">
            <span className="block font-bebas text-lg tracking-widest text-somma-cream">Correio Elegante</span>
            <span className="block font-dm text-[11px] font-semibold text-somma-cream/85">Manda o seu 💌</span>
          </span>
        </a>
        <button
          onClick={() => setFechado(true)}
          aria-label="Fechar"
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-somma-black bg-somma-cream font-dm text-xs font-bold text-somma-black shadow-[2px_2px_0_#0a0a0a]"
        >
          ×
        </button>
      </div>
    </div>
  )
}
