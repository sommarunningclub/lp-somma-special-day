'use client'

import { useState } from 'react'
import Link from 'next/link'

export type Correio = {
  id: string
  nome: string
  instagram: string
  mensagem: string
  contato: string | null
  created_at: string
}

// Coração reutilizável (SVG, escala sem perder qualidade para a "explosão").
function Heart({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] || nome

type ContatoInfo = { tipo: 'whatsapp' | 'instagram' | 'texto'; rotulo: string; display: string; href: string | null }

// Interpreta o campo "contato" (WhatsApp ou @) e, se vazio, cai no Instagram do remetente.
function resolverContato(m: Correio): ContatoInfo {
  const bruto = (m.contato ?? '').trim()
  if (bruto) {
    const digitos = bruto.replace(/\D/g, '')
    if (digitos.length >= 10 && digitos.length <= 13) {
      const comDDI = digitos.length <= 11 ? `55${digitos}` : digitos
      return { tipo: 'whatsapp', rotulo: 'Conversar no WhatsApp', display: bruto, href: `https://wa.me/${comDDI}` }
    }
    const ig = bruto.replace(/^@+/, '')
    if (/^[a-zA-Z0-9._]+$/.test(ig)) {
      return { tipo: 'instagram', rotulo: 'Chamar no Instagram', display: `@${ig}`, href: `https://instagram.com/${ig}` }
    }
    return { tipo: 'texto', rotulo: 'Contato', display: bruto, href: null }
  }
  const ig = m.instagram.replace(/^@+/, '')
  return { tipo: 'instagram', rotulo: 'Chamar no Instagram', display: `@${ig}`, href: `https://instagram.com/${ig}` }
}

const KEYFRAMES = `
@keyframes correioBeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
@keyframes correioBurst { from{transform:scale(.6);opacity:.5} to{transform:scale(2.1);opacity:0} }
@keyframes correioPop { 0%{transform:scale(.2);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
@keyframes correioReveal { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
`

export default function CorreioMural({ mensagens }: { mensagens: Correio[] }) {
  const [aberta, setAberta] = useState<Correio | null>(null)
  const [revelado, setRevelado] = useState(false)

  function abrir(m: Correio) {
    setRevelado(false)
    setAberta(m)
  }
  function fechar() {
    setAberta(null)
    setRevelado(false)
  }

  const contato = aberta ? resolverContato(aberta) : null

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-somma-blue px-4 pb-20 pt-10 sm:pt-14">
      <style>{KEYFRAMES}</style>

      {/* Cabeçalho */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-cream/70 sm:text-sm">Correio Elegante</p>
        <h1 className="font-bebas text-5xl leading-[0.95] tracking-tight text-somma-cream sm:text-6xl md:text-7xl">
          Toque num coração <span className="text-somma-yellow">e descubra</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-dm text-base leading-relaxed text-somma-cream/80">
          Cada coração é um recado da comunidade. Abre o seu, lê a mensagem e, se rolar química, revela o contato pra
          conversar. 🧡
        </p>
        <Link href="/esquenta-junino#correio" className="mt-5 inline-block font-dm text-sm font-bold uppercase tracking-wide text-somma-yellow underline-offset-2 hover:underline">
          Mandar um correio também
        </Link>
      </div>

      {/* Mural de corações */}
      {mensagens.length === 0 ? (
        <div className="mx-auto mt-16 max-w-md text-center">
          <Heart className="mx-auto h-20 w-20 text-somma-orange [animation:correioBeat_1.6s_ease-in-out_infinite]" />
          <p className="mt-4 font-bebas text-2xl uppercase tracking-wide text-somma-cream">Ainda não tem recado por aqui</p>
          <p className="mt-1 font-dm text-sm text-somma-cream/70">Seja o primeiro a mandar um correio elegante. 💌</p>
        </div>
      ) : (
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-3 gap-x-3 gap-y-8 sm:grid-cols-4 sm:gap-6 md:grid-cols-5">
          {mensagens.map((m) => (
            <button
              key={m.id}
              onClick={() => abrir(m)}
              aria-label={`Abrir recado de ${primeiroNome(m.nome)}`}
              className="group flex flex-col items-center gap-2 focus:outline-none"
            >
              <span className="relative block h-20 w-20 sm:h-24 sm:w-24">
                <Heart className="absolute inset-0 h-full w-full text-somma-pink/40 [animation:correioBurst_2.6s_ease-out_infinite]" />
                <Heart className="absolute inset-0 h-full w-full text-somma-orange drop-shadow-[3px_3px_0_rgba(0,0,0,0.25)] transition-transform duration-300 [animation:correioBeat_1.8s_ease-in-out_infinite] group-hover:scale-110 group-focus-visible:scale-110" />
              </span>
              <span className="font-dm text-xs font-semibold text-somma-cream/85">de {primeiroNome(m.nome)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Overlay com a explosão + mensagem dentro do coração */}
      {aberta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-somma-blue/95 px-4 backdrop-blur-sm"
          onClick={fechar}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={fechar}
            aria-label="Fechar"
            className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full border-2 border-somma-cream/40 font-dm text-2xl leading-none text-somma-cream transition-colors hover:bg-somma-cream hover:text-somma-blue"
          >
            ×
          </button>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* corações pulsando atrás (efeito de explosão) */}
            <Heart className="pointer-events-none absolute left-1/2 top-1/2 h-[78vw] max-h-[460px] w-[78vw] max-w-[460px] -translate-x-1/2 -translate-y-1/2 text-somma-pink/25 [animation:correioBurst_2.4s_ease-out_infinite]" />
            <Heart className="pointer-events-none absolute left-1/2 top-1/2 h-[78vw] max-h-[460px] w-[78vw] max-w-[460px] -translate-x-1/2 -translate-y-1/2 text-somma-yellow/20 [animation:correioBurst_2.4s_ease-out_infinite_0.8s]" />

            {/* coração principal */}
            <div className="relative [animation:correioPop_0.5s_ease-out]">
              <Heart className="h-[82vw] max-h-[480px] w-[82vw] max-w-[480px] text-somma-orange drop-shadow-[6px_6px_0_rgba(0,0,0,0.25)]" />

              {/* mensagem dentro do coração */}
              <div className="absolute inset-x-0 top-[24%] mx-auto flex w-[74%] flex-col items-center text-center [animation:correioReveal_0.6s_ease-out_0.15s_both]">
                <p className="font-dm text-[10px] font-bold uppercase tracking-[0.2em] text-somma-cream/90">De {aberta.nome}</p>
                <a
                  href={`https://instagram.com/${aberta.instagram.replace(/^@+/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-dm text-xs font-bold text-somma-cream underline-offset-2 hover:underline"
                >
                  @{aberta.instagram.replace(/^@+/, '')}
                </a>

                <div className="mt-2 max-h-[200px] overflow-y-auto rounded-2xl bg-somma-black/25 px-4 py-3">
                  <p className="font-dm text-sm font-medium italic leading-snug text-somma-cream sm:text-base">“{aberta.mensagem}”</p>
                </div>

                {/* revelar contato / WhatsApp */}
                <div className="mt-3">
                  {!revelado ? (
                    <button
                      onClick={() => setRevelado(true)}
                      className="rounded-full border-2 border-somma-cream bg-somma-cream px-4 py-2 font-bebas text-sm tracking-widest text-somma-blue shadow-[2px_2px_0_rgba(0,0,0,0.25)] transition-transform hover:scale-105"
                    >
                      Revelar contato 👀
                    </button>
                  ) : contato && contato.href ? (
                    <a
                      href={contato.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-col items-center gap-0.5 rounded-2xl border-2 border-somma-cream bg-somma-cream px-4 py-2 text-somma-blue shadow-[2px_2px_0_rgba(0,0,0,0.25)] transition-transform hover:scale-105 [animation:correioReveal_0.3s_ease-out]"
                    >
                      <span className="font-bebas text-sm tracking-widest">{contato.rotulo} →</span>
                      <span className="font-dm text-xs font-semibold">{contato.display}</span>
                    </a>
                  ) : (
                    <span className="rounded-2xl bg-somma-black/25 px-4 py-2 font-dm text-xs font-semibold text-somma-cream [animation:correioReveal_0.3s_ease-out]">
                      {contato?.display}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
