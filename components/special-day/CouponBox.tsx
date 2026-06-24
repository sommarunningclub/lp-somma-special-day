'use client'

import { useState } from 'react'

interface Props {
  cupom: string
  descontoLabel?: string
  /** Visual: 'light' (fundo claro) ou 'dark' (fundo escuro). */
  variant?: 'light' | 'dark'
}

export default function CouponBox({ cupom, descontoLabel = '15% off no app TF Sports', variant = 'light' }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(cupom)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: seleciona o texto no clique
    }
  }

  const isLight = variant === 'light'
  const wrapperCls = isLight
    ? 'border-somma-orange bg-somma-orange/10'
    : 'border-somma-yellow bg-somma-yellow/10'
  const kickerCls = isLight ? 'text-somma-orange' : 'text-somma-yellow'
  const codeCls = isLight ? 'text-somma-orange' : 'text-somma-yellow'
  const descCls = isLight ? 'text-somma-black/65' : 'text-somma-cream/70'
  const btnCls = isLight
    ? 'border-somma-black bg-somma-black text-somma-cream hover:bg-somma-orange'
    : 'border-somma-cream bg-somma-cream text-somma-black hover:bg-somma-yellow'

  return (
    <div className={`rounded-2xl border-4 border-dashed ${wrapperCls} px-5 py-4 text-center`}>
      <p className={`font-bebas text-xs tracking-widest ${kickerCls}`}>
        🎁 SEU CUPOM EXCLUSIVO
      </p>
      <p className={`mt-2 font-bebas text-4xl leading-none tracking-[0.18em] ${codeCls} sm:text-5xl`}>
        {cupom}
      </p>
      <p className={`mt-2 font-dm text-xs ${descCls}`}>
        {descontoLabel}
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className={`mt-3 inline-flex items-center gap-2 rounded-full border-2 px-5 py-2 font-bebas text-sm tracking-widest transition-all ${btnCls}`}
        aria-live="polite"
      >
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            Copiado!
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            Copiar cupom
          </>
        )}
      </button>
    </div>
  )
}
