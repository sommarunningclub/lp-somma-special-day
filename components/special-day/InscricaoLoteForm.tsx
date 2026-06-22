'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nutricaoSchema, type NutricaoInput } from '@/lib/validations/nutricao'
import { enrollNutricao } from '@/actions/nutricao'
import { PRESALE } from '@/lib/presale-constants'

/**
 * Form leve para capturar lead ANTES de mandar pro app TFSports.
 * Usado na fase do 1º lote (depois que a pré-venda fechou) — substitui
 * o botão direto pro app por: form → e-mail com instruções → CTA pro app.
 *
 * Backend: enrollNutricao (insere em nutricao_leads + dispara D0).
 * Esse fluxo não tem bloqueio por presale.closed, então sempre captura.
 */
export default function InscricaoLoteForm() {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NutricaoInput>({
    resolver: zodResolver(nutricaoSchema),
    defaultValues: { nome: '', email: '', telefone: '' },
  })

  function onSubmit(data: NutricaoInput) {
    setServerError(null)
    startTransition(async () => {
      const result = await enrollNutricao(data)
      if (result.success) {
        setDone(true)
        reset()
      } else {
        setServerError(result.error)
      }
    })
  }

  const labelCls = 'mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/60'
  const inputCls = 'w-full rounded-xl border-4 border-somma-black bg-white px-4 py-3 font-dm text-sm text-somma-black shadow-[3px_3px_0_#005EFF] placeholder:text-somma-black/40 focus:shadow-[3px_3px_0_#FF4800] focus:outline-none'

  if (done) {
    return (
      <div className="w-full max-w-lg rounded-2xl border-4 border-somma-cream bg-somma-cream p-5 text-center shadow-[4px_4px_0_#FF4800] sm:rounded-3xl sm:p-6 md:p-8 md:shadow-[8px_8px_0_#FF4800]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-4 border-somma-black bg-somma-orange font-bebas text-3xl text-somma-cream">
          ✓
        </div>
        <h2 className="font-bebas text-3xl leading-tight tracking-wide text-somma-black md:text-4xl">
          Cadastro feito!
        </h2>
        <p className="mx-auto mt-3 max-w-sm font-dm text-sm leading-relaxed text-somma-black/70">
          A gente acabou de te mandar um e-mail com o passo a passo da compra. Confere a caixa de entrada
          (e a de spam, só por garantia).
        </p>

        <div className="mt-6 rounded-2xl border-2 border-dashed border-somma-black/15 bg-white p-4 text-left">
          <p className="font-bebas text-sm tracking-widest text-somma-black/60">PRÓXIMOS PASSOS</p>
          <ol className="mt-2 space-y-1.5 font-dm text-sm text-somma-black/80">
            <li>1. Baixe o app <strong>TF Sports</strong></li>
            <li>2. Busque por <strong>Somma Special Day</strong></li>
            <li>3. Finalize sua inscrição no 1º lote</li>
          </ol>
          <p className="mt-3 rounded-lg border-2 border-somma-yellow bg-somma-yellow/15 px-3 py-2 font-dm text-xs text-somma-black">
            💳 <strong>Cliente Porto Seguro?</strong> Pague com o cartão Porto e ganhe desconto extra.
          </p>
        </div>

        <a
          href={PRESALE.eventoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block w-full rounded-full border-4 border-somma-black bg-somma-orange px-6 py-4 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-somma-black hover:shadow-[2px_2px_0_#0a0a0a]"
        >
          Abrir o app TF Sports →
        </a>

        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-4 font-dm text-xs font-bold uppercase tracking-widest text-somma-black/50 underline-offset-4 hover:underline"
        >
          Cadastrar outro e-mail
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border-4 border-somma-cream bg-somma-cream shadow-[4px_4px_0_#FF4800] sm:rounded-3xl sm:shadow-[8px_8px_0_#FF4800]">
      <div className="p-5 sm:p-6 md:p-8 lg:p-10">
        <div className="mb-6 border-b-2 border-dashed border-somma-black/15 pb-5">
          <p className="font-dm text-[11px] font-bold uppercase tracking-[0.25em] text-somma-orange">
            1º Lote · disponível agora
          </p>
          <h2 className="mt-1 font-bebas text-3xl leading-tight tracking-wide text-somma-black md:text-4xl">
            Garante sua vaga!
          </h2>
          <p className="mt-2 font-dm text-sm text-somma-black/60">
            Deixa seus dados que a gente te manda o passo a passo da compra direto no e-mail.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label className={labelCls}>Nome completo</label>
            <input {...register('nome')} placeholder="Seu nome" className={inputCls} />
            {errors.nome && <p className="mt-1.5 font-dm text-xs text-red-600">{errors.nome.message}</p>}
          </div>

          <div>
            <label className={labelCls}>E-mail</label>
            <input {...register('email')} type="email" placeholder="seu@email.com" className={inputCls} />
            {errors.email && <p className="mt-1.5 font-dm text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className={labelCls}>WhatsApp <span className="text-somma-black/40">(opcional)</span></label>
            <input {...register('telefone')} placeholder="(61) 9XXXX-XXXX" className={inputCls} />
          </div>

          {serverError && (
            <p className="rounded-xl border-2 border-red-500/40 bg-red-500/10 px-3 py-2 text-center font-dm text-sm text-red-700">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full border-4 border-somma-black bg-somma-orange px-6 py-4 font-bebas text-lg tracking-widest text-somma-cream shadow-[5px_5px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-somma-black hover:shadow-[3px_3px_0_#0a0a0a] disabled:opacity-60 md:text-xl"
          >
            {isPending ? 'Cadastrando...' : 'QUERO MINHA VAGA'}
          </button>
          <p className="text-center font-dm text-[11px] text-somma-black/50">
            Compra é feita no app TF Sports. O e-mail tem o passo a passo + bônus Porto Seguro.
          </p>
        </form>
      </div>
    </div>
  )
}
