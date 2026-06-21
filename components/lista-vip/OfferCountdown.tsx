'use client'

import { useEffect, useState } from 'react'

const TARGET = new Date('2026-06-21T23:59:00-03:00').getTime()

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, '0')
}

function getLeft() {
  const diff = Math.max(0, TARGET - Date.now())
  return {
    diff,
    hours:   Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  }
}

export default function OfferCountdown() {
  const [t, setT] = useState(() => ({ diff: 0, hours: 0, minutes: 0, seconds: 0 }))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setT(getLeft())
    const id = setInterval(() => setT(getLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!mounted) {
    return (
      <div className="lv-anim w-full max-w-md rounded-2xl border-4 border-somma-orange bg-somma-orange/10 px-4 py-4 shadow-[4px_4px_0_#FF4800] sm:shadow-[6px_6px_0_#FF4800]" />
    )
  }

  const encerrada = t.diff <= 0

  if (encerrada) {
    return (
      <div className="lv-anim w-full max-w-md rounded-2xl border-4 border-somma-orange bg-somma-black px-4 py-4 text-center shadow-[4px_4px_0_#FF4800] sm:shadow-[6px_6px_0_#FF4800]">
        <span className="font-bebas text-2xl tracking-widest text-somma-orange sm:text-3xl">
          Lote encerrado
        </span>
      </div>
    )
  }

  return (
    <div className="lv-anim w-full max-w-md rounded-2xl border-4 border-somma-orange bg-somma-orange/10 px-4 py-4 shadow-[4px_4px_0_#FF4800] sm:px-5 sm:shadow-[6px_6px_0_#FF4800]">
      <div className="flex items-center gap-2 text-left">
        <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-somma-orange" />
        <p className="font-dm text-[11px] font-bold uppercase tracking-widest text-somma-orange sm:text-xs">
          1º lote encerra hoje às 23:59
        </p>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 font-bebas text-somma-cream sm:gap-3">
        <Box value={pad(t.hours)}   label="Horas" />
        <Sep />
        <Box value={pad(t.minutes)} label="Min"   />
        <Sep />
        <Box value={pad(t.seconds)} label="Seg"   />
      </div>
    </div>
  )
}

function Box({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="min-w-[3.2rem] rounded-lg border-2 border-somma-orange bg-somma-black px-2 py-1 text-center text-3xl tabular-nums sm:min-w-[3.6rem] sm:text-4xl">
        {value}
      </span>
      <span className="mt-1 font-dm text-[10px] uppercase tracking-widest text-somma-cream/70 sm:text-xs">
        {label}
      </span>
    </div>
  )
}

function Sep() {
  return <span className="mb-4 font-bebas text-3xl text-somma-orange sm:text-4xl">:</span>
}
