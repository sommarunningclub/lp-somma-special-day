import Image from 'next/image'
import { PARCEIROS } from '@/lib/esquenta-constants'
import Reveal from './Reveal'

export default function EsquentaParceiros() {
  return (
    <section className="bg-somma-cream px-4 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center sm:mb-14">
          <Reveal as="p" className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
            Parceiros
          </Reveal>
          <Reveal as="h2" delay={60} className="font-bebas text-4xl leading-[1.02] tracking-tight text-somma-black sm:text-5xl md:text-6xl">
            Quem faz esse esquenta acontecer
          </Reveal>
          <Reveal as="p" delay={120} className="mx-auto mt-4 max-w-xl font-dm text-base leading-relaxed text-somma-black/65">
            As marcas que vestem a camisa do esporte, da comunidade e de juntar gente boa pra correr.
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PARCEIROS.map((p, i) => (
            <Reveal key={p.nome} delay={i * 60} className={p.destaque ? 'col-span-2 sm:col-span-2' : ''}>
              <a
                href={p.instagram ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram de ${p.nome}`}
                className={`group flex h-full min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border-4 p-6 text-center transition-transform hover:-translate-y-0.5 ${
                  p.destaque ? 'border-somma-orange bg-white shadow-[6px_6px_0_#FF4800]' : 'border-somma-black/15 bg-white hover:border-somma-black/40'
                }`}
              >
                {p.tag && <span className="rounded-full bg-somma-orange/15 px-2.5 py-1 font-dm text-[10px] font-bold uppercase tracking-wide text-somma-orange">{p.tag}</span>}
                {p.logo ? (
                  <Image src={p.logo} alt={p.nome} width={200} height={80} className="h-10 w-auto object-contain" />
                ) : (
                  <span className="font-bebas text-2xl uppercase tracking-wide text-somma-black sm:text-3xl">{p.nome}</span>
                )}
                <span className="font-dm text-[11px] font-semibold text-somma-black/40 transition-colors group-hover:text-somma-orange">@ no Instagram ↗</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
