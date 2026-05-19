'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import gsap from 'gsap'
import Image from 'next/image'
import { listaVipSchema, type ListaVipInput } from '@/lib/validations/lista-vip'
import { submitListaVip } from '@/actions/lista-vip'
import FloatingElement from '@/components/special-day/FloatingElement'
import FormSuccess from '@/components/special-day/FormSuccess'

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

export default function ListaVipHero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{nome: string, email: string} | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ListaVipInput>({ resolver: zodResolver(listaVipSchema) })

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.lv-anim', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  function onSubmit(data: ListaVipInput) {
    setServerError(null)
    startTransition(async () => {
      const result = await submitListaVip(data)
      if (result.success) {
        setSuccessData({ nome: data.nome, email: data.email })
      } else {
        setServerError(result.error)
      }
    })
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-somma-black px-4 py-16 md:py-24"
    >
      {/* Floating decorative elements */}
      <FloatingElement
        src="/elemento-relogio.svg"
        alt=""
        speed={0.8}
        rotate={-15}
        className="top-[5%] left-[3%] w-20 md:w-32 opacity-30"
      />
      <FloatingElement
        src="/elemento-tenis.svg"
        alt=""
        speed={0.9}
        rotate={-8}
        className="hidden md:block top-[8%] right-[4%] w-28 md:w-40 opacity-25"
      />
      <FloatingElement
        src="/elemento-corredor.svg"
        alt=""
        speed={1.1}
        rotate={10}
        className="bottom-[6%] left-[4%] w-24 md:w-36 opacity-25"
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center">
        {/* Logo */}
        <div className="lv-anim mb-8 w-40 md:w-52">
          <Image
            src="/logo-special-day.svg"
            alt="Somma Special Day"
            width={600}
            height={300}
            className="h-auto w-full"
            priority
          />
        </div>

        {/* Badge */}
        <div className="lv-anim mb-6 inline-flex items-center gap-2 rounded-full border border-somma-orange/40 bg-somma-orange/10 px-4 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-somma-orange" />
          <span className="font-dm text-xs font-semibold uppercase tracking-widest text-somma-orange">
            Algo grande está chegando
          </span>
        </div>

        {/* Title */}
        <h1 className="lv-anim mb-6 text-center font-bebas leading-[0.9] tracking-wide">
          <span className="block text-4xl text-somma-cream sm:text-5xl md:text-6xl lg:text-7xl">
            EM BREVE,
          </span>
          <span className="block text-4xl text-somma-yellow sm:text-5xl md:text-6xl lg:text-7xl">
            SEJA O PRIMEIRO
          </span>
          <span className="block text-4xl text-somma-cream sm:text-5xl md:text-6xl lg:text-7xl">
            A SABER.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="lv-anim mb-6 max-w-xl px-4 text-center font-dm text-sm leading-relaxed text-somma-cream/70 md:text-base">
          A line-up do maior evento do ano do Somma ainda é{' '}
          <span className="font-semibold text-somma-orange">segredo</span>. Quem entrar na Lista VIP
          descobre antes de todo mundo e garante uma das{' '}
          <span className="font-semibold text-somma-yellow">pouquíssimas vagas</span>.
        </p>

        {/* Save the date */}
        <div className="lv-anim mb-10 flex flex-col items-center gap-3">
          <span className="font-bebas text-lg uppercase tracking-[0.3em] text-somma-orange md:text-xl">
            ★ Reserve já na sua agenda ★
          </span>
          <div className="flex flex-col items-center gap-2 rounded-2xl border-4 border-somma-yellow bg-somma-yellow/10 px-6 py-4 shadow-[6px_6px_0_#FDB716] sm:flex-row sm:items-baseline sm:gap-4">
            <span className="font-bebas text-4xl leading-none text-somma-yellow md:text-5xl">
              18 DE JULHO DE 2026
            </span>
            <span className="font-dm text-xs uppercase tracking-widest text-somma-cream/80 md:text-sm">
              Brasília · DF
            </span>
          </div>
          <p className="max-w-md text-center font-dm text-sm leading-relaxed text-somma-cream/80">
            Anote essa data: <span className="font-semibold text-somma-yellow">18 de julho de 2026</span> é o dia do nosso evento. Bloqueie sua agenda agora — você não vai querer ficar de fora.
          </p>
        </div>

        {/* Form card */}
        <div className="lv-anim w-full max-w-lg rounded-3xl border-4 border-somma-cream bg-somma-cream p-6 shadow-[8px_8px_0_#FF4800] md:p-8">
          {successData ? (
            <FormSuccess userData={successData} />
          ) : (
            <>
              <h2 className="mb-6 text-center font-bebas text-2xl tracking-widest text-somma-black md:text-3xl">
                GARANTA SUA VAGA VIP
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div>
                  <label className="mb-1 block font-bebas text-base tracking-widest text-somma-black">
                    Nome completo
                  </label>
                  <input
                    {...register('nome')}
                    placeholder="Seu nome"
                    className="w-full rounded-xl border-2 border-somma-black bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/40 focus:border-somma-blue focus:outline-none"
                  />
                  {errors.nome && (
                    <p className="mt-1 font-dm text-xs text-red-600">{errors.nome.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block font-bebas text-base tracking-widest text-somma-black">
                    E-mail
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full rounded-xl border-2 border-somma-black bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/40 focus:border-somma-blue focus:outline-none"
                  />
                  {errors.email && (
                    <p className="mt-1 font-dm text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-bebas text-base tracking-widest text-somma-black">
                      Telefone
                    </label>
                    <input
                      {...register('telefone')}
                      placeholder="(61) 99999-0000"
                      inputMode="numeric"
                      className="w-full rounded-xl border-2 border-somma-black bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/40 focus:border-somma-blue focus:outline-none"
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value)
                        e.target.value = formatted
                        setValue('telefone', formatted, { shouldValidate: false })
                      }}
                    />
                    {errors.telefone && (
                      <p className="mt-1 font-dm text-xs text-red-600">{errors.telefone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block font-bebas text-base tracking-widest text-somma-black">
                      Sexo
                    </label>
                    <select
                      {...register('sexo')}
                      defaultValue=""
                      className="w-full cursor-pointer rounded-xl border-2 border-somma-black bg-white px-4 py-3 font-dm text-somma-black focus:border-somma-blue focus:outline-none"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                    {errors.sexo && (
                      <p className="mt-1 font-dm text-xs text-red-600">{errors.sexo.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-bebas text-base tracking-widest text-somma-black">
                    CPF
                  </label>
                  <input
                    {...register('cpf')}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    className="w-full rounded-xl border-2 border-somma-black bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/40 focus:border-somma-blue focus:outline-none"
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value)
                      e.target.value = formatted
                      setValue('cpf', formatted, { shouldValidate: false })
                    }}
                  />
                  {errors.cpf && (
                    <p className="mt-1 font-dm text-xs text-red-600">{errors.cpf.message}</p>
                  )}
                </div>

                {serverError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-center font-dm text-sm text-red-600">
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-2 w-full rounded-2xl border-4 border-somma-black bg-somma-orange py-4 font-bebas text-xl tracking-widest text-somma-cream shadow-[5px_5px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-somma-orange/90 hover:shadow-[3px_3px_0_#0a0a0a] disabled:cursor-not-allowed disabled:opacity-60 md:text-2xl"
                >
                  {isPending ? 'ENVIANDO...' : 'QUERO ENTRAR NA LISTA VIP'}
                </button>

                <p className="mt-2 text-center font-dm text-xs text-somma-black/50">
                  Seus dados estão seguros. Não fazemos spam.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
