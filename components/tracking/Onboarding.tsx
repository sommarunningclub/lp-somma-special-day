'use client'

import { useState } from 'react'

const KEY = 'sc_onboarded_v1'

const SLIDES = [
  { emoji: '🛰️', title: 'Bem-vindo ao SOMMA Connect', text: 'Seu corre registrado ao vivo no mapa: distância, tempo, ritmo e traçado real, em tempo real.' },
  { emoji: '📍', title: 'Permita a localização precisa', text: 'Quando pedir, toque em "Permitir". O sistema localiza você e trava sua posição com um zoom cinematográfico.' },
  { emoji: '🏃', title: 'Escolha e inicie', text: 'Diga se é rua, esteira ou caminhada, toque em "Iniciar corre" e mantenha a tela aberta durante o percurso.' },
  { emoji: '⌚', title: 'Foto do relógio no fim', text: 'Ao terminar, tire uma foto da tela do seu Garmin/Polar. A IA junta com o GPS e entrega um relatório consolidado.' },
]

export function shouldShowOnboarding(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(KEY) !== '1'
  } catch {
    return false
  }
}

export default function Onboarding({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0)
  const last = i === SLIDES.length - 1
  const s = SLIDES[i]

  function finish() {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* ignore */
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-somma-black/95 px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))] backdrop-blur-md">
      <div className="flex justify-end">
        <button onClick={finish} className="font-dm text-sm font-bold uppercase tracking-wide text-somma-cream/50">Pular</button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border-2 border-somma-orange/40 bg-somma-orange/10 text-6xl">{s.emoji}</div>
        <h2 className="mt-7 font-bebas text-4xl leading-none tracking-tight text-somma-cream">{s.title}</h2>
        <p className="mx-auto mt-3 max-w-xs font-dm text-base leading-relaxed text-somma-cream/70">{s.text}</p>
      </div>

      <div className="flex items-center justify-center gap-2 pb-6">
        {SLIDES.map((_, k) => (
          <span key={k} className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-somma-orange' : 'w-2 bg-somma-cream/25'}`} />
        ))}
      </div>

      <button
        onClick={() => (last ? finish() : setI((v) => v + 1))}
        className="w-full rounded-2xl border-4 border-somma-cream bg-somma-orange px-3 py-4 font-bebas text-2xl tracking-widest text-somma-cream shadow-[4px_4px_0_#000] transition-transform active:scale-[0.98]"
      >
        {last ? 'COMEÇAR' : 'PRÓXIMO'}
      </button>
    </div>
  )
}
