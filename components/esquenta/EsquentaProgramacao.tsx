import { PROGRAMACAO } from '@/lib/esquenta-constants'
import Reveal from './Reveal'

export default function EsquentaProgramacao() {
  return (
    <section id="programacao" className="bg-somma-cream px-4 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 sm:mb-14">
          <Reveal as="p" className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
            Programação
          </Reveal>
          <Reveal as="h2" delay={60} className="font-bebas text-4xl leading-[1.02] tracking-tight text-somma-black sm:text-6xl md:text-7xl">
            Como a manhã vai rolar
          </Reveal>
        </div>

        <div className="space-y-3">
          {PROGRAMACAO.map((item, i) => (
            <Reveal key={item.hora} delay={i * 50}>
              <div className={`flex flex-col gap-3 rounded-2xl border-4 border-somma-black bg-white p-4 shadow-[4px_4px_0_#0a0a0a] sm:flex-row sm:items-center sm:gap-5 sm:p-5 ${item.destaque ? 'ring-2 ring-somma-orange ring-offset-2 ring-offset-somma-cream' : ''}`}>
                <div className="flex shrink-0 items-center justify-center rounded-xl border-2 border-somma-black px-4 py-2 sm:w-28" style={{ backgroundColor: item.cor }}>
                  <span className={`font-bebas text-xl tracking-wide ${item.cor === '#FDB716' ? 'text-somma-black' : 'text-somma-cream'}`}>{item.hora}</span>
                </div>
                <div>
                  <h3 className="font-bebas text-xl tracking-wide text-somma-black sm:text-2xl">{item.titulo}</h3>
                  <p className="font-dm text-sm leading-snug text-somma-black/65">{item.texto}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
