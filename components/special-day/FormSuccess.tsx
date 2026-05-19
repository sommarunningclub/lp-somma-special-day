'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import gsap from 'gsap'
import TicketLoader from './TicketLoader'

export type FormSuccessProps = {
  userData?: {
    nome: string
    email: string
  }
}

function SuccessModal({ userData }: FormSuccessProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const receiptsRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const ticketWrapperRef = useRef<HTMLDivElement>(null)
  const [showTicket, setShowTicket] = useState(false)

  // Trava o scroll do body enquanto o modal está aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Fade-in do overlay
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
    })
    return () => ctx.revert()
  }, [])

  // Animação do ticket após o loader terminar
  useEffect(() => {
    if (!showTicket) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ticketWrapperRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4 }
      )
      gsap.fromTo(
        titleRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, delay: 0.1 }
      )
      gsap.fromTo(
        receiptsRef.current,
        { yPercent: -100 },
        { yPercent: 0, duration: 2.5, delay: 0.4, ease: 'power2.out' }
      )
      gsap.fromTo(
        buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 2.9, ease: 'power2.out' }
      )
    })
    return () => ctx.revert()
  }, [showTicket])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://sommaclub.com.br'
  const whatsappText = encodeURIComponent(
    `Vai ter o Somma Special Day dia 18/07! Entra na lista VIP: ${shareUrl}`
  )

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-somma-blue p-4 overflow-y-auto">
      {!showTicket && (
        <div className="flex w-full max-w-sm flex-col items-center">
          <h2 className="mb-4 text-center font-bebas text-2xl tracking-widest text-somma-cream md:text-3xl">
            Preparando seu ticket VIP...
          </h2>
          <TicketLoader onComplete={() => setShowTicket(true)} />
        </div>
      )}

      <div
        ref={ticketWrapperRef}
        className={`flex flex-col items-center w-full max-w-sm mx-auto py-10 relative ${showTicket ? '' : 'hidden'}`}
      >

        <h1 ref={titleRef} className="font-bebas text-3xl md:text-4xl text-somma-cream tracking-widest mb-10 text-center leading-tight">
          Aguarde um segundo,<br/>seu ticket está sendo impresso...
        </h1>

        {/* Fenda da Impressora */}
        <div className="w-[90%] h-8 border-[5px] border-somma-cream rounded-xl shadow-lg bg-somma-black relative z-20 flex justify-center items-center">
          <div className="w-[95%] h-1.5 bg-black rounded-full"></div>
        </div>

        {/* Wrapper do Recibo - Area de overflow-hidden que esconde o ticket antes de imprimir */}
        <div className="w-full overflow-hidden -mt-4 relative z-10 pb-12 pt-4 px-2">
          
          {/* O Ticket em si, se movendo para baixo. (Removido -translate-y-full do tailwind) */}
          <div ref={receiptsRef} className="flex flex-col items-center w-full will-change-transform">
            
            {/* Corpo Principal do Ticket */}
            <div className="w-[92%] bg-somma-cream rounded-t-[20px] shadow-2xl p-6 pt-8 text-left border-x-2 border-t-2 border-dashed border-somma-black/20">
              
              {/* Logo e Tag */}
              <div className="flex justify-between items-center mb-6">
                <div className="w-32">
                  <Image src="/logo-special-day.svg" alt="Somma Special Day" width={400} height={100} className="w-full h-auto" />
                </div>
                <div className="bg-somma-orange text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                  VIP PASS
                </div>
              </div>

              {/* Detalhes do Evento e Usuário */}
              <div className="grid grid-cols-2 gap-y-6 font-dm">
                {userData && (
                  <div className="flex flex-col col-span-2 pb-4 border-b-2 border-somma-black/5">
                    <span className="text-[11px] text-somma-black/50 font-bold uppercase tracking-wider">Passageiro VIP</span>
                    <h3 className="font-bold text-somma-black text-lg mt-1 leading-tight">{userData.nome}</h3>
                    <p className="text-xs text-somma-black/60 mt-0.5">{userData.email}</p>
                  </div>
                )}
                
                <div className="flex flex-col col-span-2">
                  <span className="text-[11px] text-somma-black/50 font-bold uppercase tracking-wider">Benefícios Inclusos</span>
                  <h3 className="font-medium text-somma-black text-sm mt-1">Acesso à pré-venda e brindes</h3>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-somma-black/50 font-bold uppercase tracking-wider">Data e Hora</span>
                  <h3 className="font-medium text-somma-black text-sm mt-1">18/07/2026 - 06:00</h3>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-somma-black/50 font-bold uppercase tracking-wider">Local</span>
                  <h3 className="font-medium text-somma-black text-sm mt-1">COPMDF</h3>
                </div>
              </div>
            </div>

            {/* Picote / Código QR */}
            <div className="w-[92%] bg-somma-cream rounded-b-[20px] shadow-2xl flex items-center p-5 relative border-x-2 border-b-2 border-dashed border-somma-black/20">
              {/* Linha Serrilhada */}
              <div className="absolute top-0 left-6 right-6 h-1 bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,rgba(10,10,10,0.1)_6px,rgba(10,10,10,0.1)_12px)] -mt-[2px] z-10"></div>
              
              <div className="w-16 h-16 mr-4 shrink-0">
                <svg className="w-full h-full text-somma-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29.938 29.938" fill="currentColor">
                  <path d="M7.129 15.683h1.427v1.427h1.426v1.426H2.853V17.11h1.426v-2.853h2.853v1.426h-.003zm18.535 12.83h1.424v-1.426h-1.424v1.426zM8.555 15.683h1.426v-1.426H8.555v1.426zm19.957 12.83h1.427v-1.426h-1.427v1.426zm-17.104 1.425h2.85v-1.426h-2.85v1.426zm12.829 0v-1.426H22.81v1.426h1.427zm-5.702 0h1.426v-2.852h-1.426v2.852zM7.129 11.406v1.426h4.277v-1.426H7.129zm-1.424 1.425v-1.426H2.852v2.852h1.426v-1.426h1.427zm4.276-2.852H.002V.001h9.979v9.978zM8.555 1.427H1.426v7.127h7.129V1.427zm-5.703 25.66h4.276V22.81H2.852v4.277zm14.256-1.427v1.427h1.428V25.66h-1.428zM7.129 2.853H2.853v4.275h4.276V2.853zM29.938.001V9.98h-9.979V.001h9.979zm-1.426 1.426h-7.127v7.127h7.127V1.427zM0 19.957h9.98v9.979H0v-9.979zm1.427 8.556h7.129v-7.129H1.427v7.129zm0-17.107H0v7.129h1.427v-7.129zm18.532 7.127v1.424h1.426v-1.424h-1.426zm-4.277 5.703V22.81h-1.425v1.427h-2.85v2.853h2.85v1.426h1.425v-2.853h1.427v-1.426h-1.427v-.001zM11.408 5.704h2.85V4.276h-2.85v1.428zm11.403 11.405h2.854v1.426h1.425v-4.276h-1.425v-2.853h-1.428v4.277h-4.274v1.427h1.426v1.426h1.426V17.11h-.004zm1.426 4.275H22.81v-1.427h-1.426v2.853h-4.276v1.427h2.854v2.853h1.426v1.426h1.426v-2.853h5.701v-1.426h-4.276v-2.853h-.002zm0 0h1.428v-2.851h-1.428v2.851zm-11.405 0v-1.427h1.424v-1.424h1.425v-1.426h1.427v-2.853h4.276v-2.853h-1.426v1.426h-1.426V7.125h-1.426V4.272h1.426V0h-1.426v2.852H15.68V0h-4.276v2.852h1.426V1.426h1.424v2.85h1.426v4.277h1.426v1.426H15.68v2.852h-1.426V9.979H12.83V8.554h-1.426v2.852h1.426v1.426h-1.426v4.278h1.426v-2.853h1.424v2.853H12.83v1.426h-1.426v4.274h2.85v-1.426h-1.422zm15.68 1.426v-1.426h-2.85v1.426h2.85zM27.086 2.853h-4.275v4.275h4.275V2.853zM15.682 21.384h2.854v-1.427h-1.428v-1.424h-1.427v2.851zm2.853-2.851v-1.426h-1.428v1.426h1.428zm8.551-5.702h2.853v-1.426h-2.853v1.426zm1.426 11.405h1.427V22.81h-1.427v1.426zm0-8.553h1.427v-1.426h-1.427v1.426zm-12.83-7.129h-1.425V9.98h1.425V8.554z"/>
                </svg>
              </div>
              <div className="font-dm">
                <h2 className="font-bold text-somma-black text-lg m-0 leading-tight">Vaga Garantida!</h2>
                <p className="text-xs text-somma-black/60 mt-1">Acesso antecipado liberado</p>
              </div>
            </div>

            {/* Aviso para salvar/printar o ticket */}
            <div ref={buttonsRef} className="w-full max-w-[92%] mt-6 opacity-0">
              <div className="relative animate-pulse-slow rounded-2xl border-4 border-somma-yellow bg-somma-black/40 backdrop-blur-sm px-5 py-4 shadow-[5px_5px_0_#FDB716]">
                <div className="flex items-start gap-3">
                  <span className="text-3xl leading-none">📸</span>
                  <div className="flex-1">
                    <p className="font-bebas text-lg md:text-xl tracking-widest text-somma-yellow leading-tight">
                      SALVE OU TIRE PRINT DO SEU TICKET!
                    </p>
                    <p className="font-dm text-xs md:text-sm text-somma-cream/90 mt-1 leading-snug">
                      Este é o seu comprovante de vaga VIP. Guarde a imagem agora — você vai precisar dela no dia do evento.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações após impressão */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <button onClick={() => window.location.reload()} className="bg-transparent border-2 border-somma-cream text-somma-cream font-bebas text-lg px-5 py-2.5 rounded-full hover:bg-somma-cream hover:text-somma-blue transition-colors">
                Voltar
              </button>
              <a
                href={`https://wa.me/?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white font-bebas text-lg tracking-widest px-6 py-2.5 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                Chamar um amigo
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default function FormSuccess({ userData }: FormSuccessProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(<SuccessModal userData={userData} />, document.body)
}
