import { EIXAO_FOTOS } from '@/lib/esquenta-constants'
import Reveal from './Reveal'

export default function EsquentaGaleria() {
  return (
    <section className="overflow-hidden bg-somma-black px-4 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center sm:mb-12">
          <Reveal as="p" className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
            A comunidade
          </Reveal>
          <Reveal as="h2" delay={60} className="font-bebas text-4xl leading-[1.02] tracking-tight text-somma-cream sm:text-6xl md:text-7xl">
            O Eixão <span className="text-somma-yellow">é nosso</span>
          </Reveal>
          <Reveal as="p" delay={120} className="mx-auto mt-4 max-w-xl font-dm text-base leading-relaxed text-somma-cream/65">
            Um gostinho do que rola quando a comunidade SOMMA toma o Eixão. No Esquenta é assim, só que com muito mais arraiá.
          </Reveal>
        </div>

        {/* Mosaico (masonry via colunas CSS) */}
        <Reveal delay={120} className="[column-fill:_balance] columns-2 gap-3 sm:columns-3 lg:columns-4">
          {EIXAO_FOTOS.map((src, i) => (
            <div key={src} className="mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-somma-cream/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Comunidade SOMMA correndo no Eixão, foto ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full transition-transform duration-500 hover:scale-[1.03]"
              />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
