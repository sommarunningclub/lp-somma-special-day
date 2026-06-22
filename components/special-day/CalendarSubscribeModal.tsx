'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { SUBSCRIBE_PLATFORMS } from '@/lib/agenda-subscribe'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CalendarSubscribeModal({ open, onClose }: Props) {
  // Bloqueia scroll do body enquanto aberto + ESC pra fechar
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
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-somma-black/70 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-4 border-somma-black bg-somma-cream shadow-[10px_10px_0_#FF4800] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão fechar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-somma-black bg-somma-cream text-somma-black transition-colors hover:bg-somma-black hover:text-somma-cream sm:right-4 sm:top-4"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        {/* Conteúdo scrollável */}
        <div className="overflow-y-auto px-5 pt-5 sm:px-7 sm:pt-7">
          {/* Header */}
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border-4 border-somma-black bg-somma-orange font-bebas text-xl text-somma-cream sm:h-12 sm:w-12">
            🗓
          </div>
          <h2 id="cal-modal-title" className="font-bebas text-2xl leading-none tracking-widest text-somma-black sm:text-3xl">
            ESCOLHA SEU CALENDÁRIO
          </h2>
          <p className="mt-2 font-dm text-sm leading-relaxed text-somma-black/70">
            Escolhe onde você quer receber. Assina uma vez só e a agenda atualiza sozinha!
          </p>

          {/* Botões por plataforma */}
          <ul className="mt-5 space-y-2.5 sm:mt-6">
            {SUBSCRIBE_PLATFORMS.map((p) => (
              <li key={p.key}>
                <a
                  href={p.url}
                  target={p.newTab ? '_blank' : undefined}
                  rel={p.newTab ? 'noopener noreferrer' : undefined}
                  onClick={onClose}
                  className="group flex items-center gap-4 rounded-2xl border-4 border-somma-black bg-white px-4 py-3.5 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-somma-cream active:translate-x-[2px] active:translate-y-[2px] sm:px-5 sm:py-4"
                >
                  {/* Ícone oficial */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-somma-black/10 bg-somma-cream sm:h-14 sm:w-14">
                    <Image
                      src={p.icon}
                      alt={p.label}
                      width={48}
                      height={48}
                      className="h-8 w-8 object-contain sm:h-10 sm:w-10"
                    />
                  </div>

                  {/* Label + hint */}
                  <div className="min-w-0 flex-1">
                    <p className="font-bebas text-lg leading-none tracking-wider text-somma-black sm:text-xl">
                      {p.label}
                    </p>
                    <p className="mt-1 truncate font-dm text-xs text-somma-black/55 sm:text-[13px]">
                      {p.hint}
                    </p>
                  </div>

                  {/* Seta */}
                  <svg
                    className="h-5 w-5 shrink-0 text-somma-black/30 transition-all group-hover:translate-x-1 group-hover:text-somma-orange"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </a>
              </li>
            ))}
          </ul>

          {/* Lista do que vem */}
          <div className="my-5 rounded-2xl border-2 border-dashed border-somma-black/15 bg-white/60 p-4 sm:my-6 sm:p-5">
            <p className="mb-2 font-bebas text-xs tracking-widest text-somma-black/60">
              O QUE VOCÊ RECEBE
            </p>
            <ul className="space-y-1.5 font-dm text-xs leading-relaxed text-somma-black/80 sm:text-sm">
              <li>⭐ Somma Special Day, 18 de julho</li>
              <li>📅 Todos os eventos Somma Club do ano</li>
              <li>🏁 Curadoria das principais corridas do DF</li>
            </ul>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
