'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { SUBSCRIBE_PLATFORMS } from '@/lib/agenda-subscribe'

interface Props {
  open: boolean
  onClose: () => void
}

const PLATFORM_ICONS: Record<string, JSX.Element> = {
  apple: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.3c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  ),
  google: (
    <svg viewBox="0 0 24 24" className="h-7 w-7">
      <path d="M3 3h18v18H3V3z" fill="#4285F4"/>
      <path d="M3 3h18v18H3V3zm2 2v14h14V5H5z" fill="#fff"/>
      <text x="12" y="16" textAnchor="middle" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="#4285F4">31</text>
    </svg>
  ),
  android: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M17.523 15.341a1.001 1.001 0 11-1-1.733 1.001 1.001 0 011 1.733zm-11.046 0a1.001 1.001 0 11-1-1.733 1.001 1.001 0 011 1.733zm11.405-6.347l1.999-3.462a.416.416 0 00-.72-.416l-2.025 3.506a12.49 12.49 0 00-10.272 0L4.84 5.116a.416.416 0 10-.72.416l1.999 3.462C2.687 10.829.5 14.317 0 18h24c-.5-3.683-2.687-7.171-6.118-9.006z"/>
    </svg>
  ),
  outlook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M21.5 4.5h-7v15h7c.83 0 1.5-.67 1.5-1.5V6c0-.83-.67-1.5-1.5-1.5zM13 6.5H1.5C.67 6.5 0 7.17 0 8v8c0 .83.67 1.5 1.5 1.5H13v-11zm-6.5 7.75A2.25 2.25 0 014.25 12a2.25 2.25 0 014.5 0 2.25 2.25 0 01-2.25 2.25zm0-3.5c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25z"/>
    </svg>
  ),
}

const PLATFORM_COLOR: Record<string, string> = {
  apple: 'bg-somma-black text-somma-cream border-somma-black hover:bg-somma-cream hover:text-somma-black',
  google: 'bg-somma-blue text-somma-cream border-somma-blue hover:bg-somma-cream hover:text-somma-blue',
  android: 'bg-green-600 text-white border-green-700 hover:bg-somma-cream hover:text-green-700',
  outlook: 'bg-[#0078D4] text-white border-[#0078D4] hover:bg-somma-cream hover:text-[#0078D4]',
}

export default function CalendarSubscribeModal({ open, onClose }: Props) {
  // Bloqueia scroll do body enquanto aberto
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cal-modal-title"
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-somma-black/70 px-4 py-6 backdrop-blur-sm sm:items-center sm:py-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border-4 border-somma-black bg-somma-cream p-6 shadow-[10px_10px_0_#FF4800] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão fechar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border-2 border-somma-black bg-somma-cream text-somma-black transition-colors hover:bg-somma-black hover:text-somma-cream"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        {/* Header */}
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-somma-black bg-somma-orange font-bebas text-2xl text-somma-cream">
          🗓
        </div>
        <h2 id="cal-modal-title" className="font-bebas text-3xl leading-none tracking-widest text-somma-black sm:text-4xl">
          ESCOLHA SEU CALENDÁRIO
        </h2>
        <p className="mt-2 font-dm text-sm leading-relaxed text-somma-black/70">
          Selecione onde você quer receber os eventos. A agenda se atualiza sozinha — você assina uma vez só.
        </p>

        {/* Botões por plataforma */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SUBSCRIBE_PLATFORMS.map((p) => (
            <a
              key={p.key}
              href={p.url}
              target={p.key === 'apple' ? undefined : '_blank'}
              rel={p.key === 'apple' ? undefined : 'noopener noreferrer'}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-2xl border-4 px-4 py-3 font-bebas text-left tracking-wider transition-all hover:translate-x-[1px] hover:translate-y-[1px] ${PLATFORM_COLOR[p.key]}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                {PLATFORM_ICONS[p.key]}
              </span>
              <span className="flex flex-col">
                <span className="text-base leading-none">{p.label}</span>
                <span className="mt-1 font-dm text-[10px] font-normal uppercase tracking-widest opacity-80">
                  {p.hint}
                </span>
              </span>
            </a>
          ))}
        </div>

        {/* Lista do que vem */}
        <div className="mt-6 rounded-2xl border-2 border-dashed border-somma-black/15 bg-white/50 p-4">
          <p className="mb-2 font-bebas text-xs tracking-widest text-somma-black/60">
            O QUE VOCÊ RECEBE
          </p>
          <ul className="space-y-1.5 font-dm text-xs leading-relaxed text-somma-black/80">
            <li>⭐ Somma Special Day · 18 de julho</li>
            <li>📅 Todos os eventos Somma Club do ano</li>
            <li>🏁 Curadoria das principais corridas do DF</li>
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  )
}
