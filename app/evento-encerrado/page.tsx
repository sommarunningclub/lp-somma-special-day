'use client'

import { useEffect, useState } from 'react'

const SOMMA_URL = 'https://sommaclub.com.br/'
const REDIRECT_SECONDS = 6

export default function EventoEncerradoPage() {
  const [secs, setSecs] = useState(REDIRECT_SECONDS)

  useEffect(() => {
    const id = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          clearInterval(id)
          window.location.replace(SOMMA_URL)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-somma-black px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border-4 border-somma-orange bg-somma-cream p-8 text-center shadow-[10px_10px_0_#FF4800] sm:p-10">
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-somma-black bg-somma-orange text-3xl">
          🏁
        </div>
        <p className="font-dm text-xs font-bold uppercase tracking-[0.3em] text-somma-orange">
          Somma Special Day
        </p>
        <h1 className="mt-2 font-bebas text-5xl leading-[0.95] tracking-tight text-somma-black sm:text-6xl">
          Evento encerrado
        </h1>
        <p className="mx-auto mt-4 max-w-sm font-dm text-base leading-relaxed text-somma-black/70">
          Obrigado por fazer parte! 🧡 O Esquenta e o Somma Special Day chegaram ao fim. Continue com a gente
          na comunidade.
        </p>

        <a
          href={SOMMA_URL}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full border-4 border-somma-black bg-somma-black px-6 py-4 font-bebas text-xl tracking-widest text-somma-cream shadow-[5px_5px_0_#FF4800] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-somma-orange hover:shadow-[3px_3px_0_#0a0a0a] sm:w-auto sm:px-10"
        >
          Ir para o Somma Club →
        </a>

        <p className="mt-5 font-dm text-xs text-somma-black/45">
          Redirecionando em <span className="font-bold text-somma-orange">{secs}s</span>...
        </p>
      </div>
    </main>
  )
}
