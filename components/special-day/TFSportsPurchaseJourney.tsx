'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    n: '01',
    title: 'Baixe o app TFSports',
    body: 'Disponível para iPhone e Android. É gratuito e fácil de instalar.',
    color: 'bg-somma-orange',
    textColor: 'text-somma-orange',
    apps: true,
  },
  {
    n: '02',
    title: 'Crie sua conta ou faça login',
    body: 'Abra o app, clique em Entrar e, caso ainda não tenha cadastro, selecione Não tenho conta.',
    color: 'bg-somma-blue',
    textColor: 'text-somma-blue',
    apps: false,
  },
  {
    n: '03',
    title: 'Acesse a área TFSports',
    body: 'Dentro do app, clique na aba TFSports e procure pelo nosso evento.',
    color: 'bg-somma-yellow',
    textColor: 'text-somma-yellow',
    apps: false,
  },
  {
    n: '04',
    title: 'Escolha sua inscrição',
    body: 'Selecione a modalidade desejada, o kit e o tamanho da camiseta.',
    color: 'bg-somma-pink',
    textColor: 'text-somma-pink',
    apps: false,
  },
  {
    n: '05',
    title: 'Aplique seu cupom VIP',
    body: 'Na etapa de confirmação, clique em Inserir cupom e use o código recebido após o cadastro na Lista VIP.',
    color: 'bg-somma-orange',
    textColor: 'text-somma-orange',
    apps: false,
  },
  {
    n: '06',
    title: 'Finalize o pagamento',
    body: 'Escolha Pix ou cartão de crédito. Pagando com Cartão Porto Bank, você pode ter ainda mais desconto.',
    color: 'bg-somma-blue',
    textColor: 'text-somma-blue',
    apps: false,
  },
  {
    n: '07',
    title: 'Vaga garantida!',
    body: 'Pagou, confirmou no app, fim de papo. Agora é contar os dias pra 18 de julho!',
    color: 'bg-somma-yellow',
    textColor: 'text-somma-yellow',
    apps: false,
  },
]

export default function TFSportsPurchaseJourney() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.tfs-card', {
        y: 50,
        opacity: 0,
        stagger: 0.07,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: containerRef.current, start: 'top 80%' },
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="tfsports" className="relative overflow-hidden bg-[#0053ff] px-4 py-14 sm:py-16 md:py-32 scroll-mt-20">
      {/* fundo sutil */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_10%_50%,#FF4800,transparent_45%),radial-gradient(circle_at_90%_50%,#FFFFFF,transparent_40%)]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/download.webp"
            alt="TFSports"
            width={450}
            height={150}
            className="h-[8.75rem] w-auto object-contain sm:h-[11.25rem]"
          />
        </div>
        <div className="mb-4 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-somma-orange bg-somma-orange/15 px-4 py-1.5 font-dm text-[11px] font-bold uppercase tracking-[0.2em] text-somma-orange sm:text-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-somma-orange" />
            Inscrições exclusivamente pelo app
          </span>
        </div>
        <h2 className="mb-4 text-center font-bebas text-4xl leading-[1.05] tracking-tight text-somma-cream sm:text-6xl md:text-7xl">
          Sua vaga rola{' '}
          <span className="block text-somma-yellow sm:mt-1">direto no app da Track&amp;Field!</span>
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-center font-dm text-sm leading-relaxed text-somma-cream/70 md:mb-14 md:text-base">
          Sem segredo nem rolê paralelo: a inscrição é só dentro do app oficial
          <span className="font-semibold text-somma-cream"> TFSports</span>. Olha aqui o passo a passo.
        </p>

        {/* Grid de steps */}
        <div ref={containerRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="tfs-card relative flex flex-col gap-3 rounded-2xl border-4 border-somma-black bg-somma-cream p-5 shadow-[4px_4px_0_#0a0a0a] sm:rounded-3xl sm:p-6 sm:shadow-[6px_6px_0_#0a0a0a]"
            >
              {/* Número */}
              <span className={`font-bebas text-5xl leading-none ${step.textColor} drop-shadow-[2px_2px_0_#0a0a0a]`}>
                {step.n}
              </span>

              {/* Título */}
              <h3 className="font-bebas text-xl tracking-wider text-somma-black leading-tight">
                {step.title}
              </h3>

              {/* Body */}
              <p className="font-dm text-sm text-somma-black/70 leading-relaxed flex-1">
                {step.body}
              </p>

              {/* Botões de app — só no step 01 */}
              {step.apps && (
                <div className="mt-2 flex flex-col gap-2">
                  <a
                    href="https://apps.apple.com/br/app/tfsports/id1251078517"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-4 border-somma-black bg-somma-black px-4 py-2.5 font-bebas text-sm tracking-widest text-somma-cream shadow-[3px_3px_0_#FF4800] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#FF4800]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
                    </svg>
                    App Store
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=br.com.tfsports.customer&hl=pt_BR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-4 border-somma-black bg-somma-orange px-4 py-2.5 font-bebas text-sm tracking-widest text-somma-cream shadow-[3px_3px_0_#0a0a0a] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#0a0a0a]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.18 23.76c.3.17.64.24.99.18L14.93 12 3.18.06C2.83 0 2.49.07 2.19.24 1.59.57 1.2 1.22 1.2 2v19.99c0 .79.39 1.44.98 1.77zM19.65 9.03l-2.95-1.67-3.26 3.64 3.26 3.64 2.97-1.68c.85-.48 1.35-1.28 1.35-2.13.01-.84-.51-1.65-1.37-1.8zM4.42.33l11.49 6.5L12.7 10.1 4.42.33zM4.42 23.67l8.29-9.76 3.22 3.28-11.51 6.48z" />
                    </svg>
                    Google Play
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mensagem institucional + CTA final */}
        <div className="mt-14 text-center">
          <p className="font-bebas text-2xl md:text-3xl text-somma-cream tracking-widest mb-2">
            Baixou? Já entra. A festa começa antes do dia do evento!
          </p>
          <p className="font-dm text-somma-cream/50 text-sm mb-8">
            Chama a galera, manda no grupo, marca aquele amigo. Vamos lotar o COPMDF juntos!
          </p>

          <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://apps.apple.com/br/app/tfsports/id1251078517"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full max-w-xs items-center justify-center gap-3 rounded-full border-4 border-somma-black bg-somma-black px-8 py-4 font-bebas text-xl tracking-widest text-somma-cream shadow-[5px_5px_0_#FF4800] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#FF4800] sm:w-auto"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
              </svg>
              App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=br.com.tfsports.customer&hl=pt_BR"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full max-w-xs items-center justify-center gap-3 rounded-full border-4 border-somma-black bg-somma-orange px-8 py-4 font-bebas text-xl tracking-widest text-somma-cream shadow-[5px_5px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#0a0a0a] sm:w-auto"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.76c.3.17.64.24.99.18L14.93 12 3.18.06C2.83 0 2.49.07 2.19.24 1.59.57 1.2 1.22 1.2 2v19.99c0 .79.39 1.44.98 1.77zM19.65 9.03l-2.95-1.67-3.26 3.64 3.26 3.64 2.97-1.68c.85-.48 1.35-1.28 1.35-2.13.01-.84-.51-1.65-1.37-1.8zM4.42.33l11.49 6.5L12.7 10.1 4.42.33zM4.42 23.67l8.29-9.76 3.22 3.28-11.51 6.48z" />
              </svg>
              Google Play
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
