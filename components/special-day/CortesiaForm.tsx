'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cortesiaSchema, type CortesiaInput } from '@/lib/validations/cortesia'
import { submitCortesia } from '@/actions/cortesia'

function formatCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

// Telefone com DDD: fixo (10 digitos) -> (XX) XXXX-XXXX, celular (11) -> (XX) XXXXX-XXXX.
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2')
  }
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

// Data de nascimento em DD/MM/AAAA (ano com 4 digitos, formato natural no Brasil).
function formatBirthDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const dd = digits.slice(0, 2)
  const mm = digits.slice(2, 4)
  const yyyy = digits.slice(4, 8)

  let out = dd
  if (digits.length >= 3) out += `/${mm}`
  if (digits.length >= 5) out += `/${yyyy}`
  return out
}

export default function CortesiaForm() {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CortesiaInput>({ resolver: zodResolver(cortesiaSchema) })

  function onSubmit(data: CortesiaInput) {
    setServerError(null)
    startTransition(async () => {
      const result = await submitCortesia(data)
      if (result.success) {
        setDone(true)
      } else {
        setServerError(result.error)
      }
    })
  }

  const inputCls =
    'w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20'
  const labelCls = 'mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70'
  const errCls = 'mt-1.5 font-dm text-xs text-red-600'

  // aria-invalid / aria-describedby helper por campo.
  function aria(field: keyof CortesiaInput) {
    return {
      id: field,
      'aria-invalid': errors[field] ? true : undefined,
      'aria-describedby': errors[field] ? `${field}-error` : undefined,
    }
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border-4 border-somma-cream bg-somma-cream shadow-[4px_4px_0_#FF4800] sm:rounded-3xl sm:shadow-[8px_8px_0_#FF4800]">
      <div className="p-5 sm:p-6 md:p-8 lg:p-10">
        {done ? (
          <div role="status" className="flex flex-col items-center py-6 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-somma-blue/15 px-4 py-2 font-dm text-xs font-bold uppercase tracking-widest text-somma-blue">
              Cadastro confirmado
            </span>
            <h2 className="font-bebas text-4xl leading-tight tracking-wide text-somma-black md:text-5xl">
              Sua cortesia está garantida!
            </h2>
            <p className="mt-3 max-w-sm font-dm text-sm leading-relaxed text-somma-black/60">
              Recebemos seus dados. Em breve entraremos em contato com os próximos passos.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 border-b-2 border-dashed border-somma-black/15 pb-5">
              <p className="font-dm text-[11px] font-bold uppercase tracking-[0.25em] text-somma-orange">
                Cadastro · Cortesia
              </p>
              <h2 className="mt-1 font-bebas text-3xl leading-tight tracking-wide text-somma-black md:text-4xl">
                Garanta sua cortesia
              </h2>
              <p className="mt-2 font-dm text-sm text-somma-black/60">
                Preencha seus dados para receber sua cortesia do Somma Special Day.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div>
                <label htmlFor="nome" className={labelCls}>Nome completo</label>
                <input {...register('nome')} {...aria('nome')} placeholder="Seu nome" className={inputCls} />
                {errors.nome && <p id="nome-error" role="alert" className={errCls}>{errors.nome.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className={labelCls}>E-mail</label>
                <input {...register('email')} {...aria('email')} type="email" placeholder="seu@email.com" className={inputCls} />
                {errors.email && <p id="email-error" role="alert" className={errCls}>{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="telefone" className={labelCls}>Telefone com DDD</label>
                  <input
                    {...register('telefone')}
                    {...aria('telefone')}
                    placeholder="(61) 99999-0000"
                    inputMode="numeric"
                    className={inputCls}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value)
                      e.target.value = formatted
                      setValue('telefone', formatted, { shouldValidate: false })
                    }}
                  />
                  {errors.telefone && <p id="telefone-error" role="alert" className={errCls}>{errors.telefone.message}</p>}
                </div>

                <div>
                  <label htmlFor="dataNascimento" className={labelCls}>Data de nascimento</label>
                  <input
                    {...register('dataNascimento')}
                    {...aria('dataNascimento')}
                    placeholder="DD/MM/AAAA"
                    inputMode="numeric"
                    className={inputCls}
                    onChange={(e) => {
                      const formatted = formatBirthDate(e.target.value)
                      e.target.value = formatted
                      setValue('dataNascimento', formatted, { shouldValidate: false })
                    }}
                  />
                  {errors.dataNascimento && (
                    <p id="dataNascimento-error" role="alert" className={errCls}>{errors.dataNascimento.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="genero" className={labelCls}>Gênero</label>
                  <select {...register('genero')} {...aria('genero')} defaultValue="" className={`${inputCls} cursor-pointer`}>
                    <option value="" disabled>Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                  {errors.genero && <p id="genero-error" role="alert" className={errCls}>{errors.genero.message}</p>}
                </div>

                <div>
                  <label htmlFor="cpf" className={labelCls}>CPF</label>
                  <input
                    {...register('cpf')}
                    {...aria('cpf')}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    className={inputCls}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value)
                      e.target.value = formatted
                      setValue('cpf', formatted, { shouldValidate: false })
                    }}
                  />
                  {errors.cpf && <p id="cpf-error" role="alert" className={errCls}>{errors.cpf.message}</p>}
                </div>
              </div>

              {serverError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center font-dm text-sm text-red-600">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="mt-2 w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-4 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-somma-orange/90 hover:shadow-[3px_3px_0_#0a0a0a] disabled:cursor-not-allowed disabled:opacity-60 sm:text-xl md:text-2xl md:shadow-[5px_5px_0_#0a0a0a]"
              >
                {isPending ? 'ENVIANDO...' : 'QUERO MINHA CORTESIA'}
              </button>

              <p className="text-center font-dm text-xs text-somma-black/50">
                Seus dados estão seguros. Não fazemos spam.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
