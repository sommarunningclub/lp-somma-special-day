'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nutricaoSchema, type NutricaoInput } from '@/lib/validations/nutricao'
import { enrollNutricao } from '@/actions/nutricao'

export default function NutricaoCaptureSection() {
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

  return (
    <section className="relative overflow-hidden bg-somma-cream px-4 py-16 md:py-24">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* COLUNA ESQUERDA copy */}
        <div className="text-center lg:text-left">
          <p className="font-dm text-xs uppercase tracking-[0.3em] text-somma-orange md:text-sm">
            Receba as novidades
          </p>
          <h2 className="mt-3 font-bebas text-4xl leading-[0.95] tracking-wide text-somma-black md:text-6xl">
            FIQUE POR DENTRO DE <span className="text-somma-orange">TUDO</span> DO SOMMA SPECIAL DAY!
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-dm text-base leading-relaxed text-somma-black/70 lg:mx-0 md:text-lg">
            Spoilers do percurso, atrações, line-up e atalhos pra garantir sua inscrição
            antes da galera. Tudo no seu e-mail. Zero spam, palavra de Somma.
          </p>

        </div>

        {/* COLUNA DIREITA form */}
        <div className="mx-auto w-full max-w-md lg:justify-self-end">
          {done ? (
            <div className="rounded-3xl border-4 border-somma-black bg-white p-7 text-center shadow-[8px_8px_0_#FF4800] sm:p-8">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border-4 border-somma-black bg-somma-orange font-bebas text-3xl text-somma-cream">
                ✓
              </div>
              <h3 className="font-bebas text-2xl tracking-widest text-somma-black sm:text-3xl">
                Pronto! Você tá dentro!
              </h3>
              <p className="mx-auto mt-3 max-w-xs font-dm text-sm text-somma-black/70">
                Seu primeiro e-mail já tá voando! Dá uma olhada na caixa de entrada (e na de spam, só por garantia).
              </p>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="mt-5 font-dm text-xs font-bold uppercase tracking-widest text-somma-orange underline-offset-4 hover:underline"
              >
                Cadastrar outro e-mail
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="rounded-3xl border-4 border-somma-black bg-white p-6 shadow-[8px_8px_0_#FF4800] sm:p-7"
            >
              <h3 className="font-bebas text-2xl tracking-widest text-somma-black sm:text-3xl">
                Quero acompanhar
              </h3>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/60">
                    Nome completo
                  </label>
                  <input
                    {...register('nome')}
                    className="w-full rounded-xl border-4 border-somma-black bg-somma-cream px-4 py-3 font-dm text-sm text-somma-black shadow-[3px_3px_0_#005EFF] placeholder:text-somma-black/40 focus:shadow-[3px_3px_0_#FF4800] focus:outline-none"
                    placeholder="Seu nome"
                  />
                  {errors.nome && <p className="mt-1.5 font-dm text-xs text-somma-pink">{errors.nome.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/60">
                    E-mail
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full rounded-xl border-4 border-somma-black bg-somma-cream px-4 py-3 font-dm text-sm text-somma-black shadow-[3px_3px_0_#005EFF] placeholder:text-somma-black/40 focus:shadow-[3px_3px_0_#FF4800] focus:outline-none"
                    placeholder="seu@email.com"
                  />
                  {errors.email && <p className="mt-1.5 font-dm text-xs text-somma-pink">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/60">
                    WhatsApp <span className="text-somma-black/40">(opcional)</span>
                  </label>
                  <input
                    {...register('telefone')}
                    className="w-full rounded-xl border-4 border-somma-black bg-somma-cream px-4 py-3 font-dm text-sm text-somma-black shadow-[3px_3px_0_#005EFF] placeholder:text-somma-black/40 focus:shadow-[3px_3px_0_#FF4800] focus:outline-none"
                    placeholder="(61) 9XXXX-XXXX"
                  />
                </div>
              </div>

              {serverError && (
                <p className="mt-4 rounded-xl border-2 border-somma-pink bg-somma-pink/10 px-3 py-2 text-center font-dm text-sm text-somma-pink">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="mt-6 w-full rounded-full border-4 border-somma-black bg-somma-orange px-6 py-4 font-bebas text-lg tracking-widest text-somma-cream shadow-[5px_5px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-somma-black hover:shadow-[3px_3px_0_#0a0a0a] disabled:opacity-60 md:text-xl"
              >
                {isPending ? 'Cadastrando...' : 'Receber novidades'}
              </button>
              <p className="mt-3 text-center font-dm text-[11px] text-somma-black/50">
                Sem spam. Você pode sair quando quiser pelo link no rodapé dos e-mails.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
