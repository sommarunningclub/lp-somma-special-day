'use client'

import { formatBRL, type Cota } from '@/lib/proposta-data'

const COLORS: Record<Cota['cor'], { bg: string; border: string; text: string; shadow: string }> = {
  orange: { bg: 'bg-somma-orange', border: 'border-somma-orange', text: 'text-somma-orange', shadow: 'shadow-[5px_5px_0_#FF4800]' },
  yellow: { bg: 'bg-somma-yellow', border: 'border-somma-yellow', text: 'text-somma-yellow', shadow: 'shadow-[5px_5px_0_#FDB716]' },
  blue:   { bg: 'bg-somma-blue',   border: 'border-somma-blue',   text: 'text-somma-blue',   shadow: 'shadow-[5px_5px_0_#005EFF]' },
  pink:   { bg: 'bg-somma-pink',   border: 'border-somma-pink',   text: 'text-somma-pink',   shadow: 'shadow-[5px_5px_0_#FD6FDB]' },
}

interface Props {
  cota: Cota
  valor: number
  recomendada?: boolean
  whatsappUrl: string
}

export default function CotaCard({ cota, valor, recomendada, whatsappUrl }: Props) {
  const c = COLORS[cota.cor]
  const fechada = !!cota.fechada

  return (
    <div className={`relative flex flex-col rounded-2xl border-4 border-somma-black bg-somma-cream sm:rounded-3xl ${fechada ? 'opacity-70 grayscale shadow-[5px_5px_0_#0a0a0a]' : recomendada ? 'shadow-[6px_6px_0_#FF4800] ring-4 ring-somma-orange/30 sm:shadow-[12px_12px_0_#FF4800]' : c.shadow}`}>
      {fechada && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-somma-black/60 sm:rounded-3xl">
          <span className="rotate-[-12deg] rounded-2xl border-4 border-somma-cream bg-somma-black px-6 py-3 font-bebas text-2xl tracking-widest text-somma-cream shadow-[4px_4px_0_#FF4800] sm:text-3xl">
            VAGAS ESGOTADAS
          </span>
        </div>
      )}

      {!fechada && recomendada && (
        <div className="absolute -top-4 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 rounded-full border-4 border-somma-black bg-somma-orange px-4 py-1 text-center font-bebas text-xs tracking-widest text-somma-cream shadow-[3px_3px_0_#0a0a0a] sm:w-auto sm:px-5 sm:text-sm">
          RECOMENDADA PARA VOCE
        </div>
      )}

      {/* Header */}
      <div className={`${c.bg} rounded-t-2xl border-b-4 border-somma-black px-6 py-5 text-somma-cream`}>
        <p className="font-dm text-[11px] font-bold uppercase tracking-[0.25em] opacity-80">Cota</p>
        <h3 className="font-bebas text-4xl tracking-widest md:text-5xl">{cota.nome}</h3>
        <p className="mt-1 font-dm text-xs opacity-90">{cota.vagas}</p>
      </div>

      {/* Valor */}
      <div className="border-b-2 border-dashed border-somma-black/15 px-6 py-5">
        <p className="font-dm text-[11px] font-bold uppercase tracking-[0.25em] text-somma-black/50">Investimento</p>
        <p className={`font-bebas text-3xl leading-none sm:text-4xl ${c.text}`}>
          {formatBRL(valor)}
        </p>
      </div>

      {/* Sections */}
      <div className="flex-1 space-y-5 px-6 py-5">
        {cota.sections.map(section => (
          <div key={section.title}>
            <h4 className="mb-2 font-dm text-[11px] font-bold uppercase tracking-[0.25em] text-somma-black/60">
              {section.title}
            </h4>
            <ul className="space-y-1.5">
              {section.items.map((item, i) => (
                <li key={i} className="flex gap-2 font-dm text-sm leading-snug text-somma-black/80">
                  <span className={`mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${c.bg}`} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        {fechada ? (
          <div className="block w-full rounded-2xl border-4 border-somma-black/30 bg-somma-black/30 px-3 py-3.5 text-center font-bebas text-base tracking-widest text-somma-cream/40 sm:text-lg">
            Cota indisponível
          </div>
        ) : (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-2xl border-4 border-somma-black bg-somma-black px-3 py-3.5 text-center font-bebas text-base tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-somma-orange hover:shadow-[3px_3px_0_#0a0a0a] sm:text-lg sm:shadow-[5px_5px_0_#0a0a0a]"
          >
            Quero a cota {cota.nome}
          </a>
        )}
      </div>
    </div>
  )
}
