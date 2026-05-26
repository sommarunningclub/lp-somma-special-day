'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { COTAS, AVULSAS, formatBRL } from '@/lib/proposta-data'
import FloatingElement from '@/components/special-day/FloatingElement'
import InstagramInsightsSection from './InstagramInsightsSection'
import CotaCard from './CotaCard'
import type { Proposta } from '@/lib/types/proposta'

gsap.registerPlugin(ScrollTrigger)

const FALLBACK_WHATSAPP = '5561984070592'

interface Props {
  proposta: Proposta
}

interface ComparativoRow {
  label: string
  values: Record<string, string>
}

const COMPARATIVO_ROWS: ComparativoRow[] = [
  { label: 'Exclusividade por segmento', values: { master: 'Sim', ouro: 'Não', prata: 'Não', apoio: 'Não' } },
  { label: 'Brinde no pré-kit',          values: { master: 'Até 1', ouro: 'Até 1', prata: 'Até 1', apoio: 'Até 1' } },
  { label: 'Sacola Gym Bag',             values: { master: 'Sim', ouro: 'Sim', prata: 'Sim', apoio: 'Não' } },
  { label: 'Backdrop',                   values: { master: 'Sim', ouro: 'Sim', prata: 'Sim', apoio: 'Não' } },
  { label: 'Site do evento',             values: { master: 'Sim', ouro: 'Sim', prata: 'Sim', apoio: 'Sim' } },
  { label: 'Peças digitais',             values: { master: 'Sim', ouro: 'Sim', prata: 'Sim', apoio: 'Não' } },
  { label: 'Fala no evento',             values: { master: 'Sim', ouro: 'Não', prata: 'Não', apoio: 'Não' } },
  { label: 'Entrega de premiação',       values: { master: 'Sim', ouro: 'Sim', prata: 'Não', apoio: 'Não' } },
  { label: 'Vídeo institucional',        values: { master: '30s', ouro: '15s', prata: 'Não', apoio: 'Não' } },
  { label: 'Cortesias',                  values: { master: '5', ouro: '3', prata: '2', apoio: '1' } },
]

export default function PropostaView({ proposta }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const tel = (proposta.whatsapp_telefone || FALLBACK_WHATSAPP).replace(/\D/g, '')
  const cotasVisiveis = COTAS.filter(c => proposta.cotas_visiveis.includes(c.key))
  const avulsasVisiveis = AVULSAS.filter(a => proposta.avulsas_visiveis.includes(a.key))
  const validade = proposta.validade ? new Date(proposta.validade + 'T00:00:00') : null

  function whatsappUrl(item: string) {
    const empresa = proposta.cliente_empresa || proposta.cliente_nome
    const txt = `Olá! Sou da ${empresa} e vi a proposta do Somma Special Day 2026. Tenho interesse no ${item} e gostaria de negociar.`
    return `https://wa.me/${tel}?text=${encodeURIComponent(txt)}`
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.fade-up').forEach(el => {
        gsap.from(el, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <main ref={rootRef} className="relative overflow-hidden bg-somma-cream text-somma-black">
      {/* ====== HERO / CAPA ====== */}
      <section className="relative overflow-hidden px-4 py-16 md:py-24">
        <FloatingElement src="/elemento-relogio.svg" alt="" speed={0.8} rotate={-12}
          className="top-[8%] left-[3%] w-20 md:w-32 opacity-40" />
        <FloatingElement src="/elemento-tenis.svg" alt="" speed={1.1} rotate={8}
          className="hidden md:block bottom-[10%] right-[4%] w-32 md:w-44 opacity-50" />
        <FloatingElement src="/elemento-corredor.svg" alt="" speed={0.9} rotate={-6}
          className="bottom-[6%] left-[4%] w-24 md:w-36 opacity-40" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-8 w-56 md:w-80">
            <Image src="/logo-special-day.svg" alt="Somma Special Day" width={800} height={400} className="h-auto w-full" priority />
          </div>
          <p className="font-dm text-xs uppercase tracking-[0.3em] text-somma-orange md:text-sm">
            Proposta Comercial · Patrocínio · 18.07.2026 · COPMDF Brasília
          </p>
          <h1 className="mt-6 font-bebas text-5xl leading-[0.95] tracking-wide text-somma-black sm:text-6xl md:text-7xl">
            Proposta para <span className="text-somma-orange">{proposta.cliente_nome}</span>
          </h1>
          {proposta.cliente_empresa && (
            <p className="mt-3 font-dm text-base text-somma-black/60 md:text-lg">{proposta.cliente_empresa}</p>
          )}
          {proposta.mensagem_abertura && (
            <p className="mx-auto mt-8 max-w-2xl whitespace-pre-line rounded-2xl border-4 border-somma-black bg-white px-6 py-5 text-left font-dm text-sm leading-relaxed text-somma-black/80 shadow-[6px_6px_0_#FDB716] md:text-base">
              {proposta.mensagem_abertura}
            </p>
          )}
          <p className="mt-8 font-bebas text-xl tracking-widest text-somma-black/80 md:text-2xl">
            Onde a comunidade encontra a marca.
          </p>

          <button
            type="button"
            onClick={() => {
              document.getElementById('cotas')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="mt-10 inline-flex items-center gap-3 rounded-full border-4 border-somma-black bg-somma-orange px-8 py-4 font-bebas text-lg tracking-widest text-somma-cream shadow-[6px_6px_0_#0a0a0a] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-somma-black hover:shadow-[3px_3px_0_#0a0a0a] md:text-xl"
          >
            Veja nossas cotas
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </section>

      {/* ====== SOBRE O EVENTO ====== */}
      <section className="bg-somma-black px-4 py-16 text-somma-cream md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="fade-up font-dm text-xs uppercase tracking-[0.3em] text-somma-yellow md:text-sm">Sobre o evento</p>
          <h2 className="fade-up mt-3 font-bebas text-4xl leading-tight tracking-wide md:text-6xl">
            O ENCONTRO QUE <span className="text-somma-orange">MOVE BRASÍLIA</span>.
          </h2>
          <p className="fade-up mx-auto mt-6 max-w-2xl font-dm text-base leading-relaxed text-somma-cream/80 md:text-lg">
            O Somma Special Day é a celebração de 1 ano de uma das comunidades de corrida que mais cresceu em Brasília.
            Mais de 4.000 membros. Eventos lotados desde a primeira edição. Uma marca que construiu pertencimento real,
            não audiência inflada.
          </p>
          <p className="fade-up mx-auto mt-4 max-w-2xl font-dm text-base leading-relaxed text-somma-cream/80 md:text-lg">
            No dia <span className="font-semibold text-somma-yellow">18 de julho</span>, 400 pessoas vão se reunir no COPMDF
            para correr 8km, comer junto, beber junto, ouvir samba, dançar com DJ e viver uma manhã inteira de comunidade.
            Sua marca pode estar no meio disso. Não na borda. <span className="font-semibold text-somma-orange">No meio.</span>
          </p>
        </div>
      </section>

      {/* ====== GALERIA EDIÇÃO ANTERIOR ====== */}
      <section className="bg-somma-cream px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="fade-up font-dm text-xs uppercase tracking-[0.3em] text-somma-orange md:text-sm">Edição anterior</p>
            <h2 className="fade-up mt-3 font-bebas text-4xl tracking-wide md:text-6xl">
              UM EVENTO QUE <span className="text-somma-orange">JÁ ACONTECEU</span>.
            </h2>
            <p className="fade-up mx-auto mt-4 max-w-2xl font-dm text-sm text-somma-black/70 md:text-base">
              Não é projeção. É registro. Veja como foi a última edição — e imagine sua marca dentro desse cenário.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="fade-up group relative aspect-[4/5] overflow-hidden rounded-2xl border-4 border-somma-black bg-somma-black shadow-[5px_5px_0_#0a0a0a] transition-all duration-300 hover:-translate-y-1 hover:shadow-[7px_7px_0_#FF4800] md:rounded-3xl md:shadow-[6px_6px_0_#0a0a0a]"
              >
                <Image
                  src={`/evento-2025-${n}.jpg`}
                  alt={`Somma Special Day edição anterior — foto ${n}`}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== AUDIÊNCIA ====== */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="fade-up font-dm text-xs uppercase tracking-[0.3em] text-somma-orange md:text-sm">A audiência</p>
            <h2 className="fade-up mt-3 font-bebas text-4xl tracking-wide md:text-6xl">
              QUEM ESTÁ NO SOMMA, <span className="text-somma-orange">CONSOME</span>,
              <span className="text-somma-blue"> VIVE</span> E <span className="text-somma-pink">COMPARTILHA</span>.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { num: '400',     label: 'pessoas no evento', sub: 'capacidade máxima esgotável', cor: 'bg-somma-orange' },
              { num: '+5000',  label: 'membros cadastrados', sub: 'comunidade ativa nos canais Somma', cor: 'bg-somma-blue' },
              { num: '+50k',    label: 'impressões orgânicas', sub: 'alcance projetado pré e pós-evento', cor: 'bg-somma-yellow' },
              { num: 'A/B',     label: 'perfil de público', sub: 'consumidor de alto valor', cor: 'bg-somma-pink' },
              { num: 'Wellness',label: 'lifestyle integrado', sub: 'corrida, saúde, moda, gastronomia', cor: 'bg-somma-orange' },
              { num: '9h',      label: 'permanência total', sub: 'do check-in ao encerramento', cor: 'bg-somma-blue' },
            ].map((s, i) => (
              <div key={i} className="fade-up rounded-3xl border-4 border-somma-black bg-white p-6 shadow-[6px_6px_0_#0a0a0a]">
                <div className={`mb-3 inline-block rounded-xl ${s.cor} px-3 py-1 font-bebas text-3xl text-somma-cream md:text-4xl`}>
                  {s.num}
                </div>
                <p className="font-bebas text-xl tracking-wider text-somma-black">{s.label}</p>
                <p className="mt-1 font-dm text-sm text-somma-black/60">{s.sub}</p>
              </div>
            ))}
          </div>

          <p className="fade-up mt-10 text-center font-bebas text-2xl italic tracking-wide text-somma-black/70 md:text-3xl">
            Um evento onde marcas não aparecem — pertencem.
          </p>
        </div>
      </section>

      {/* ====== INSTAGRAM INSIGHTS ====== */}
      <InstagramInsightsSection />

      {/* ====== POR QUE PATROCINAR ====== */}
      <section className="bg-somma-blue px-4 py-16 text-somma-cream md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="fade-up font-dm text-xs uppercase tracking-[0.3em] text-somma-yellow md:text-sm">Por que patrocinar</p>
            <h2 className="fade-up mt-3 font-bebas text-4xl tracking-wide md:text-6xl">CINCO MOTIVOS QUE IMPORTAM.</h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
            {[
              { title: 'Comunidade real',     body: '4.000+ membros que se relacionam diariamente, não seguidores passivos.' },
              { title: 'Permanência alta',    body: '9 horas de evento. O público chega no escuro e sai depois do almoço. Sua marca tem tempo de existir.' },
              { title: 'Lifestyle integrado', body: 'Esporte, música, gastronomia, moda e família no mesmo dia. Sua marca encontra contexto, não interrupção.' },
              { title: 'Ambiente premium',    body: 'COPMDF, vista para o Lago Paranoá, percurso pelas embaixadas. O cenário é parte da experiência.' },
              { title: 'Ativação de verdade', body: 'Aqui sua marca não tem só logo no banner. Tem espaço, voz e contato direto com quem importa.' },
            ].map((m, i) => (
              <div key={i} className="fade-up rounded-2xl border-4 border-somma-black bg-somma-cream p-5 text-somma-black shadow-[5px_5px_0_#0a0a0a]">
                <div className="mb-2 inline-block rounded-full bg-somma-orange px-3 py-0.5 font-bebas text-sm tracking-widest text-somma-cream">
                  0{i + 1}
                </div>
                <h3 className="font-bebas text-2xl tracking-wider text-somma-black">{m.title}</h3>
                <p className="mt-2 font-dm text-sm leading-snug text-somma-black/70">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== COMO AS MARCAS PARTICIPAM ====== */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="fade-up font-dm text-xs uppercase tracking-[0.3em] text-somma-orange md:text-sm">Como as marcas participam</p>
            <h2 className="fade-up mt-3 font-bebas text-4xl tracking-wide md:text-5xl">
              Aqui, a marca não é só vista. <span className="text-somma-orange">Ela é vivida.</span>
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {[
              { n: 1, title: 'Naming na camiseta oficial',          body: 'A marca estampada na camiseta Thermodry Track&Field do kit oficial. 400 peças circulando antes, durante e depois do evento.' },
              { n: 2, title: 'Divulgação nas redes sociais Somma',  body: 'Posts dedicados, stories, reels e menções nos canais oficiais do Somma Club para uma comunidade engajada de 4.000+ membros.' },
              { n: 3, title: 'Disparo de e-mail para base Somma + Evolve', body: 'Mais de 90 mil pessoas alcançadas via e-mail marketing direcionado.' },
              { n: 4, title: 'Leads qualificados pós-evento',       body: 'Acesso à base de inscritos do evento e à Lista VIP — nome, e-mail, CPF e telefone.' },
              { n: 5, title: 'Inserção do nome na página de inscrição', body: 'Marca visível na página oficial de inscrição do evento, presente em cada conversão.' },
            ].map(item => (
              <div key={item.n} className="fade-up flex flex-col gap-4 rounded-2xl border-4 border-somma-black bg-white p-5 shadow-[5px_5px_0_#FDB716] md:flex-row md:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-4 border-somma-black bg-somma-yellow font-bebas text-3xl text-somma-black">
                  {item.n}
                </div>
                <div>
                  <h3 className="font-bebas text-xl tracking-wider text-somma-black">{item.title}</h3>
                  <p className="font-dm text-sm text-somma-black/70">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== COTAS ====== */}
      {cotasVisiveis.length > 0 && (
        <section id="cotas" className="scroll-mt-8 bg-somma-black px-4 py-16 text-somma-cream md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="fade-up font-dm text-xs uppercase tracking-[0.3em] text-somma-yellow md:text-sm">Cotas de patrocínio</p>
              <h2 className="fade-up mt-3 font-bebas text-4xl tracking-wide md:text-6xl">
                {cotasVisiveis.map(c => c.nome).join(' · ')}
              </h2>
              <p className="fade-up mx-auto mt-4 max-w-2xl font-dm text-sm text-somma-cream/70 md:text-base">
                {cotasVisiveis.length} níveis de participação. Cada um com benefícios proporcionais ao investimento e à visibilidade.
                Exclusividade por segmento garantida na cota Master.
              </p>
            </div>

            <div className={`mt-14 grid gap-10 ${cotasVisiveis.length >= 4 ? 'lg:grid-cols-4' : cotasVisiveis.length === 3 ? 'lg:grid-cols-3' : cotasVisiveis.length === 2 ? 'md:grid-cols-2' : 'max-w-md mx-auto'}`}>
              {cotasVisiveis.map(cota => {
                const valor = proposta.valores_personalizados[cota.key] ?? cota.valor
                return (
                  <div key={cota.key} className="fade-up">
                    <CotaCard
                      cota={cota}
                      valor={valor}
                      recomendada={proposta.cota_recomendada === cota.key}
                      whatsappUrl={whatsappUrl(`patrocínio cota ${cota.nome} (${formatBRL(valor)})`)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ====== COMPARATIVO ====== */}
      {cotasVisiveis.length > 1 && (
        <section className="px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="fade-up font-dm text-xs uppercase tracking-[0.3em] text-somma-orange md:text-sm">Comparativo</p>
              <h2 className="fade-up mt-3 font-bebas text-4xl tracking-wide md:text-5xl">Resumo lado a lado</h2>
            </div>

            <div className="fade-up mt-10 overflow-x-auto rounded-3xl border-4 border-somma-black bg-white shadow-[8px_8px_0_#005EFF]">
              <table className="w-full text-left font-dm">
                <thead className="bg-somma-black text-somma-cream">
                  <tr>
                    <th className="px-4 py-3 font-bebas text-base tracking-widest">Benefício</th>
                    {cotasVisiveis.map(c => (
                      <th key={c.key} className="px-4 py-3 font-bebas text-base tracking-widest">{c.nome}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-somma-black/10 bg-somma-cream/40">
                    <td className="px-4 py-3 font-bebas tracking-wider">Valor</td>
                    {cotasVisiveis.map(c => {
                      const valor = proposta.valores_personalizados[c.key] ?? c.valor
                      return <td key={c.key} className="px-4 py-3 font-bebas text-somma-orange">{formatBRL(valor)}</td>
                    })}
                  </tr>
                  {COMPARATIVO_ROWS.map(row => (
                    <tr key={row.label} className="border-t border-somma-black/10 even:bg-somma-cream/30">
                      <td className="px-4 py-3 text-sm text-somma-black/80">{row.label}</td>
                      {cotasVisiveis.map(c => (
                        <td key={c.key} className="px-4 py-3 text-sm text-somma-black/80">
                          {row.values[c.key] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ====== AVULSAS ====== */}
      {avulsasVisiveis.length > 0 && (
        <section className="bg-somma-yellow/20 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="fade-up font-dm text-xs uppercase tracking-[0.3em] text-somma-orange md:text-sm">Cotas avulsas de experiência</p>
              <h2 className="fade-up mt-3 font-bebas text-4xl tracking-wide md:text-5xl">
                Para marcas com <span className="text-somma-orange">entregas pontuais</span>
              </h2>
            </div>

            <div className="fade-up mt-10 overflow-x-auto rounded-3xl border-4 border-somma-black bg-white shadow-[8px_8px_0_#FDB716]">
              <table className="w-full text-left font-dm">
                <thead className="bg-somma-black text-somma-cream">
                  <tr>
                    <th className="px-4 py-3 font-bebas text-sm tracking-widest">Ativação</th>
                    <th className="px-4 py-3 font-bebas text-sm tracking-widest">Valor</th>
                    <th className="px-4 py-3 font-bebas text-sm tracking-widest">Entrega</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {avulsasVisiveis.map(a => (
                    <tr key={a.key} className="border-t border-somma-black/10 even:bg-somma-cream/30">
                      <td className="px-4 py-3 text-sm text-somma-black/90">{a.nome}</td>
                      <td className="px-4 py-3 font-bebas text-somma-orange">{formatBRL(a.valor)}</td>
                      <td className="px-4 py-3 text-sm text-somma-black/70">{a.entrega}</td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={whatsappUrl(`ativação avulsa "${a.nome}" (${formatBRL(a.valor)})`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded-full border-2 border-somma-black bg-somma-orange px-4 py-1.5 font-bebas text-xs tracking-widest text-somma-cream hover:bg-somma-black"
                        >
                          Tenho interesse
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ====== ENCERRAMENTO ====== */}
      <section className="bg-somma-orange px-4 py-20 text-somma-cream md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="fade-up font-bebas text-4xl leading-tight tracking-wide md:text-6xl">
            VOCÊ NÃO ESTÁ PATROCINANDO UM EVENTO.
            <br />
            <span className="text-somma-black">ESTÁ ENTRANDO EM UMA COMUNIDADE.</span>
          </h2>
          <p className="fade-up mx-auto mt-6 max-w-2xl font-dm text-base leading-relaxed text-somma-cream/90 md:text-lg">
            O Somma cresceu porque construiu vínculos reais. Quando uma marca entra aqui, ela não compra mídia: ganha pertencimento.
            E pertencimento dura mais que campanha.
          </p>
          <p className="fade-up mt-4 font-bebas text-2xl tracking-widest md:text-3xl">Vamos correr juntos?</p>

          <a
            href={whatsappUrl('patrocínio do Somma Special Day 2026')}
            target="_blank"
            rel="noopener noreferrer"
            className="fade-up mt-10 inline-block rounded-full border-4 border-somma-black bg-somma-black px-10 py-5 font-bebas text-2xl tracking-widest text-somma-cream shadow-[6px_6px_0_#0a0a0a] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-somma-cream hover:text-somma-black hover:shadow-[3px_3px_0_#0a0a0a]"
          >
            Falar pelo WhatsApp
          </a>

          {validade && (
            <p className="mt-8 font-dm text-xs uppercase tracking-widest text-somma-cream/70">
              Proposta válida até {validade.toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </section>

      {/* ====== MARQUEE PARCEIROS ====== */}
      <section className="overflow-hidden border-y-4 border-somma-black bg-somma-orange py-10">
        <div className="flex gap-8 whitespace-nowrap will-change-transform animate-[marquee_22s_linear_infinite] md:gap-16">
          {[...Array(3)].flatMap((_, rep) =>
            ['Red Bull', 'Track & Field', 'Academia Evolve', 'Corona', 'Heineken', 'Big Box', 'Somma Club', 'COPMDF'].map((name, i) => (
              <span key={`${rep}-${i}`} className="flex items-center gap-4 font-bebas text-4xl tracking-[0.15em] text-somma-cream">
                {name}
                <span className="text-5xl text-somma-yellow">✦</span>
              </span>
            ))
          )}
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t-4 border-somma-orange bg-somma-black pb-8 pt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div className="space-y-6">
              <Image src="https://cdn.shopify.com/s/files/1/0788/1932/8253/files/HORIZONTAL_PRETA_LARANJA.png?v=1772322941" alt="SOMMA Logo" width={160} height={40} className="h-10 w-auto invert brightness-0" />
              <p className="max-w-xs font-dm text-sm leading-relaxed text-somma-cream/80">
                Junte-se ao SOMMA Running Club, a maior comunidade de corrida de Brasília. Mais de 4.300 membros ativos!
              </p>
              <div className="flex space-x-5">
                <a href="https://www.instagram.com/somma.club/" target="_blank" rel="noopener noreferrer" className="text-somma-cream/60 transition-all duration-300 hover:-translate-y-1 hover:text-somma-orange" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </a>
                <a href="https://www.strava.com/clubs/1608501" target="_blank" rel="noopener noreferrer" className="text-somma-cream/60 transition-all duration-300 hover:-translate-y-1 hover:text-somma-orange" aria-label="Strava">
                  <svg className="h-6 w-6" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="226.172,26.001 90.149,288.345 170.29,288.345 226.172,184.036 281.605,288.345 361.116,288.345" fill="currentColor"></polygon><polygon points="361.116,288.345 321.675,367.586 281.605,288.345 220.871,288.345 321.675,485.999 421.851,288.345" fill="currentColor"></polygon></svg>
                </a>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="font-bebas text-2xl tracking-widest text-somma-yellow">Contato</h3>
              <ul className="space-y-4 font-dm text-sm text-somma-cream/80">
                <li><a href="mailto:contato@sommaclub.com.br" className="flex items-center gap-3 transition-colors hover:text-somma-orange">contato@sommaclub.com.br</a></li>
                <li><a href={`https://wa.me/${tel}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-colors hover:text-somma-orange">+55 (61) 9537-2477</a></li>
              </ul>
              <p className="mt-4 font-dm text-sm text-somma-cream/60">
                Responsável: <span className="text-somma-cream">{proposta.contato_responsavel || 'Alex Rodrigues'}</span>
              </p>
            </div>

            <div className="space-y-5">
              <h3 className="font-bebas text-2xl tracking-widest text-somma-yellow">Mais do Somma</h3>
              <ul className="space-y-3 font-dm text-sm">
                <li><a href="https://sommaclub.com.br/seja-parceiro" className="inline-block text-somma-cream/80 transition-all hover:translate-x-1 hover:text-somma-orange">Seja um Parceiro Somma Club</a></li>
                <li><a href="https://sommaclub.com.br/evolve" className="inline-block text-somma-cream/80 transition-all hover:translate-x-1 hover:text-somma-orange">Somma & Evolve</a></li>
              </ul>
            </div>

            <div className="space-y-5">
              <h3 className="font-bebas text-2xl tracking-widest text-somma-yellow">Corporativo</h3>
              <ul className="space-y-3 font-dm text-sm">
                <li><a href="https://wa.me/5561995372477" target="_blank" rel="noopener noreferrer" className="inline-block text-somma-cream/80 transition-all hover:translate-x-1 hover:text-somma-orange">Somma Eventos</a></li>
                <li><a href="https://wa.me/5561995372477" target="_blank" rel="noopener noreferrer" className="inline-block text-somma-cream/80 transition-all hover:translate-x-1 hover:text-somma-orange">Somma Mídia</a></li>
                <li><a href="https://wa.me/5561995372477" target="_blank" rel="noopener noreferrer" className="inline-block text-somma-cream/80 transition-all hover:translate-x-1 hover:text-somma-orange">Assessoria Somma Club</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 border-t border-somma-cream/10 pt-8">
            <div className="text-center font-dm">
              <div className="text-sm text-somma-cream/60">© 2026 Somma Running Club. All rights reserved.</div>
              <div className="mt-1 text-xs text-somma-cream/40">CNPJ 61.315.987/0001-28</div>
            </div>
            <a href="/login-admin" className="font-dm text-[11px] uppercase tracking-widest text-somma-cream/20 transition-colors hover:text-somma-cream/50">admin</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
