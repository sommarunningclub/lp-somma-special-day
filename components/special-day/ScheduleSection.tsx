'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FloatingElement from './FloatingElement'

gsap.registerPlugin(ScrollTrigger)

const PROGRAMACAO = [
  {
    hora: '06h00',
    titulo: 'Abertura dos portões',
    desc: 'Chegada e credenciamento. O dia começa cedo.',
    emoji: '🚪',
    cor: '#FF4800',
  },
  {
    hora: '07h — 08h',
    titulo: 'Treinão Corre Somma',
    desc: 'A corrida que dá nome ao dia: 4 km e 8 km pela orla.',
    emoji: '🏃',
    cor: '#005EFF',
  },
  {
    hora: '08h — 09h',
    titulo: 'Fit Dance + café da manhã',
    desc: 'Aula pra soltar o corpo e café da manhã Big Box pra repor a energia.',
    emoji: '🥐',
    cor: '#FDB716',
  },
  {
    hora: '09h — 12h',
    titulo: 'Roda de samba & ativações',
    desc: 'Samba ao vivo, ativações dos parceiros, bar, alimentação e Day Use.',
    emoji: '🥁',
    cor: '#FD6FDB',
  },
  {
    hora: '11h / 12h — 13h30',
    titulo: 'Gincana Somma',
    desc: 'Competições com os parceiros, ativações especiais e sorteio de brindes.',
    emoji: '🎯',
    cor: '#FF4800',
  },
  {
    hora: '13h30 — 15h',
    titulo: 'DJ & encerramento social',
    desc: 'A festa continua até o fim, no melhor clima da comunidade.',
    emoji: '🎧',
    cor: '#005EFF',
  },
]

type Ativacao = {
  nome: string
  src: string
  href: string
  className: string
  light?: boolean // logo com fundo claro proprio -> recebe cartao claro
}

const ATIVACOES: Ativacao[] = [
  // Red Bull: lata com fundo claro -> cartao claro para o branco nao destoar do preto
  { nome: 'Red Bull', src: '/logo-redbull.png', href: 'https://www.redbull.com/br-pt', className: 'h-20 sm:h-24', light: true },
  // Dobro: logo branco -> direto no fundo escuro
  { nome: 'Dobro', src: '/logo-dobro.png', href: 'https://soudobro.com.br/', className: 'h-9 sm:h-11' },
  // Evolve: logo branco -> direto no fundo escuro
  { nome: 'Evolve', src: '/logo-evolve.svg', href: 'https://www.academiaevolve.com.br/', className: 'h-8 sm:h-10' },
  // Big Box: logo roxo/branco transparente -> direto no fundo escuro
  { nome: 'Big Box', src: '/logo-bigbox.png', href: 'https://www.bigbox.com.br/', className: 'h-8 sm:h-10' },
  // Track&Field: logo preto -> invert para branco no fundo escuro
  { nome: 'Track&Field', src: '/logo-track.png', href: 'https://www.tf.com.br/', className: 'h-5 sm:h-6 invert' },
]

export default function ScheduleSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.schedule-row', {
        x: -40,
        opacity: 0,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-somma-cream px-4 py-14 sm:py-16 md:py-32">
      <FloatingElement src="/elemento-relogio.svg" alt="" speed={0.85} rotate={-14}
        className="hidden md:block top-[7%] right-[4%] w-28 md:w-40 opacity-90 z-10" />
      <FloatingElement src="/elemento-corredor.svg" alt="" speed={1.2} rotate={10}
        className="hidden lg:block bottom-[8%] left-[3%] w-32 opacity-90 z-10" />

      <div className="relative mx-auto max-w-4xl">
        <p className="mb-3 text-center font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
          Do nascer ao pôr do sol
        </p>
        <h2 className="mb-12 text-center font-bebas text-4xl leading-[1.05] tracking-tight text-somma-black sm:mb-16 sm:text-6xl md:mb-20 md:text-8xl lg:text-9xl">
          A programação{' '}
          <span className="block text-somma-blue sm:mt-1">do dia 1 ano</span>
        </h2>

        <div className="flex flex-col gap-3 sm:gap-4">
          {PROGRAMACAO.map((item) => (
            <div
              key={item.hora}
              className="schedule-row flex flex-col gap-3 rounded-2xl border-4 border-somma-black bg-white p-4 shadow-[4px_4px_0_#0a0a0a] sm:flex-row sm:items-center sm:gap-5 sm:p-5 sm:shadow-[6px_6px_0_#0a0a0a]"
            >
              {/* Horário */}
              <div
                className="flex shrink-0 items-center justify-center rounded-xl border-2 border-somma-black px-4 py-2 sm:w-44"
                style={{ backgroundColor: item.cor }}
              >
                <span className="font-bebas text-xl tracking-wide text-somma-cream sm:text-2xl">
                  {item.hora}
                </span>
              </div>

              {/* Atividade */}
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none sm:text-3xl">{item.emoji}</span>
                <div>
                  <h3 className="font-bebas text-xl tracking-wide text-somma-black sm:text-2xl">
                    {item.titulo}
                  </h3>
                  <p className="font-dm text-sm leading-snug text-somma-black/65">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ativações previstas */}
        <div className="mt-10 rounded-3xl bg-somma-black px-6 py-10 text-center sm:mt-12 sm:py-12">
          <p className="font-dm text-xs uppercase tracking-[0.3em] text-somma-yellow">
            Ativações previstas durante o evento
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-16">
            {ATIVACOES.map((marca, i) => (
              <a
                key={marca.nome}
                href={marca.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={marca.nome}
                className={`ativacao-logo flex items-center justify-center opacity-90 transition-opacity hover:opacity-100 ${
                  marca.light ? 'rounded-xl bg-somma-cream px-4 py-2' : ''
                }`}
                style={{ animation: `float-soft 4s ease-in-out ${i * 0.6}s infinite` }}
              >
                <Image
                  src={marca.src}
                  alt={marca.nome}
                  width={240}
                  height={120}
                  className={`${marca.className} w-auto object-contain`}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
