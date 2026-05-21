'use client'

import Image from 'next/image'

const VISAO_GERAL = [
  { label: 'Seguidores', value: '12.673', cor: 'bg-somma-orange' },
  { label: 'Crescimento no período', value: '+12,2%', cor: 'bg-somma-blue' },
  { label: 'Novos seguidores', value: '1.981', cor: 'bg-somma-pink' },
  { label: 'Crescimento líquido', value: '+1.374', cor: 'bg-somma-yellow' },
  { label: 'Visualizações totais', value: '717,9 mil', cor: 'bg-somma-orange' },
  { label: 'Interações', value: '14 mil', cor: 'bg-somma-blue' },
  { label: 'Conteúdos publicados', value: '172', cor: 'bg-somma-pink' },
]

const GENERO = [
  { label: 'Mulheres', pct: 66.9 },
  { label: 'Homens', pct: 33.1 },
]

const FAIXA_ETARIA = [
  { label: '13 a 17', pct: 0.3 },
  { label: '18 a 24', pct: 15.8 },
  { label: '25 a 34', pct: 48.2 },
  { label: '35 a 44', pct: 25.2 },
  { label: '45 a 54', pct: 8.6 },
  { label: '55 a 64', pct: 1.6 },
  { label: '65+', pct: 0.3 },
]

const HORARIOS = [
  { hora: '09h', intensidade: 'Alta', nivel: 2 },
  { hora: '12h', intensidade: 'Muito Alta', nivel: 3 },
  { hora: '15h', intensidade: 'Muito Alta', nivel: 3 },
  { hora: '18h', intensidade: 'Pico Máximo', nivel: 4 },
  { hora: '21h', intensidade: 'Alta', nivel: 2 },
]

const DESTAQUES = [
  'Mais de 717 mil visualizações orgânicas em 30 dias',
  'Crescimento acelerado de +12,2% no período',
  'Quase 2 mil novos seguidores adquiridos',
  'Audiência predominantemente feminina e economicamente ativa',
  'Forte presença no Distrito Federal',
  'Alto volume de produção de conteúdo com consistência diária',
]

const MAX_FAIXA = Math.max(...FAIXA_ETARIA.map(f => f.pct))

export default function InstagramInsightsSection() {
  return (
    <section className="bg-somma-black px-4 py-16 text-somma-cream md:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Cabeçalho */}
        <div className="fade-up flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-4">
            <svg className="h-9 w-9 text-somma-cream md:h-11 md:w-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <div className="rounded-2xl border-2 border-somma-cream/15 bg-somma-cream px-4 py-2">
              <Image src="/H_E PRETA_LARANJA.png" alt="Somma Club" width={320} height={45} className="h-7 w-auto md:h-8" />
            </div>
          </div>
          <p className="font-dm text-xs uppercase tracking-[0.3em] text-somma-yellow md:text-sm">Instagram · Últimos 30 dias</p>
          <h2 className="mt-3 font-bebas text-4xl tracking-wide md:text-6xl">
            O ALCANCE QUE <span className="text-somma-orange">SUA MARCA</span> GANHA.
          </h2>
          <p className="mt-3 font-dm text-sm text-somma-cream/60 md:text-base">Período analisado: 20 de abril a 19 de maio</p>
        </div>

        {/* Visão geral · números */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {VISAO_GERAL.map(m => (
            <div key={m.label} className="fade-up rounded-3xl border-4 border-somma-cream/10 bg-somma-cream/5 p-5 text-center">
              <p className={`mx-auto mb-3 inline-block rounded-xl ${m.cor} px-3 py-1 font-bebas text-2xl text-somma-cream md:text-3xl`}>
                {m.value}
              </p>
              <p className="font-dm text-xs uppercase tracking-widest text-somma-cream/60 md:text-sm">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Gênero + Faixa etária */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Gênero */}
          <div className="fade-up rounded-3xl border-4 border-somma-cream/10 bg-somma-cream/5 p-6 md:p-8">
            <h3 className="font-bebas text-2xl tracking-wider text-somma-yellow md:text-3xl">Gênero da audiência</h3>
            <div className="mt-6 space-y-5">
              {GENERO.map(g => (
                <div key={g.label}>
                  <div className="mb-1.5 flex items-baseline justify-between font-dm">
                    <span className="text-sm text-somma-cream/80">{g.label}</span>
                    <span className="font-bebas text-2xl text-somma-orange">{g.pct.toLocaleString('pt-BR')}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-somma-cream/10">
                    <div className="h-full rounded-full bg-somma-orange" style={{ width: `${g.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Faixa etária */}
          <div className="fade-up rounded-3xl border-4 border-somma-cream/10 bg-somma-cream/5 p-6 md:p-8">
            <h3 className="font-bebas text-2xl tracking-wider text-somma-yellow md:text-3xl">Faixa etária</h3>
            <div className="mt-6 flex items-end justify-between gap-2" style={{ height: '160px' }}>
              {FAIXA_ETARIA.map(f => (
                <div key={f.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="font-dm text-[10px] text-somma-cream/70 md:text-xs">{f.pct.toLocaleString('pt-BR')}%</span>
                  <div
                    className="w-full rounded-t-md bg-somma-blue"
                    style={{ height: `${(f.pct / MAX_FAIXA) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="font-dm text-[9px] text-somma-cream/50 md:text-[10px]">{f.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 font-dm text-sm leading-relaxed text-somma-cream/70">
              Público principal: adultos entre <span className="font-semibold text-somma-yellow">25 e 44 anos</span>, representando <span className="font-semibold text-somma-orange">73,4%</span> da audiência.
            </p>
          </div>
        </div>

        {/* Horários */}
        <div className="mt-8">
          <div className="fade-up rounded-3xl border-4 border-somma-cream/10 bg-somma-cream/5 p-6 md:p-8">
            <h3 className="font-bebas text-2xl tracking-wider text-somma-yellow md:text-3xl">Horários de pico</h3>
            <div className="mt-6 flex items-end justify-between gap-3" style={{ height: '160px' }}>
              {HORARIOS.map(h => (
                <div key={h.hora} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div
                    className={`w-full rounded-t-md ${h.nivel === 4 ? 'bg-somma-orange' : h.nivel === 3 ? 'bg-somma-yellow' : 'bg-somma-blue'}`}
                    style={{ height: `${(h.nivel / 4) * 100}%` }}
                  />
                  <span className="font-bebas text-base text-somma-cream md:text-lg">{h.hora}</span>
                  <span className="text-center font-dm text-[9px] leading-tight text-somma-cream/50 md:text-[10px]">{h.intensidade}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 font-dm text-sm leading-relaxed text-somma-cream/70">
              Melhor janela: <span className="font-semibold text-somma-yellow">09h às 21h</span>, com maior potencial de alcance entre <span className="font-semibold text-somma-orange">12h e 18h</span>.
            </p>
          </div>
        </div>

        {/* Posicionamento estratégico */}
        <div className="fade-up mt-8 rounded-3xl border-4 border-somma-orange bg-somma-orange/10 p-6 md:p-10">
          <h3 className="font-bebas text-2xl tracking-wider text-somma-orange md:text-3xl">Posicionamento estratégico da audiência</h3>
          <p className="mt-4 font-dm text-base leading-relaxed text-somma-cream/85">
            Uma audiência regional extremamente qualificada, concentrada em Brasília e regiões estratégicas do Distrito Federal,
            com predominância de mulheres entre 25 e 44 anos. Público com alto potencial de consumo, influência social e
            engajamento com marcas de lifestyle, wellness, moda, gastronomia, experiências, eventos e serviços premium.
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DESTAQUES.map((d, i) => (
              <li key={i} className="flex items-start gap-3 font-dm text-sm text-somma-cream/80">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-somma-orange" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
