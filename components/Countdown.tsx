'use client'

import { useEffect, useState, useRef, forwardRef } from 'react'
import gsap from 'gsap'

const TARGET = new Date('2026-07-18T07:00:00-03:00').getTime()

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, '0')
}

function getTimeLeft() {
  const diff = Math.max(0, TARGET - Date.now())
  const days    = Math.floor(diff / 86_400_000)
  const hours   = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000)  / 60_000)
  const seconds = Math.floor((diff % 60_000)     / 1_000)
  return { days, hours, minutes, seconds }
}

const Unit = forwardRef<HTMLSpanElement, { label: string; value: string }>(
  function Unit({ label, value }, ref) {
    return (
      <div className="flex flex-col items-center">
        <span ref={ref} className="tabular-nums">{value}</span>
        <span className="text-[10px] md:text-xs font-dm text-somma-cream/70 tracking-wider md:tracking-widest">{label}</span>
      </div>
    )
  }
)

export default function Countdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const secondsRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setTime(getTimeLeft())

    const id = setInterval(() => {
      setTime(getTimeLeft())
      if (secondsRef.current) {
        gsap.from(secondsRef.current, { y: -8, opacity: 0, duration: 0.25, ease: 'power2.out' })
      }
    }, 1000)

    return () => clearInterval(id)
  }, [])

  const { days, hours, minutes, seconds } = time

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 font-bebas text-2xl sm:text-4xl md:text-6xl text-somma-yellow [&_.countdown-separator]:text-somma-cream">
      <Unit label="DIAS"    value={pad(days)}    />
      <span className="countdown-separator mb-4">:</span>
      <Unit label="HORAS"   value={pad(hours)}   />
      <span className="countdown-separator mb-4">:</span>
      <Unit label="MIN"     value={pad(minutes)} />
      <span className="countdown-separator mb-4">:</span>
      <Unit label="SEG"     value={pad(seconds)} ref={secondsRef} />
    </div>
  )
}
