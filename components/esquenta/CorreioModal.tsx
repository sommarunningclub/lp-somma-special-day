'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import CorreioForm from './CorreioForm'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CorreioModal({ open, onClose }: Props) {
  // ESC fecha + trava scroll do body
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
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
      aria-label="Mandar correio elegante"
      className="fixed inset-0 z-[9999] flex flex-col bg-somma-blue/95 backdrop-blur-sm"
    >
      {/* X fixo no topo, SEMPRE visível, fora da área de scroll */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute right-3 top-[calc(0.75rem+env(safe-area-inset-top))] z-20 flex h-11 w-11 items-center justify-center rounded-full border-2 border-somma-cream bg-somma-blue text-somma-cream shadow-lg transition-colors hover:bg-somma-cream hover:text-somma-blue sm:right-6 sm:top-6"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Área de scroll com padding pra não brigar com o X */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain px-3 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(4rem+env(safe-area-inset-top))] sm:px-6 sm:pt-20"
        onClick={onClose}
      >
        <div
          className="mx-auto w-full max-w-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <CorreioForm showMuralLink={false} />
        </div>
      </div>
    </div>,
    document.body,
  )
}
