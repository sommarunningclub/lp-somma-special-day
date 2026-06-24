import Reveal from '@/components/esquenta/Reveal'
import { Bunting } from '@/components/esquenta/JuninoIcons'
import ContestCTA from './ContestCTA'

export default function ContestHero({ prize }: { prize?: string }) {
  return (
    <section className="relative overflow-hidden bg-somma-orange px-4 pb-14 pt-12 sm:pb-20 sm:pt-16">
      <Bunting className="absolute left-0 top-0 h-7 w-full text-somma-black/25 sm:h-9" />
      <div className="relative mx-auto max-w-3xl pt-6 text-center">
        <Reveal as="p" className="font-dm text-xs font-bold uppercase tracking-[0.3em] text-somma-cream/80 sm:text-sm">
          Concurso Junino SOMMA
        </Reveal>
        <Reveal as="h1" delay={60} className="mt-2 font-bebas text-5xl leading-[0.9] tracking-tight text-somma-cream sm:text-7xl md:text-8xl">
          O melhor look <span className="text-somma-black">leva o prêmio</span>
        </Reveal>
        <Reveal as="p" delay={120} className="mx-auto mt-5 max-w-xl font-dm text-base leading-relaxed text-somma-cream/90 sm:text-lg">
          Caprichou no arraiá? Cadastra teu look, publica e chama a galera pra votar. O público decide e o visual mais arretado fatura.
          {prize ? ` 🏆 ${prize}` : ''}
        </Reveal>
        <Reveal delay={180} className="mx-auto mt-8 w-fit">
          <ContestCTA variant="hero" />
        </Reveal>
      </div>
    </section>
  )
}
