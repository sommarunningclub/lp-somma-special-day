'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const REDIRECT_SECONDS = 6

export default function ListaVipClosed() {
  const router = useRouter()
  const [secs, setSecs] = useState(REDIRECT_SECONDS)

  useEffect(() => {
    const id = setInterval(() => {
      setSecs(s => {
        if (s <= 1) {
          clearInterval(id)
          router.replace('/')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [router])

  return (
    <main className="fixed inset-0 z-[999] flex items-center justify-center bg-somma-black/95 px-4 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border-4 border-somma-orange bg-somma-cream p-8 text-center shadow-[10px_10px_0_#FF4800] sm:p-10">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-somma-orange bg-somma-orange/10 px-4 py-1.5 font-dm text-[11px] font-bold uppercase tracking-widest text-somma-orange">
          Lista VIP encerrada
        </span>
        <h1 className="mt-5 font-bebas text-4xl leading-[0.95] tracking-wide text-somma-black sm:text-5xl">
          A LINE-UP <span className="text-somma-orange">JÁ ESTÁ NO AR.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-dm text-sm leading-relaxed text-somma-black/75 sm:text-base">
          As inscrições da Lista VIP foram encerradas. Confira agora a line-up oficial e garanta sua vaga no evento.
        </p>
        <a
          href="/"
          className="mt-7 inline-flex w-full items-center justify-center rounded-full border-4 border-somma-black bg-somma-orange px-8 py-4 font-bebas text-xl tracking-widest text-somma-cream shadow-[6px_6px_0_#0a0a0a] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-somma-black hover:shadow-[3px_3px_0_#0a0a0a] sm:w-auto"
        >
          Ver line-up agora →
        </a>
        <p className="mt-5 font-dm text-xs text-somma-black/50">
          Você será redirecionado em <span className="font-bold text-somma-orange">{secs}s</span>...
        </p>
      </div>
    </main>
  )
}
