import Reveal from './Reveal'
import { EIXAO_FOTOS } from '@/lib/esquenta-constants'

// 4 fotos reais do corre no Eixão para a colagem.
const COLAGEM = [EIXAO_FOTOS[0], EIXAO_FOTOS[3], EIXAO_FOTOS[6], EIXAO_FOTOS[9]]

export default function EsquentaPosicionamento() {
  return (
    <section className="bg-somma-cream px-4 py-16 sm:py-20 md:py-28">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div>
          <Reveal as="p" className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
            O Esquenta
          </Reveal>
          <Reveal as="h2" delay={60} className="font-bebas text-4xl leading-[1.02] tracking-tight text-somma-black sm:text-6xl md:text-7xl">
            Não é só um corre.<br /><span className="text-somma-orange">É a manhã do seu domingo.</span>
          </Reveal>
          <Reveal as="p" delay={120} className="mt-5 max-w-xl font-dm text-base leading-relaxed text-somma-black/70 sm:text-lg">
            Antes do grande Somma Special Day, a comunidade se junta pra correr, celebrar e entrar no clima de arraiá
            do nosso jeito. Vem correr, caminhar, rever os amigos, curtir as ativações ou só viver uma manhã diferente
            em Brasília. Do seu jeito.
          </Reveal>
        </div>

        {/* Colagem com fotos reais do corre no Eixão */}
        <Reveal delay={120} className="relative">
          <div className="grid grid-cols-2 gap-3">
            {COLAGEM.map((src, i) => (
              <div
                key={src}
                className={`overflow-hidden rounded-2xl border-4 border-somma-black shadow-[6px_6px_0_#0a0a0a] ${i % 2 === 1 ? 'mt-6' : ''}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Comunidade SOMMA no corre do Eixão"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
