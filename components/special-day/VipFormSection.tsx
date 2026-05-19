'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { leadSchema, type LeadInput } from '@/lib/validations/lead'
import { submitLead } from '@/actions/leads'
import FormSuccess from './FormSuccess'

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
    'bg-somma-black/50 border rounded-xl px-4 py-3 font-dm text-somma-white placeholder-somma-white/30',
    'focus:outline-none focus:ring-2 transition',
    hasError
      ? 'border-red-500 focus:ring-red-500/40'
      : 'border-somma-blue/40 focus:ring-somma-yellow/40',
  ].join(' ')
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-dm text-somma-white/80 text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs font-dm">{error}</p>}
    </div>
  )
}

export default function VipFormSection() {
  const cardRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [submitted, setSubmitted] = useState(false)
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
        y: 60,
        opacity: 0,
        scale: 0.97,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 75%',
        },
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
          onComplete: () => setSubmitted(true),
        })
      } else {
        setSubmitted(true)
      }
    } else {
      setServerError(result.error)
    }
  }

  return (
    <section id="formulario" className="py-24 px-4 bg-somma-black">
      <div className="max-w-lg mx-auto">
        <div ref={cardRef} className="bg-somma-blue/20 border border-somma-blue/40 rounded-3xl p-8 md:p-12">
          {submitted ? (
            <FormSuccess />
          ) : (
            <div ref={formRef}>
              <h2 className="font-bebas text-4xl md:text-5xl text-somma-yellow text-center tracking-wider mb-2">
                Entre na Lista VIP
              </h2>
              <p className="font-dm text-somma-white/60 text-center text-sm mb-8">
                Acesso antecipado e desconto exclusivo no 1 lote
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                <Field label="Nome completo" error={errors.nome?.message}>
                  <input
                    {...register('nome')}
                    placeholder="Seu nome completo"
                    className={inputClass(!!errors.nome)}
                  />
                </Field>

                <Field label="E-mail" error={errors.email?.message}>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="seu@email.com"
                    className={inputClass(!!errors.email)}
                  />
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
                  <p className="text-red-400 text-sm font-dm text-center">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-somma-orange hover:bg-somma-orange/90 disabled:opacity-60 disabled:cursor-not-allowed text-somma-white font-bebas text-2xl tracking-widest py-4 rounded-full transition-transform hover:scale-105 active:scale-95 mt-2"
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
