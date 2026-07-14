import { ESQUENTA } from '@/lib/esquenta-constants'
import EsquentaMap from '@/components/esquenta/EsquentaMap'

export default function DayUseLocalizacao() {
  return (
    <section id="localizacao" className="bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
            Onde acontece
          </p>
          <h2 className="font-bebas text-5xl leading-none tracking-tight text-somma-black sm:text-6xl md:text-7xl">
            {ESQUENTA.localCurto}
          </h2>
          <p className="mt-3 font-dm text-sm text-somma-black/60 sm:text-base">
            {ESQUENTA.local}
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border-4 border-somma-black shadow-[8px_8px_0_#0a0a0a]">
          <div className="relative w-full" style={{ height: 'clamp(300px, 45vw, 460px)' }}>
            <EsquentaMap />
          </div>

          <div className="flex flex-col items-stretch justify-between gap-4 border-t-4 border-somma-black bg-somma-cream p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none">📍</span>
              <div>
                <p className="font-bebas text-lg uppercase tracking-wide text-somma-black">{ESQUENTA.local}</p>
                <p className="mt-0.5 font-dm text-xs text-somma-black/55">
                  Special Day · Brasília, DF · 18 de julho de 2026
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
        </div>
      </div>
    </section>
  )
}
