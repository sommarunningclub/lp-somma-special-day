'use client'

import { ESQUENTA } from '@/lib/esquenta-constants'

function googleUrl() {
  const c = ESQUENTA.calendario
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: c.titulo,
    dates: `${c.startUtc}/${c.endUtc}`,
    details: c.descricao,
    location: c.local,
  })
  return `https://www.google.com/calendar/render?${params.toString()}`
}

function buildIcs() {
  const c = ESQUENTA.calendario
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Somma Club//Esquenta Special Day//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:esquenta-somma-special-day@sommaclub.com.br',
    `DTSTART:${c.startUtc}`,
    `DTEND:${c.endUtc}`,
    `SUMMARY:${esc(c.titulo)}`,
    `DESCRIPTION:${esc(c.descricao)}`,
    `LOCATION:${esc(c.local)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function downloadIcs() {
  const blob = new Blob([buildIcs()], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'esquenta-somma-special-day.ics'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const btn =
  'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-bebas text-base tracking-widest text-somma-black transition-all hover:border-somma-black/40'

export default function EsquentaAddToCalendar() {
  return (
    <div className="mt-6 w-full">
      <p className="text-center font-dm text-[11px] font-bold uppercase tracking-[0.2em] text-somma-black/50">
        Adicione na sua agenda
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <a href={googleUrl()} target="_blank" rel="noopener noreferrer" className={btn}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-google-calendar.svg" alt="" className="h-5 w-5" />
          Google
        </a>
        <button type="button" onClick={downloadIcs} className={btn}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-apple-calendar.svg" alt="" className="h-5 w-5" />
          Apple / Outlook
        </button>
      </div>
    </div>
  )
}
