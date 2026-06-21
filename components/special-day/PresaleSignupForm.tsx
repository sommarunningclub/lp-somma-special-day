'use client'

import { useState, useTransition, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { listaVipSchema, type ListaVipInput } from '@/lib/validations/lista-vip'
import { submitListaVip } from '@/actions/lista-vip'

function formatCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

type Props = {
  closed?: boolean
  eyebrow?: string
  title?: string
  subtitle?: string
  submitLabel?: string
  /** Conteúdo exibido quando a pré-venda está encerrada. */
  closedContent?: ReactNode
}

/**
 * Formulário de cadastro da pré-venda (Lista VIP). Mesmo fluxo em qualquer lugar:
 * valida → submitListaVip → e-mail com cupom → /listavip/obrigado.
 */
export default function PresaleSignupForm({
  closed = false,
  eyebrow = 'Cadastro · Lista VIP',
  title = 'Garanta sua vaga',
  subtitle = 'Preencha seus dados e seja avisado em primeira mão.',
  submitLabel = 'QUERO ENTRAR NA LISTA VIP',
  closedContent,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ListaVipInput>({ resolver: zodResolver(listaVipSchema) })

  function onSubmit(data: ListaVipInput) {
    setServerError(null)
    startTransition(async () => {
      const result = await submitListaVip(data)
      if (result.success) {
        router.push(`/listavip/obrigado?codigo=${encodeURIComponent(result.data.codigoUnico)}`)
      } else {
        setServerError(result.error)
      }
    })
  }

  const inputCls =
    'w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20'
  const labelCls = 'mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70'

  return (
    <div className="w-full max-w-lg rounded-2xl border-4 border-somma-cream bg-somma-cream shadow-[4px_4px_0_#FF4800] sm:rounded-3xl sm:shadow-[8px_8px_0_#FF4800]">
      <div className="p-5 sm:p-6 md:p-8 lg:p-10">
        {closed ? (
          closedContent ?? <DefaultClosed />
        ) : (
          <>
            <div className="mb-6 border-b-2 border-dashed border-somma-black/15 pb-5">
              <p className="font-dm text-[11px] font-bold uppercase tracking-[0.25em] text-somma-orange">{eyebrow}</p>
              <h2 className="mt-1 font-bebas text-3xl leading-tight tracking-wide text-somma-black md:text-4xl">{title}</h2>
              <p className="mt-2 font-dm text-sm text-somma-black/60">{subtitle}</p>
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

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Telefone</label>
                  <input
                    {...register('telefone')}
                    placeholder="(61) 99999-0000"
                    inputMode="numeric"
                    className={inputCls}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value)
                      e.target.value = formatted
                      setValue('telefone', formatted, { shouldValidate: false })
                    }}
                  />
                  {errors.telefone && <p className="mt-1.5 font-dm text-xs text-red-600">{errors.telefone.message}</p>}
                </div>

                <div>
                  <label className={labelCls}>Sexo</label>
                  <select {...register('sexo')} defaultValue="" className={`${inputCls} cursor-pointer`}>
                    <option value="" disabled>Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                  {errors.sexo && <p className="mt-1.5 font-dm text-xs text-red-600">{errors.sexo.message}</p>}
                </div>
              </div>

              <div>
                <label className={labelCls}>CPF</label>
                <input
                  {...register('cpf')}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  className={inputCls}
                  onChange={(e) => {
                    const formatted = formatCPF(e.target.value)
                    e.target.value = formatted
                    setValue('cpf', formatted, { shouldValidate: false })
                  }}
                />
                {errors.cpf && <p className="mt-1.5 font-dm text-xs text-red-600">{errors.cpf.message}</p>}
              </div>

              {serverError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center font-dm text-sm text-red-600">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="mt-2 w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-4 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-somma-orange/90 hover:shadow-[3px_3px_0_#0a0a0a] disabled:cursor-not-allowed disabled:opacity-60 sm:text-xl md:text-2xl md:shadow-[5px_5px_0_#0a0a0a]"
              >
                {isPending ? 'ENVIANDO...' : submitLabel}
              </button>

              <p className="text-center font-dm text-xs text-somma-black/50">Seus dados estão seguros. Não fazemos spam.</p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function DefaultClosed() {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-somma-orange/15 px-4 py-2 font-dm text-xs font-bold uppercase tracking-widest text-somma-orange">
        Cadastro encerrado
      </span>
      <h2 className="font-bebas text-4xl leading-tight tracking-wide text-somma-black md:text-5xl">A lista VIP fechou</h2>
      <p className="mt-3 max-w-sm font-dm text-sm leading-relaxed text-somma-black/60">
        O cadastro da Lista VIP do Somma Special Day está encerrado. Fique de olho nas nossas redes: novidades chegam em breve.
      </p>
      <a
        href="https://www.instagram.com/somma.club/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 w-full rounded-2xl border-4 border-somma-black bg-somma-blue px-3 py-4 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] sm:w-auto sm:px-8"
      >
        Seguir o Somma no Instagram
      </a>
    </div>
  )
}
