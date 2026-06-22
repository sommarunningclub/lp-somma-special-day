import { ESQUENTA } from '@/lib/esquenta-constants'
import Reveal from './Reveal'
import { JuninoIcon } from './JuninoIcons'
import EsquentaMap from './EsquentaMap'

export default function EsquentaLocalizacao() {
  return (
    <section id="localizacao" className="bg-white px-4 py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center sm:mb-12">
          <Reveal as="p" className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
            Localização
          </Reveal>
          <Reveal as="h2" delay={60} className="font-bebas text-5xl leading-none tracking-tight text-somma-black sm:text-6xl md:text-7xl">
            {ESQUENTA.localCurto}
          </Reveal>
          <Reveal as="p" delay={120} className="mt-2 font-dm text-sm text-somma-black/60 sm:text-base">
            {ESQUENTA.local}
          </Reveal>
        </div>

        <Reveal delay={120}>
          <p className="mx-auto mb-8 max-w-2xl text-center font-dm text-base leading-relaxed text-somma-black/70">
            O Esquenta SOMMA Special Day acontece na 106 Sul, em um ponto de encontro preparado para receber a comunidade,
            as ativações das marcas, o café da manhã e toda a experiência junina.
          </p>
        </Reveal>

        <Reveal delay={150} className="overflow-hidden rounded-3xl border-4 border-somma-black shadow-[8px_8px_0_#0a0a0a]">
          {/* Mapa interativo */}
          <div className="relative w-full" style={{ height: 'clamp(300px, 45vw, 460px)' }}>
            <EsquentaMap />
          </div>

          {/* Barra de info + Abrir no Maps */}
          <div className="flex flex-col items-stretch justify-between gap-4 border-t-4 border-somma-black bg-somma-cream p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-somma-orange/15 text-somma-orange">
                <JuninoIcon name="marca" className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bebas text-lg uppercase tracking-wide text-somma-black">{ESQUENTA.local}</p>
                <p className="mt-0.5 font-dm text-xs text-somma-black/55">
                  106 Sul · Brasília, DF · {ESQUENTA.data} · Concentração às {ESQUENTA.concentracao} · Início do corre às {ESQUENTA.inicioCorre}
                </p>
              </div>
            </div>
            <a
              href={ESQUENTA.maps.abrirNoMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl bg-somma-orange px-6 py-3 text-center font-bebas text-base tracking-widest text-somma-cream transition-all hover:bg-somma-orange/90"
            >
              Abrir no Maps
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
