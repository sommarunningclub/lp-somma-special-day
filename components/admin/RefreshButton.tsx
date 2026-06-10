'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function RefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 rounded-full border-4 border-somma-orange bg-somma-orange/15 px-5 py-2.5 font-bebas tracking-widest text-somma-orange transition-all hover:bg-somma-orange hover:text-somma-cream disabled:opacity-60"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isPending ? 'animate-spin' : ''}
      >
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
      {isPending ? 'Atualizando...' : 'Atualizar'}
    </button>
  )
}
