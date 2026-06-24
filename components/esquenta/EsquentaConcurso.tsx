import { CONCURSO_PASSOS } from '@/lib/esquenta-constants'
import Reveal from './Reveal'
import { Bunting, JuninoIcon } from './JuninoIcons'
import ContestCTA from '@/components/concurso/ContestCTA'

export default function EsquentaConcurso() {
  return (
    <section className="relative overflow-hidden bg-somma-cream px-4 py-16 sm:py-20 md:py-28">
      <Bunting className="absolute left-0 top-0 h-7 w-full text-somma-black/15 sm:h-9" />
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-10 pt-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <Reveal as="p" className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
            Concurso junino
          </Reveal>
          <Reveal as="h2" delay={60} className="font-bebas text-4xl leading-[1.02] tracking-tight text-somma-black sm:text-5xl md:text-6xl">
            Caprichou no look? O melhor arraiá leva prêmio.
          </Reveal>
          <Reveal as="p" delay={120} className="mt-5 max-w-xl font-dm text-base leading-relaxed text-somma-black/70 sm:text-lg">
            Camisa xadrez, chapéu de palha, trancinha, bigode pintado, bandeirinha no cabelo. O que vier é lucro. Quem
            aparecer caracterizado entra no concurso de melhor look junino do Esquenta. Solta a criatividade!
          </Reveal>

          <Reveal delay={160} className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-dashed border-somma-orange/50 bg-somma-orange/[0.06] p-4">
            <JuninoIcon name="chapeu" className="mt-0.5 h-6 w-6 shrink-0 text-somma-orange" />
            <p className="font-dm text-sm leading-relaxed text-somma-black/75">
              Caracterização <strong>não é obrigatória</strong>, mas quem entra no clima curte muito mais. Fica a dica. 😉
            </p>
          </Reveal>
        </div>

        {/* Passos do concurso */}
        <Reveal delay={120}>
          <ol className="space-y-3">
            {CONCURSO_PASSOS.map((passo, i) => (
              <li key={i} className="flex items-center gap-4 rounded-2xl border-4 border-somma-black bg-white p-4 shadow-[4px_4px_0_#0a0a0a]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-somma-orange font-bebas text-xl text-somma-cream">
                  {i + 1}
                </span>
                <span className="font-dm text-sm font-medium leading-snug text-somma-black sm:text-base">{passo}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      {/* CTAs do sistema completo de concurso */}
      <Reveal delay={80} className="mx-auto mt-10 max-w-5xl">
        <div className="rounded-3xl border-4 border-somma-black bg-white p-6 text-center shadow-[8px_8px_0_#FF4800] sm:p-8">
          <p className="font-bebas text-2xl uppercase tracking-wide text-somma-black sm:text-3xl">Cadastra teu look e entra na disputa</p>
          <p className="mx-auto mt-1 max-w-xl font-dm text-sm text-somma-black/60">
            Manda até duas fotos, publica e chama a galera pra votar. Acompanha a corrida pelo prêmio ao vivo. 🌽
          </p>
          <div className="mt-5 flex justify-center">
            <ContestCTA variant="hero" />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
