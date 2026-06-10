'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import gsap from 'gsap'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { listaVipSchema, type ListaVipInput } from '@/lib/validations/lista-vip'
import { submitListaVip } from '@/actions/lista-vip'
import FloatingElement from '@/components/special-day/FloatingElement'

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

export default function ListaVipHero({ closed = false }: { closed?: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

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
        router.push(`/listavip/obrigado?codigo=${encodeURIComponent(result.data.codigoUnico)}`)
      } else {
        setServerError(result.error)
      }
    })
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] w-full overflow-hidden bg-somma-black px-4 py-10 sm:py-14 md:min-h-screen md:py-24"
    >
      {/* Floating decorative elements */}
      <FloatingElement
        src="/elemento-relogio.svg"
        alt=""
        speed={0.8}
        rotate={-15}
        className="top-[3%] left-[2%] w-14 opacity-20 sm:w-20 md:w-32 md:opacity-30"
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
        className="bottom-[4%] left-[-6%] w-20 opacity-15 sm:left-[4%] sm:w-24 md:w-36 md:opacity-25"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        {/* COLUNA ESQUERDA — Branding + storytelling */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Logo */}
          <div className="lv-anim mb-7 w-48 sm:w-56 md:w-72 lg:w-full lg:max-w-md">
            <Image
              src="/logo-special-day.svg"
              alt="Somma Special Day"
              width={800}
              height={400}
              className="h-auto w-full"
              priority
            />
          </div>

          {/* Badge */}
          <div className="lv-anim mb-5 inline-flex items-center gap-2 rounded-full border border-somma-orange/40 bg-somma-orange/10 px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-somma-orange" />
            <span className="font-dm text-xs font-semibold uppercase tracking-widest text-somma-orange">
              Algo grande está chegando
            </span>
          </div>

          {/* Title */}
          <h1 className="lv-anim mb-5 font-bebas leading-[0.9] tracking-wide">
            <span className="block text-4xl text-somma-cream sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl">
              EM BREVE,
            </span>
            <span className="block text-4xl text-somma-yellow sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl">
              SEJA O PRIMEIRO
            </span>
            <span className="block text-4xl text-somma-cream sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl">
              A SABER.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="lv-anim mb-8 max-w-xl font-dm text-base leading-relaxed text-somma-cream/75">
            A line-up do maior evento do ano do Somma ainda é{' '}
            <span className="font-semibold text-somma-orange">segredo</span>. Quem entrar na Lista VIP
            descobre antes de todo mundo e garante uma das{' '}
            <span className="font-semibold text-somma-yellow">pouquíssimas vagas</span>.
          </p>

          {/* Save the date */}
          <div className="lv-anim flex w-full max-w-md items-center gap-3 rounded-2xl border-4 border-somma-yellow bg-somma-yellow/10 px-4 py-4 shadow-[4px_4px_0_#FDB716] sm:gap-4 sm:px-5 sm:shadow-[6px_6px_0_#FDB716]">
            <div className="flex flex-col items-center justify-center rounded-xl bg-somma-yellow px-3 py-2 text-somma-black shadow-inner">
              <span className="font-dm text-[10px] font-bold uppercase tracking-widest">Julho</span>
              <span className="font-bebas text-3xl leading-none">18</span>
              <span className="font-dm text-[10px] font-bold uppercase tracking-widest">2026</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col text-left">
              <span className="font-bebas text-xl tracking-widest text-somma-yellow">
                Reserve a data
              </span>
              <span className="font-dm text-xs leading-snug text-somma-cream/80">
                18 de julho de 2026 · Brasília · DF
              </span>
              <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-somma-orange/20 px-2.5 py-1 font-dm text-[11px] font-bold uppercase tracking-wide text-somma-orange">
                1º lote aberto · o preço sobe na virada
              </span>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA — Apenas o formulário */}
        <div className="lv-anim w-full justify-self-center lg:justify-self-end">
          <div className="w-full max-w-lg rounded-2xl border-4 border-somma-cream bg-somma-cream shadow-[4px_4px_0_#FF4800] sm:rounded-3xl sm:shadow-[8px_8px_0_#FF4800]">
            <div className="p-5 sm:p-6 md:p-8 lg:p-10">
              {closed ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-somma-orange/15 px-4 py-2 font-dm text-xs font-bold uppercase tracking-widest text-somma-orange">
                    Cadastro encerrado
                  </span>
                  <h2 className="font-bebas text-4xl leading-tight tracking-wide text-somma-black md:text-5xl">
                    A lista VIP fechada
                  </h2>
                  <p className="mt-3 max-w-sm font-dm text-sm leading-relaxed text-somma-black/60">
                    O cadastro da Lista VIP do Somma Special Day está encerrado por enquanto.
                    Fique de olho nas nossas redes: novidades chegam em breve.
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
              ) : (
              <>
                {/* Header do form */}
                <div className="mb-6 border-b-2 border-dashed border-somma-black/15 pb-5">
                  <p className="font-dm text-[11px] font-bold uppercase tracking-[0.25em] text-somma-orange">
                    Cadastro · Lista VIP
                  </p>
                  <h2 className="mt-1 font-bebas text-3xl leading-tight tracking-wide text-somma-black md:text-4xl">
                    Garanta sua vaga
                  </h2>
                  <p className="mt-2 font-dm text-sm text-somma-black/60">
                    Preencha seus dados e seja avisado em primeira mão.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                  <div>
                    <label className="mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70">
                      Nome completo
                    </label>
                    <input
                      {...register('nome')}
                      placeholder="Seu nome"
                      className="w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20"
                    />
                    {errors.nome && (
                      <p className="mt-1.5 font-dm text-xs text-red-600">{errors.nome.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70">
                      E-mail
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="seu@email.com"
                      className="w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20"
                    />
                    {errors.email && (
                      <p className="mt-1.5 font-dm text-xs text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70">
                        Telefone
                      </label>
                      <input
                        {...register('telefone')}
                        placeholder="(61) 99999-0000"
                        inputMode="numeric"
                        className="w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20"
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value)
                          e.target.value = formatted
                          setValue('telefone', formatted, { shouldValidate: false })
                        }}
                      />
                      {errors.telefone && (
                        <p className="mt-1.5 font-dm text-xs text-red-600">{errors.telefone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70">
                        Sexo
                      </label>
                      <select
                        {...register('sexo')}
                        defaultValue=""
                        className="w-full cursor-pointer rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20"
                      >
                        <option value="" disabled>Selecione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                      {errors.sexo && (
                        <p className="mt-1.5 font-dm text-xs text-red-600">{errors.sexo.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70">
                      CPF
                    </label>
                    <input
                      {...register('cpf')}
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                      className="w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20"
                      onChange={(e) => {
                        const formatted = formatCPF(e.target.value)
                        e.target.value = formatted
                        setValue('cpf', formatted, { shouldValidate: false })
                      }}
                    />
                    {errors.cpf && (
                      <p className="mt-1.5 font-dm text-xs text-red-600">{errors.cpf.message}</p>
                    )}
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
                    {isPending ? 'ENVIANDO...' : 'QUERO ENTRAR NA LISTA VIP'}
                  </button>

                  <p className="text-center font-dm text-xs text-somma-black/50">
                    Seus dados estão seguros. Não fazemos spam.
                  </p>
                </form>
              </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
