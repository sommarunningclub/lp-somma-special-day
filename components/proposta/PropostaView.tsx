'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { COTAS, AVULSAS, formatBRL } from '@/lib/proposta-data'
import CotaCard from './CotaCard'
import type { Proposta } from '@/lib/types/proposta'

gsap.registerPlugin(ScrollTrigger)

const FALLBACK_WHATSAPP = '5561995372477'

interface Props {
  proposta: Proposta
}

interface ComparativoRow {
  label: string
  values: Record<string, string>
}

const COMPARATIVO_ROWS: ComparativoRow[] = [
  { label: 'Exclusividade por segmento', values: { master: 'Sim', ouro: 'Não', prata: 'Não', apoio: 'Não' } },
  { label: 'Espaço de ativação',         values: { master: '60m²', ouro: 'Livre', prata: 'Livre', apoio: '6m²' } },
  { label: 'Brinde no kit',              values: { master: 'Sim', ouro: 'Sim', prata: 'Sim', apoio: 'Não' } },
  { label: 'Camiseta do atleta',         values: { master: 'Sim', ouro: 'Sim', prata: 'Não', apoio: 'Não' } },
  { label: 'Sacola Gym Bag',             values: { master: 'Sim', ouro: 'Sim', prata: 'Sim', apoio: 'Não' } },
  { label: 'Backdrop',                   values: { master: 'Sim', ouro: 'Sim', prata: 'Sim', apoio: 'Não' } },
  { label: 'Site do evento',             values: { master: 'Sim', ouro: 'Sim', prata: 'Sim', apoio: 'Sim' } },
  { label: 'Peças digitais',             values: { master: 'Sim', ouro: 'Sim', prata: 'Sim', apoio: 'Não' } },
  { label: 'Fala no evento',             values: { master: 'Sim', ouro: 'Não', prata: 'Não', apoio: 'Não' } },
  { label: 'Entrega de premiação',       values: { master: 'Sim', ouro: 'Sim', prata: 'Não', apoio: 'Não' } },
  { label: 'Vídeo institucional',        values: { master: '30s', ouro: '15s', prata: 'Não', apoio: 'Não' } },
  { label: 'Cortesias',                  values: { master: '2', ouro: '30', prata: '15', apoio: '3' } },
]

export default function PropostaView({ proposta }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const tel = (proposta.whatsapp_telefone || FALLBACK_WHATSAPP).replace(/\D/g, '')
  const cotasVisiveis = COTAS.filter(c => proposta.cotas_visiveis.includes(c.key))
  const avulsasVisiveis = AVULSAS.filter(a => proposta.avulsas_visiveis.includes(a.key))
  const validade = proposta.validade ? new Date(proposta.validade + 'T00:00:00') : null

  function whatsappUrl(contexto: string) {
    const empresa = proposta.cliente_empresa || proposta.cliente_nome
    const txt = `Ola! Eu sou da ${empresa} e vi a proposta do Somma Special Day 2026. ${contexto}`
    return `https://wa.me/${tel}?text=${encodeURIComponent(txt)}`
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.fade-up').forEach(el => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <main ref={rootRef} className="relative overflow-hidden bg-somma-black text-somma-cream">
      {/* ====== HERO / CAPA ====== */}
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,72,0,0.08)_0%,_transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-10 w-48 md:w-72">
            <Image src="/logo-special-day.svg" alt="Somma Special Day" width={800} height={400} className="h-auto w-full" priority />
          </div>
          <p className="font-dm text-[11px] uppercase tracking-[0.4em] text-somma-orange md:text-xs">
            Proposta Comercial · Patrocínio · 18 Jul 2026 · Brasília
          </p>
          <h1 className="mt-8 font-bebas text-6xl leading-[0.9] tracking-wide sm:text-7xl md:text-8xl lg:text-9xl">
            <span className="text-somma-cream">Proposta para</span>
            <br />
            <span className="text-somma-orange">{proposta.cliente_nome}</span>
          </h1>
          {proposta.cliente_empresa && (
            <p className="mt-4 font-dm text-base text-somma-cream/50 md:text-lg">{proposta.cliente_empresa}</p>
          )}
          {proposta.mensagem_abertura && (
            <p className="mx-auto mt-10 max-w-2xl whitespace-pre-line rounded-2xl border border-somma-cream/10 bg-somma-cream/5 px-8 py-6 text-left font-dm text-sm leading-relaxed text-somma-cream/80 backdrop-blur-sm md:text-base">
              {proposta.mensagem_abertura}
            </p>
          )}
          <div className="mt-12 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-somma-orange/50" />
            <p className="font-dm text-xs uppercase tracking-[0.3em] text-somma-cream/50">
              Onde a comunidade encontra a marca
            </p>
            <div className="h-px w-12 bg-somma-orange/50" />
          </div>
        </div>
      </section>

      {/* ====== SOBRE O EVENTO ====== */}
      <section className="relative border-t border-somma-cream/5 px-6 py-20 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="fade-up font-dm text-[11px] uppercase tracking-[0.4em] text-somma-yellow">Sobre o evento</p>
              <h2 className="fade-up mt-4 font-bebas text-5xl leading-[0.95] tracking-wide md:text-6xl">
                O ENCONTRO QUE<br /><span className="text-somma-orange">MOVE BRASÍLIA.</span>
              </h2>
            </div>
            <div className="space-y-5">
              <p className="fade-up font-dm text-base leading-relaxed text-somma-cream/75 md:text-lg">
                O Somma Special Day é a celebração de 1 ano de uma das comunidades de corrida que mais cresceu em Brasília.
                Mais de 4.000 membros. Eventos lotados desde a primeira edição.
              </p>
              <p className="fade-up font-dm text-base leading-relaxed text-somma-cream/75 md:text-lg">
                No dia <span className="font-semibold text-somma-yellow">18 de julho</span>, 400 pessoas vão se reunir no COPMDF
                para correr 8km, comer junto, beber junto, ouvir samba, dançar com DJ e viver uma manhã inteira de comunidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====== MÉTRICAS / AUDIÊNCIA ====== */}
      <section className="border-t border-somma-cream/5 bg-somma-cream px-6 py-20 text-somma-black md:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="fade-up text-center font-dm text-[11px] uppercase tracking-[0.4em] text-somma-orange">Audiência & Alcance</p>
          <h2 className="fade-up mt-4 text-center font-bebas text-4xl tracking-wide md:text-6xl">
            NÚMEROS QUE <span className="text-somma-orange">FALAM.</span>
          </h2>

          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { num: '400', label: 'Atletas no evento', accent: 'text-somma-orange' },
              { num: '4.000+', label: 'Membros ativos', accent: 'text-somma-blue' },
              { num: '50k+', label: 'Impressões orgânicas', accent: 'text-somma-orange' },
              { num: '90k+', label: 'Base de e-mail', accent: 'text-somma-blue' },
              { num: '9h', label: 'Permanência no evento', accent: 'text-somma-yellow' },
              { num: 'A/B', label: 'Perfil de consumo', accent: 'text-somma-pink' },
              { num: '8km', label: 'Percurso oficial', accent: 'text-somma-orange' },
              { num: '100%', label: 'Engajamento real', accent: 'text-somma-blue' },
            ].map((s, i) => (
              <div key={i} className="fade-up text-center">
                <p className={`font-bebas text-5xl leading-none md:text-6xl lg:text-7xl ${s.accent}`}>
                  {s.num}
                </p>
                <p className="mt-3 font-dm text-xs uppercase tracking-[0.2em] text-somma-black/60 md:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <p className="fade-up mt-14 text-center font-dm text-sm italic text-somma-black/50 md:text-base">
            Um evento onde marcas não aparecem — pertencem.
          </p>
        </div>
      </section>

      {/* ====== POR QUE PATROCINAR ====== */}
      <section className="border-t border-somma-cream/5 px-6 py-20 md:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="fade-up text-center font-dm text-[11px] uppercase tracking-[0.4em] text-somma-yellow">Por que patrocinar</p>
          <h2 className="fade-up mt-4 text-center font-bebas text-4xl tracking-wide md:text-6xl">
            CINCO MOTIVOS QUE <span className="text-somma-orange">IMPORTAM.</span>
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
            {[
              { title: 'Comunidade real',     body: '4.000+ membros que se relacionam diariamente, não seguidores passivos.' },
              { title: 'Permanência alta',    body: '9 horas de evento. O público chega no escuro e sai depois do almoço.' },
              { title: 'Lifestyle integrado', body: 'Esporte, música, gastronomia, moda e família no mesmo dia.' },
              { title: 'Ambiente premium',    body: 'COPMDF, vista para o Lago Paranoá, percurso pelas embaixadas.' },
              { title: 'Ativação de verdade', body: 'Sua marca tem espaço, voz e contato direto com quem importa.' },
            ].map((m, i) => (
              <div key={i} className="fade-up rounded-2xl border border-somma-cream/10 bg-somma-cream/5 p-6">
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-somma-orange font-bebas text-sm text-somma-cream">
                  {i + 1}
                </div>
                <h3 className="font-bebas text-xl tracking-wider text-somma-cream">{m.title}</h3>
                <p className="mt-2 font-dm text-sm leading-relaxed text-somma-cream/60">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== COMO AS MARCAS PARTICIPAM ====== */}
      <section className="border-t border-somma-cream/5 bg-somma-cream/5 px-6 py-20 md:py-32">
        <div className="mx-auto max-w-5xl">
          <p className="fade-up text-center font-dm text-[11px] uppercase tracking-[0.4em] text-somma-orange">Entregas garantidas</p>
          <h2 className="fade-up mt-4 text-center font-bebas text-4xl tracking-wide md:text-5xl">
            A marca não é só vista. <span className="text-somma-orange">É vivida.</span>
          </h2>

          <div className="mt-12 space-y-4">
            {[
              { n: 1, title: 'Naming na camiseta oficial',          body: 'Marca estampada na camiseta Thermodry Track&Field do kit oficial. 400 peças circulando antes, durante e depois.' },
              { n: 2, title: 'Divulgação nas redes sociais Somma',  body: 'Posts dedicados, stories, reels e menções nos canais oficiais para uma comunidade engajada de 4.000+ membros.' },
              { n: 3, title: 'Disparo de e-mail para base Somma + Evolve', body: 'Mais de 90 mil pessoas alcançadas via e-mail marketing direcionado.' },
              { n: 4, title: 'Leads qualificados pós-evento',       body: 'Acesso à base de inscritos do evento e à Lista VIP — nome, e-mail, CPF e telefone.' },
              { n: 5, title: 'Inserção na página de inscrição', body: 'Marca visível na página oficial de inscrição do evento, presente em cada conversão.' },
            ].map(item => (
              <div key={item.n} className="fade-up flex items-start gap-5 rounded-2xl border border-somma-cream/10 bg-somma-black/50 p-6 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-somma-orange font-bebas text-xl text-somma-cream">
                  {item.n}
                </div>
                <div>
                  <h3 className="font-bebas text-xl tracking-wider text-somma-cream">{item.title}</h3>
                  <p className="mt-1 font-dm text-sm leading-relaxed text-somma-cream/60">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== COTAS ====== */}
      {cotasVisiveis.length > 0 && (
        <section className="border-t border-somma-cream/5 bg-somma-cream px-6 py-20 text-somma-black md:py-32">
          <div className="mx-auto max-w-7xl">
            <p className="fade-up text-center font-dm text-[11px] uppercase tracking-[0.4em] text-somma-orange">Cotas de patrocínio</p>
            <h2 className="fade-up mt-4 text-center font-bebas text-4xl tracking-wide md:text-6xl">
              {cotasVisiveis.map(c => c.nome).join(' · ')}
            </h2>
            <p className="fade-up mx-auto mt-4 max-w-2xl text-center font-dm text-sm text-somma-black/60 md:text-base">
              {cotasVisiveis.length} níveis de participação. Cada um com benefícios proporcionais ao investimento e à visibilidade.
            </p>

            <div className={`mt-14 grid gap-8 ${cotasVisiveis.length >= 4 ? 'lg:grid-cols-4' : cotasVisiveis.length === 3 ? 'lg:grid-cols-3' : cotasVisiveis.length === 2 ? 'md:grid-cols-2' : 'max-w-md mx-auto'}`}>
              {cotasVisiveis.map(cota => {
                const valor = proposta.valores_personalizados[cota.key] ?? cota.valor
                return (
                  <div key={cota.key} className="fade-up">
                    <CotaCard
                      cota={cota}
                      valor={valor}
                      recomendada={proposta.cota_recomendada === cota.key}
                      whatsappUrl={whatsappUrl(`Tenho interesse na cota ${cota.nome} (${formatBRL(valor)}).`)}
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
        <section className="border-t border-somma-cream/5 px-6 py-20 md:py-32">
          <div className="mx-auto max-w-6xl">
            <p className="fade-up text-center font-dm text-[11px] uppercase tracking-[0.4em] text-somma-yellow">Comparativo</p>
            <h2 className="fade-up mt-4 text-center font-bebas text-4xl tracking-wide md:text-5xl">Resumo lado a lado</h2>

            <div className="fade-up mt-12 overflow-x-auto rounded-2xl border border-somma-cream/10">
              <table className="w-full text-left font-dm">
                <thead className="bg-somma-cream/5">
                  <tr>
                    <th className="px-5 py-4 font-bebas text-sm tracking-widest text-somma-cream/60">Benefício</th>
                    {cotasVisiveis.map(c => (
                      <th key={c.key} className="px-5 py-4 font-bebas text-sm tracking-widest text-somma-orange">{c.nome}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-somma-cream/5">
                    <td className="px-5 py-3 font-bebas tracking-wider text-somma-cream/80">Valor</td>
                    {cotasVisiveis.map(c => {
                      const valor = proposta.valores_personalizados[c.key] ?? c.valor
                      return <td key={c.key} className="px-5 py-3 font-bebas text-somma-orange">{formatBRL(valor)}</td>
                    })}
                  </tr>
                  {COMPARATIVO_ROWS.map(row => (
                    <tr key={row.label} className="border-t border-somma-cream/5">
                      <td className="px-5 py-3 text-sm text-somma-cream/60">{row.label}</td>
                      {cotasVisiveis.map(c => (
                        <td key={c.key} className="px-5 py-3 text-sm text-somma-cream/80">
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
        <section className="border-t border-somma-cream/5 bg-somma-cream/5 px-6 py-20 md:py-32">
          <div className="mx-auto max-w-5xl">
            <p className="fade-up text-center font-dm text-[11px] uppercase tracking-[0.4em] text-somma-orange">Cotas avulsas</p>
            <h2 className="fade-up mt-4 text-center font-bebas text-4xl tracking-wide md:text-5xl">
              Ativações com <span className="text-somma-orange">entregas pontuais</span>
            </h2>

            <div className="fade-up mt-12 overflow-x-auto rounded-2xl border border-somma-cream/10">
              <table className="w-full text-left font-dm">
                <thead className="bg-somma-cream/5">
                  <tr>
                    <th className="px-5 py-4 font-bebas text-sm tracking-widest text-somma-cream/60">Ativação</th>
                    <th className="px-5 py-4 font-bebas text-sm tracking-widest text-somma-cream/60">Valor</th>
                    <th className="px-5 py-4 font-bebas text-sm tracking-widest text-somma-cream/60">Entrega</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {avulsasVisiveis.map(a => (
                    <tr key={a.key} className="border-t border-somma-cream/5">
                      <td className="px-5 py-4 text-sm text-somma-cream/80">{a.nome}</td>
                      <td className="px-5 py-4 font-bebas text-lg text-somma-orange">{formatBRL(a.valor)}</td>
                      <td className="px-5 py-4 text-sm text-somma-cream/50">{a.entrega}</td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={whatsappUrl(`Tenho interesse na ativação avulsa "${a.nome}" (${formatBRL(a.valor)}).`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded-full bg-somma-orange px-5 py-2 font-bebas text-xs tracking-widest text-somma-cream transition-all hover:bg-somma-cream hover:text-somma-black"
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
      <section className="relative border-t border-somma-cream/5 px-6 py-24 md:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,72,0,0.06)_0%,_transparent_70%)]" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h2 className="fade-up font-bebas text-4xl leading-tight tracking-wide md:text-6xl lg:text-7xl">
            VOCÊ NÃO ESTÁ PATROCINANDO UM EVENTO.
            <br />
            <span className="text-somma-orange">ESTÁ ENTRANDO EM UMA COMUNIDADE.</span>
          </h2>
          <p className="fade-up mx-auto mt-8 max-w-2xl font-dm text-base leading-relaxed text-somma-cream/70 md:text-lg">
            O Somma cresceu porque construiu vínculos reais. Quando uma marca entra aqui, ela não compra mídia: ganha pertencimento.
            E pertencimento dura mais que campanha.
          </p>
          <p className="fade-up mt-6 font-bebas text-2xl tracking-widest text-somma-yellow md:text-3xl">Vamos correr juntos?</p>

          <a
            href={whatsappUrl('Quero conversar sobre essa proposta.')}
            target="_blank"
            rel="noopener noreferrer"
            className="fade-up mt-12 inline-block rounded-full bg-somma-orange px-12 py-5 font-bebas text-xl tracking-widest text-somma-cream transition-all hover:bg-somma-cream hover:text-somma-black md:text-2xl"
          >
            Falar pelo WhatsApp
          </a>

          {validade && (
            <p className="mt-10 font-dm text-xs uppercase tracking-widest text-somma-cream/40">
              Proposta válida até {validade.toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-somma-cream/10 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="space-y-5">
              <Image src="https://cdn.shopify.com/s/files/1/0788/1932/8253/files/HORIZONTAL_PRETA_LARANJA.png?v=1772322941" alt="SOMMA Logo" width={160} height={40} className="h-10 w-auto invert brightness-0" />
              <p className="max-w-xs font-dm text-sm leading-relaxed text-somma-cream/60">
                A maior comunidade de corrida de Brasília. Mais de 4.300 membros ativos.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/somma.club/" target="_blank" rel="noopener noreferrer" className="text-somma-cream/40 transition-colors hover:text-somma-orange" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </a>
                <a href="https://www.strava.com/clubs/1608501" target="_blank" rel="noopener noreferrer" className="text-somma-cream/40 transition-colors hover:text-somma-orange" aria-label="Strava">
                  <svg className="h-5 w-5" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="226.172,26.001 90.149,288.345 170.29,288.345 226.172,184.036 281.605,288.345 361.116,288.345" fill="currentColor"></polygon><polygon points="361.116,288.345 321.675,367.586 281.605,288.345 220.871,288.345 321.675,485.999 421.851,288.345" fill="currentColor"></polygon></svg>
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bebas text-lg tracking-widest text-somma-cream/80">Contato</h3>
              <ul className="space-y-3 font-dm text-sm text-somma-cream/50">
                <li><a href="mailto:contato@sommaclub.com.br" className="transition-colors hover:text-somma-orange">contato@sommaclub.com.br</a></li>
                <li><a href={`https://wa.me/${tel}`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-somma-orange">+55 (61) 9537-2477</a></li>
              </ul>
              <p className="font-dm text-sm text-somma-cream/40">
                Responsável: <span className="text-somma-cream/60">{proposta.contato_responsavel || 'Alex Rodrigues'}</span>
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bebas text-lg tracking-widest text-somma-cream/80">Mais do Somma</h3>
              <ul className="space-y-3 font-dm text-sm text-somma-cream/50">
                <li><a href="https://sommaclub.com.br/seja-parceiro" className="transition-colors hover:text-somma-orange">Seja um Parceiro</a></li>
                <li><a href="https://sommaclub.com.br/evolve" className="transition-colors hover:text-somma-orange">Somma & Evolve</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-3 border-t border-somma-cream/5 pt-8">
            <p className="font-dm text-xs text-somma-cream/30">© 2026 Somma Running Club. CNPJ 61.315.987/0001-28</p>
            <a href="/login-admin" className="font-dm text-[10px] uppercase tracking-widest text-somma-cream/10 transition-colors hover:text-somma-cream/30">admin</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
