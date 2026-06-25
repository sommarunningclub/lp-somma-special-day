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
      className="fixed inset-0 z-[9999] flex items-end justify-center overflow-y-auto bg-somma-blue/90 px-2 py-4 backdrop-blur-sm sm:items-start sm:px-4 sm:py-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão fechar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-somma-cream bg-somma-blue text-somma-cream transition-colors hover:bg-somma-cream hover:text-somma-blue sm:right-3 sm:top-3"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <CorreioForm showMuralLink={false} />
      </div>
    </div>,
    document.body,
  )
}
