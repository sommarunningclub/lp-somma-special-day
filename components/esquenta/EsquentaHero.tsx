import Image from 'next/image'
import { ESQUENTA } from '@/lib/esquenta-constants'
import Reveal from './Reveal'
import { Bunting, JuninoIcon } from './JuninoIcons'

const QUICK = [
  { icon: 'chapeu', label: ESQUENTA.data },
  { icon: 'marca', label: ESQUENTA.local },
  { icon: 'fogueira', label: `Concentração às ${ESQUENTA.concentracao}` },
  { icon: 'corre', label: `Início do corre às ${ESQUENTA.inicioCorre}` },
]

export default function EsquentaHero() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-somma-black px-4 pb-16 pt-6 sm:pt-8 md:flex md:min-h-screen md:flex-col md:justify-center md:py-20">
      {/* Bandeirinhas discretas no topo */}
      <Bunting className="absolute left-0 top-0 h-7 w-full text-somma-cream/20 sm:h-9" />

      {/* brilho radial laranja */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 18%, rgba(255,72,0,0.16) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center pt-12 text-center md:pt-0">
        <Reveal className="mb-7 w-40 sm:w-52 md:w-60">
          <Image src="/logo-special-day.svg" alt="Somma Special Day" width={600} height={300} priority className="h-auto w-full" />
        </Reveal>

        <Reveal delay={60} className="mb-5 inline-flex items-center gap-2 rounded-full border border-somma-orange/40 bg-somma-orange/10 px-4 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-somma-orange" />
          <span className="font-dm text-[11px] font-bold uppercase tracking-[0.2em] text-somma-orange sm:text-xs">
            Esquenta oficial · Somma Special Day
          </span>
        </Reveal>

        <Reveal delay={120} as="h1" className="font-bebas text-5xl leading-[0.88] tracking-wide text-somma-cream sm:text-7xl md:text-8xl">
          O corre mais <span className="text-somma-orange">arretado</span> de Brasília
        </Reveal>

        <Reveal delay={180} as="p" className="mt-5 max-w-xl font-dm text-base leading-relaxed text-somma-cream/75 sm:text-lg">
          Antes do SOMMA Special Day, a gente vai abrir a temporada do jeito que sabe fazer: com corre, comunidade,
          ativações, café da manhã, comidas típicas, sorteios e muita energia.
        </Reveal>

        {/* Informações rápidas */}
        <Reveal delay={240} className="mt-7 grid w-full max-w-xl grid-cols-2 gap-2.5">
          {QUICK.map((q) => (
            <div key={q.label} className="flex items-center gap-2.5 rounded-xl border border-somma-cream/12 bg-somma-cream/[0.04] px-3 py-2.5 text-left">
              <JuninoIcon name={q.icon} className="h-5 w-5 shrink-0 text-somma-yellow" />
              <span className="font-dm text-[12px] font-semibold leading-tight text-somma-cream/85 sm:text-sm">{q.label}</span>
            </div>
          ))}
        </Reveal>

        {/* CTAs */}
        <Reveal delay={300} className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={ESQUENTA.participarHref}
            className="rounded-2xl bg-somma-orange px-8 py-4 text-center font-bebas text-xl tracking-widest text-somma-cream shadow-[4px_4px_0_#FDB716] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#FDB716] sm:text-2xl"
          >
            Quero participar
          </a>
          <a
            href={ESQUENTA.siteUrl}
            className="rounded-2xl border-2 border-somma-cream/30 px-8 py-4 text-center font-bebas text-xl tracking-widest text-somma-cream transition-all hover:bg-somma-cream hover:text-somma-black sm:text-2xl"
          >
            Conhecer o Somma Special Day
          </a>
        </Reveal>
      </div>
    </section>
  )
}
