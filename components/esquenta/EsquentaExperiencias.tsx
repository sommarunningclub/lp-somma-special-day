import { EXPERIENCIAS } from '@/lib/esquenta-constants'
import Reveal from './Reveal'
import { JuninoIcon } from './JuninoIcons'

export default function EsquentaExperiencias() {
  return (
    <section className="bg-somma-black px-4 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center sm:mb-16">
          <Reveal as="p" className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
            Experiências
          </Reveal>
          <Reveal as="h2" delay={60} className="font-bebas text-4xl leading-[1.02] tracking-tight text-somma-cream sm:text-6xl md:text-7xl">
            Uma manhã de corre,<br /><span className="text-somma-yellow">arraiá e comunidade</span>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EXPERIENCIAS.map((exp, i) => (
            <Reveal key={exp.titulo} delay={i * 70} className="group h-full">
              <div className="flex h-full flex-col rounded-2xl border border-somma-cream/12 bg-somma-cream/[0.04] p-6 transition-colors duration-200 hover:border-somma-orange/50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-somma-orange/15 text-somma-orange transition-colors group-hover:bg-somma-orange group-hover:text-somma-cream">
                  <JuninoIcon name={exp.icone} className="h-6 w-6" />
                </div>
                <h3 className="font-bebas text-2xl uppercase tracking-wide text-somma-cream">{exp.titulo}</h3>
                <p className="mt-2 font-dm text-sm leading-relaxed text-somma-cream/65">{exp.texto}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
