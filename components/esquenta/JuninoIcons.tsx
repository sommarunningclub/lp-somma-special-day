import type { SVGProps } from 'react'

/** Ícones lineares minimalistas (stroke = currentColor). Estética sóbria, não caricata. */
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function JuninoIcon({ name, ...props }: { name: string } & SVGProps<SVGSVGElement>) {
  const p = { ...base, ...props }
  switch (name) {
    case 'corre': // tênis / corrida
      return (
        <svg {...p}><path d="M3 17h15a3 3 0 0 0 0-6c-3 0-4-1-6-3l-2-2-2 4-3 1v7z" /><path d="M3 14h6" /></svg>
      )
    case 'cafe': // xícara
      return (
        <svg {...p}><path d="M4 9h12v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9z" /><path d="M16 10h2a2 2 0 0 1 0 4h-2" /><path d="M7 3v2M10 3v2M13 3v2" /></svg>
      )
    case 'milho': // espiga de milho
      return (
        <svg {...p}><path d="M12 21c4-2 5-6 5-10 0-3-2-6-5-6S7 8 7 11c0 4 1 8 5 10z" /><path d="M12 6v13M9.5 9l2.5 1 2.5-1M9.5 13l2.5 1 2.5-1" /></svg>
      )
    case 'marca': // tag / ativação
      return (
        <svg {...p}><path d="M3 12V4h8l9 9-8 8-9-9z" /><circle cx="7.5" cy="7.5" r="1.2" /></svg>
      )
    case 'presente': // brinde
      return (
        <svg {...p}><rect x="3" y="8" width="18" height="13" rx="1" /><path d="M3 12h18M12 8v13" /><path d="M12 8C9 8 7 4 9.5 3.5 11 3 12 6 12 8c0-2 1-5 2.5-4.5C17 4 15 8 12 8z" /></svg>
      )
    case 'correio': // envelope com coração
      return (
        <svg {...p}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M3.5 6 12 13l8.5-7" /><path d="M12 17.5c1.6-1.2 2.6-2 2.6-3 0-.7-.6-1.2-1.3-1.2-.5 0-.9.3-1.3.8-.4-.5-.8-.8-1.3-.8-.7 0-1.3.5-1.3 1.2 0 1 1 1.8 2.6 3z" /></svg>
      )
    case 'chapeu': // chapéu de palha
      return (
        <svg {...p}><path d="M2 17c2.5 1.3 6 2 10 2s7.5-.7 10-2" /><path d="M7 16c0-5 1-9 5-9s5 4 5 9" /><path d="M5 17c0-1.2 3-2 7-2s7 .8 7 2" /></svg>
      )
    case 'fogueira': // fogueira
      return (
        <svg {...p}><path d="M12 3c2 2.5 3.5 4.5 3.5 7a3.5 3.5 0 0 1-7 0c0-1 .5-2 1.5-3 .2 1 .8 1.6 1.5 1.8C12 8 11 6 12 3z" /><path d="M5 21l5-3 4 2.4L19 18" /></svg>
      )
    default:
      return <svg {...p}><circle cx="12" cy="12" r="9" /></svg>
  }
}

/** Bandeirinhas minimalistas (linha de triângulos) — decoração discreta. */
export function Bunting({
  className = '',
  count = 14,
  colors = ['#FF4800', '#FDB716', '#005EFF', '#FD6FDB'],
}: {
  className?: string
  count?: number
  colors?: string[]
}) {
  const w = 1000
  const step = w / count
  return (
    <svg
      viewBox={`0 0 ${w} 40`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path d={`M0 6 L${w} 6`} stroke="currentColor" strokeWidth={1.5} opacity={0.5} />
      {Array.from({ length: count }).map((_, i) => {
        const x = i * step + step / 2
        return (
          <path
            key={i}
            d={`M${x - step / 2 + 4} 6 L${x + step / 2 - 4} 6 L${x} 30 Z`}
            fill={colors[i % colors.length]}
          />
        )
      })}
    </svg>
  )
}
