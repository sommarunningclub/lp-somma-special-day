import { ESQUENTA } from '@/lib/esquenta-constants'
import Reveal from './Reveal'
import { Bunting } from './JuninoIcons'

export default function EsquentaCtaFinal() {
  return (
    <section className="relative overflow-hidden bg-somma-orange px-4 py-20 sm:py-24 md:py-28">
      {/* Foto de fundo (comunidade no Eixão) sob overlay laranja forte */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/somma-eixao/eixao-13.jpg" alt="Comunidade SOMMA correndo no Eixão" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-somma-orange/85" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(255,72,0,0.94) 0%, rgba(255,72,0,0.7) 50%, rgba(255,72,0,0.96) 100%)' }}
        />
      </div>
      <Bunting className="absolute left-0 top-0 z-[1] h-7 w-full text-somma-black/25 sm:h-9" />
      <div className="relative z-10 mx-auto max-w-3xl pt-6 text-center">
        <Reveal as="h2" className="font-bebas text-4xl leading-[0.95] tracking-tight text-somma-cream sm:text-6xl md:text-7xl">
          Veste o xadrez. Chama a galera. E vem viver esse corre.
        </Reveal>
        <Reveal as="p" delay={80} className="mx-auto mt-5 max-w-xl font-dm text-base leading-relaxed text-somma-cream/90 sm:text-lg">
          O Esquenta Somma Special Day é o encontro pra começar o domingo com movimento, energia e muito arraiá. Cola que vai ser bom demais.
        </Reveal>

        <Reveal delay={140} className="mx-auto mt-7 flex w-fit flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl bg-somma-black/15 px-5 py-3 font-dm text-sm font-semibold text-somma-cream">
          <span>{ESQUENTA.data}</span><span className="opacity-50">·</span>
          <span>{ESQUENTA.local}</span><span className="opacity-50">·</span>
          <span>Concentração às {ESQUENTA.concentracao}</span>
        </Reveal>

        <Reveal delay={200} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={ESQUENTA.participarHref}
            className="rounded-2xl border-4 border-somma-black bg-somma-cream px-8 py-4 text-center font-bebas text-xl tracking-widest text-somma-black shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#0a0a0a] sm:text-2xl"
          >
            Quero participar
          </a>
          <a
            href={ESQUENTA.siteUrl}
            className="rounded-2xl border-2 border-somma-cream px-8 py-4 text-center font-bebas text-xl tracking-widest text-somma-cream transition-all hover:bg-somma-cream hover:text-somma-orange sm:text-2xl"
          >
            Ver o Somma Special Day
          </a>
        </Reveal>
      </div>
    </section>
  )
}
