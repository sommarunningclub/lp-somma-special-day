'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import gsap from 'gsap'
import TicketLoader from './TicketLoader'
import { PRESALE, PRESALE_PASSOS } from '@/lib/presale-constants'

export type FormSuccessProps = {
  userData?: {
    nome: string
    email: string
    codigoUnico?: string
  }
}

function QrMark() {
  return (
    <svg className="h-full w-full text-somma-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29.938 29.938" fill="currentColor" aria-hidden>
      <path d="M7.129 15.683h1.427v1.427h1.426v1.426H2.853V17.11h1.426v-2.853h2.853v1.426h-.003zm18.535 12.83h1.424v-1.426h-1.424v1.426zM8.555 15.683h1.426v-1.426H8.555v1.426zm19.957 12.83h1.427v-1.426h-1.427v1.426zm-17.104 1.425h2.85v-1.426h-2.85v1.426zm12.829 0v-1.426H22.81v1.426h1.427zm-5.702 0h1.426v-2.852h-1.426v2.852zM7.129 11.406v1.426h4.277v-1.426H7.129zm-1.424 1.425v-1.426H2.852v2.852h1.426v-1.426h1.427zm4.276-2.852H.002V.001h9.979v9.978zM8.555 1.427H1.426v7.127h7.129V1.427zm-5.703 25.66h4.276V22.81H2.852v4.277zm14.256-1.427v1.427h1.428V25.66h-1.428zM7.129 2.853H2.853v4.275h4.276V2.853zM29.938.001V9.98h-9.979V.001h9.979zm-1.426 1.426h-7.127v7.127h7.127V1.427zM0 19.957h9.98v9.979H0v-9.979zm1.427 8.556h7.129v-7.129H1.427v7.129zm0-17.107H0v7.129h1.427v-7.129zm18.532 7.127v1.424h1.426v-1.424h-1.426zm-4.277 5.703V22.81h-1.425v1.427h-2.85v2.853h2.85v1.426h1.425v-2.853h1.427v-1.426h-1.427v-.001zM11.408 5.704h2.85V4.276h-2.85v1.428zm11.403 11.405h2.854v1.426h1.425v-4.276h-1.425v-2.853h-1.428v4.277h-4.274v1.427h1.426v1.426h1.426V17.11h-.004zm1.426 4.275H22.81v-1.427h-1.426v2.853h-4.276v1.427h2.854v2.853h1.426v1.426h1.426v-2.853h5.701v-1.426h-4.276v-2.853h-.002zm0 0h1.428v-2.851h-1.428v2.851zm-11.405 0v-1.427h1.424v-1.424h1.425v-1.426h1.427v-2.853h4.276v-2.853h-1.426v1.426h-1.426V7.125h-1.426V4.272h1.426V0h-1.426v2.852H15.68V0h-4.276v2.852h1.426V1.426h1.424v2.85h1.426v4.277h1.426v1.426H15.68v2.852h-1.426V9.979H12.83V8.554h-1.426v2.852h1.426v1.426h-1.426v4.278h1.426v-2.853h1.424v2.853H12.83v1.426h-1.426v4.274h2.85v-1.426h-1.422zm15.68 1.426v-1.426h-2.85v1.426h2.85zM27.086 2.853h-4.275v4.275h4.275V2.853zM15.682 21.384h2.854v-1.427h-1.428v-1.424h-1.427v2.851zm2.853-2.851v-1.426h-1.428v1.426h1.428zm8.551-5.702h2.853v-1.426h-2.853v1.426zm1.426 11.405h1.427V22.81h-1.427v1.426zm0-8.553h1.427v-1.426h-1.427v1.426zm-12.83-7.129h-1.425V9.98h1.425V8.554z" />
    </svg>
  )
}

function SuccessModal({ userData }: FormSuccessProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const ticketRef = useRef<HTMLDivElement>(null)
  const [showTicket, setShowTicket] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!showTicket) return
    const ctx = gsap.context(() => {
      gsap.fromTo(ticketRef.current, { opacity: 0, y: 20, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out' })
    })
    return () => ctx.revert()
  }, [showTicket])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://sommaclub.com.br'
  const whatsappText = encodeURIComponent(`Vai ter o Somma Special Day dia 18/07! Entra na lista VIP: ${shareUrl}`)

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[9999] overflow-y-auto bg-somma-blue px-4 py-6 sm:py-8">
      <div className="mx-auto flex min-h-full w-full max-w-6xl items-center justify-center">
        {!showTicket ? (
          <div className="flex w-full max-w-sm flex-col items-center">
            <h2 className="mb-4 text-center font-bebas text-2xl tracking-widest text-somma-cream md:text-3xl">
              Preparando seu ticket VIP...
            </h2>
            <TicketLoader onComplete={() => setShowTicket(true)} />
          </div>
        ) : (
          <div ref={ticketRef} className="grid w-full items-center gap-6 lg:grid-cols-[minmax(320px,420px)_minmax(320px,430px)] lg:gap-10">
            <div className="mx-auto w-full max-w-[390px] lg:justify-self-end">
              <h1 className="mb-5 text-center font-bebas text-3xl leading-none tracking-widest text-somma-cream sm:text-4xl lg:hidden">
                Seu ticket VIP foi gerado.
              </h1>

              <div className="rounded-t-[22px] border-x-2 border-t-2 border-dashed border-somma-black/20 bg-somma-cream p-5 text-left shadow-2xl sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div className="w-28 sm:w-32">
                    <Image src="/logo-special-day.svg" alt="Somma Special Day" width={400} height={100} className="h-auto w-full" />
                  </div>
                  <div className="shrink-0 rounded bg-somma-orange px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    VIP PASS
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 font-dm">
                  {userData && (
                    <div className="col-span-2 flex flex-col border-b-2 border-somma-black/5 pb-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-somma-black/50">Passageiro VIP</span>
                      <h3 className="mt-1 break-words text-lg font-bold leading-tight text-somma-black">{userData.nome}</h3>
                      <p className="mt-0.5 break-all text-xs text-somma-black/60">{userData.email}</p>
                    </div>
                  )}

                  <div className="col-span-2 flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-somma-black/50">Cupom da pré-venda</span>
                    <h3 className="mt-1 break-all font-bebas text-4xl leading-none tracking-widest text-somma-orange">{PRESALE.cupom}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-somma-black/40 line-through">De {PRESALE.precoDe}</span>
                      <span className="text-sm font-bold text-green-600">Por {PRESALE.precoPor}</span>
                      <span className="rounded bg-green-600/10 px-1.5 py-0.5 text-[10px] font-bold text-green-700">-{PRESALE.descontoPct}</span>
                    </div>
                    <p className="mt-2 text-xs text-somma-black/60">Use o cupom <strong>{PRESALE.cupom}</strong> no app TF Sports para liberar o valor da pré-venda.</p>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-somma-black/50">Data e Hora</span>
                    <h3 className="mt-1 text-sm font-medium text-somma-black">18/07/2026 - 06:00</h3>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-somma-black/50">Local</span>
                    <h3 className="mt-1 text-sm font-medium text-somma-black">COPMDF</h3>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center rounded-b-[22px] border-x-2 border-b-2 border-dashed border-somma-black/20 bg-somma-cream p-5 shadow-2xl">
                <div className="absolute left-6 right-6 top-0 z-10 -mt-[2px] h-1 bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,rgba(10,10,10,0.1)_6px,rgba(10,10,10,0.1)_12px)]" />
                <div className="mr-4 h-16 w-16 shrink-0">
                  <QrMark />
                </div>
                <div className="font-dm">
                  <h2 className="m-0 text-lg font-bold leading-tight text-somma-black">Código gerado!</h2>
                  <p className="mt-1 text-xs text-somma-black/60">Acesso antecipado e cupom VIP</p>
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[430px] text-center lg:justify-self-start lg:text-left">
              <h1 className="hidden font-bebas text-5xl leading-none tracking-widest text-somma-cream lg:block xl:text-6xl">
                Seu ticket VIP foi gerado.
              </h1>
              <div className="rounded-2xl border-4 border-somma-yellow bg-somma-black/40 px-5 py-4 text-left shadow-[5px_5px_0_#FDB716] backdrop-blur-sm lg:mt-8">
                <p className="font-bebas text-xl leading-tight tracking-widest text-somma-yellow">
                  Salve ou tire print do seu ticket.
                </p>
                <p className="mt-2 font-dm text-sm leading-relaxed text-somma-cream/90">
                  Enviamos o cupom <strong className="text-somma-yellow">{PRESALE.cupom}</strong> e este passo a passo também no seu e-mail. A inscrição é feita pelo app TF Sports.
                </p>
              </div>

              {/* Passo a passo */}
              <div className="mt-5 rounded-2xl border-2 border-somma-cream/20 bg-somma-black/40 px-5 py-4 text-left backdrop-blur-sm">
                <p className="mb-3 font-bebas text-lg tracking-widest text-somma-cream">
                  Como ativar seu cupom
                </p>
                <ol className="space-y-2.5">
                  {PRESALE_PASSOS.map((p) => (
                    <li key={p.n} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-somma-orange font-dm text-xs font-bold text-white">
                        {p.n}
                      </span>
                      <div>
                        <p className="font-dm text-sm font-bold leading-tight text-somma-cream">{p.titulo}</p>
                        <p className="mt-0.5 font-dm text-xs leading-snug text-somma-cream/70">{p.texto}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* CTA principal: abrir evento no app */}
              <a
                href={PRESALE.eventoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-5 py-4 text-center font-bebas text-xl tracking-widest text-somma-cream shadow-[5px_5px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#0a0a0a]"
              >
                Comprar minha inscrição
              </a>
              <div className="mt-3 flex gap-3">
                <a href={PRESALE.appStoreUrl} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl border-2 border-somma-cream/30 px-3 py-2.5 text-center font-dm text-xs font-bold text-somma-cream transition-colors hover:bg-somma-cream/10">
                  Baixar (iPhone)
                </a>
                <a href={PRESALE.playStoreUrl} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-xl border-2 border-somma-cream/30 px-3 py-2.5 text-center font-dm text-xs font-bold text-somma-cream transition-colors hover:bg-somma-cream/10">
                  Baixar (Android)
                </a>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:justify-start">
                <button onClick={() => window.location.reload()} className="w-full rounded-full border-2 border-somma-cream bg-transparent px-5 py-3 font-bebas text-lg text-somma-cream transition-colors hover:bg-somma-cream hover:text-somma-blue sm:w-auto">
                  Voltar
                </button>
                <a
                  href={`https://wa.me/?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-full bg-green-500 px-6 py-3 text-center font-bebas text-lg tracking-widest text-white shadow-lg transition-transform hover:scale-105 hover:bg-green-600 sm:w-auto"
                >
                  Chamar um amigo
                </a>
              </div>
            </div>
          </div>
        )}
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
