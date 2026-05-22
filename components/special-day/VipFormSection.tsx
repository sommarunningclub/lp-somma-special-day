'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { leadSchema, type LeadInput } from '@/lib/validations/lead'
import { submitLead } from '@/actions/leads'
import FormSuccess from './FormSuccess'
import ElasticStringsBackground from './ElasticStringsBackground'
import FloatingElement from './FloatingElement'

gsap.registerPlugin(ScrollTrigger)

function maskCpf(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function maskPhone(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

function inputClass(hasError: boolean) {
  return [
    'bg-somma-cream border-2 rounded-xl px-4 py-3 font-dm text-somma-black placeholder-somma-black/30 w-full',
    'focus:outline-none focus:ring-4 transition',
    hasError
      ? 'border-red-600 focus:ring-red-500/30'
      : 'border-somma-black focus:ring-somma-blue/30',
  ].join(' ')
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-bebas text-somma-black text-lg tracking-widest">{label}</label>
      {children}
      {error && <p className="text-red-700 text-xs font-dm">{error}</p>}
    </div>
  )
}

export default function VipFormSection() {
  const cardRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [submittedData, setSubmittedData] = useState<{nome: string, email: string} | null>(null)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({ resolver: zodResolver(leadSchema) })

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 80,
        opacity: 0,
        scale: 0.95,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: cardRef.current, start: 'top 75%' },
      })
    })
    return () => ctx.revert()
  }, [])

  async function onSubmit(data: LeadInput) {
    setServerError('')
    const result = await submitLead(data)
    if (result.success) {
      if (formRef.current) {
        gsap.to(formRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.4,
          onComplete: () => setSubmittedData({ nome: data.nome, email: data.email }),
        })
      } else {
        setSubmittedData({ nome: data.nome, email: data.email })
      }
    } else {
      setServerError(result.error)
    }
  }

  return (
    <section id="formulario" className="relative overflow-hidden px-4 py-14 sm:py-16 md:py-32">
      <ElasticStringsBackground />
      <FloatingElement src="/elemento-corredor.svg" alt="" speed={0.8} rotate={-15}
        className="hidden lg:block top-[8%] left-[4%] w-32 opacity-80" />
      <FloatingElement src="/elemento-relogio.svg" alt="" speed={1.2} rotate={20}
        className="hidden lg:block bottom-[10%] right-[6%] w-32 opacity-80" />
      <div className="hidden md:block absolute top-10 left-[8%] text-8xl rotate-12 opacity-40 select-none z-10 pointer-events-none">⚡</div>
      <div className="hidden md:block absolute bottom-10 right-[8%] text-8xl -rotate-12 opacity-40 select-none z-10 pointer-events-none">⭐</div>

      <div className="relative max-w-xl mx-auto z-10">
        <div ref={cardRef} className="rounded-2xl border-4 border-somma-black bg-somma-cream p-4 shadow-[4px_4px_0_#0a0a0a] sm:rounded-3xl sm:p-6 sm:shadow-[6px_6px_0_#0a0a0a] md:p-12 md:shadow-[10px_10px_0_#0a0a0a]">
          {submittedData ? (
            <FormSuccess userData={submittedData} />
          ) : (
            <div ref={formRef}>
              <p className="font-dm text-somma-blue text-xs tracking-[0.3em] uppercase text-center mb-2">
                Acesso antecipado + desconto no 1º lote
              </p>
              <h2 className="mb-7 text-center font-bebas text-4xl leading-[1.05] tracking-tight text-somma-black sm:text-5xl md:mb-8 md:text-6xl">
                ENTRA NA<br/>
                <span className="text-somma-orange">LISTA VIP</span>
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                <Field label="Nome completo" error={errors.nome?.message}>
                  <input {...register('nome')} placeholder="Seu nome completo" className={inputClass(!!errors.nome)} />
                </Field>

                <Field label="E-mail" error={errors.email?.message}>
                  <input {...register('email')} type="email" placeholder="seu@email.com" className={inputClass(!!errors.email)} />
                </Field>

                <Field label="CPF" error={errors.cpf?.message}>
                  <input
                    {...register('cpf')}
                    placeholder="000.000.000-00"
                    onChange={(e) => setValue('cpf', maskCpf(e.target.value), { shouldValidate: true })}
                    className={inputClass(!!errors.cpf)}
                  />
                </Field>

                <Field label="WhatsApp" error={errors.telefone?.message}>
                  <input
                    {...register('telefone')}
                    placeholder="(61) 99999-9999"
                    onChange={(e) => setValue('telefone', maskPhone(e.target.value), { shouldValidate: true })}
                    className={inputClass(!!errors.telefone)}
                  />
                </Field>

                {serverError && (
                  <p className="text-red-700 text-sm font-dm text-center font-medium">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-full border-4 border-somma-black bg-somma-orange py-4 font-bebas text-xl tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-somma-orange/90 hover:shadow-[3px_3px_0_#0a0a0a] disabled:cursor-not-allowed disabled:opacity-60 sm:text-2xl sm:shadow-[6px_6px_0_#0a0a0a]"
                >
                  {isSubmitting ? 'Garantindo seu lugar...' : 'Garantir meu lugar'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
