'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registroSchema, type RegistroInput } from '@/lib/contest/schemas'
import { formatCpf } from '@/lib/contest/cpf'
import { track } from '@/lib/analytics'

const input =
  'w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20'
const label = 'mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70'
const err = 'mt-1 font-dm text-xs font-semibold text-red-600'

export default function ParticipantForm() {
  const router = useRouter()
  const [website, setWebsite] = useState('') // honeypot
  const [erro, setErro] = useState<string | null>(null)
  const [cpfExiste, setCpfExiste] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistroInput>({ resolver: zodResolver(registroSchema), mode: 'onTouched' })

  async function onSubmit(data: RegistroInput) {
    setErro(null)
    setCpfExiste(false)
    try {
      const res = await fetch('/api/concurso/inscricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, website }),
      })
      const json = await res.json()
      if (res.ok) {
        track('contest_registration_completed')
        router.push('/esquenta-junino/concurso/minha-inscricao')
        return
      }
      if (json.code === 'cpf_exists') setCpfExiste(true)
      setErro(json.error ?? 'Não foi possível concluir a inscrição.')
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5" onChange={() => track('contest_registration_started')}>
      {/* honeypot invisível */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div>
        <label className={label}>Nome completo *</label>
        <input {...register('full_name')} className={input} placeholder="Seu nome completo" />
        {errors.full_name && <p className={err}>{errors.full_name.message}</p>}
      </div>

      <div>
        <label className={label}>E-mail *</label>
        <input type="email" {...register('email')} className={input} placeholder="seu@email.com" />
        {errors.email && <p className={err}>{errors.email.message}</p>}
      </div>

      <div>
        <label className={label}>CPF *</label>
        <input
          inputMode="numeric"
          {...register('cpf')}
          onChange={(e) => setValue('cpf', formatCpf(e.target.value), { shouldValidate: true })}
          className={input}
          placeholder="000.000.000-00"
        />
        {errors.cpf && <p className={err}>{errors.cpf.message}</p>}
        <p className="mt-1 font-dm text-[11px] text-somma-black/45">
          Esse CPF é o que você vai usar pra acessar sua área e mandar as fotos depois.
        </p>
      </div>

      <div className="space-y-2 rounded-2xl border-2 border-somma-black/10 bg-white/50 p-4">
        <label className="flex items-start gap-2 font-dm text-sm text-somma-black/80">
          <input type="checkbox" {...register('authorize_image')} className="mt-0.5 h-5 w-5 shrink-0 accent-somma-orange" />
          <span>Autorizo o uso da minha imagem e das fotos enviadas na divulgação do Concurso Junino SOMMA.</span>
        </label>
        {errors.authorize_image && <p className={err}>{errors.authorize_image.message}</p>}
        <label className="flex items-start gap-2 font-dm text-sm text-somma-black/80">
          <input type="checkbox" {...register('accept_rules')} className="mt-0.5 h-5 w-5 shrink-0 accent-somma-orange" />
          <span>Li e aceito o regulamento e a política de privacidade.</span>
        </label>
        {errors.accept_rules && <p className={err}>{errors.accept_rules.message}</p>}
      </div>

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center font-dm text-sm text-red-600">
          {erro}
          {cpfExiste && (
            <>
              {' '}
              <a href="/esquenta-junino/concurso/minha-inscricao" className="font-bold underline">
                Acessar com meu CPF
              </a>
            </>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-4 font-bebas text-xl tracking-widest text-somma-cream shadow-[5px_5px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#0a0a0a] disabled:opacity-60"
      >
        {isSubmitting ? 'ENVIANDO...' : 'CRIAR MINHA INSCRIÇÃO'}
      </button>
      <p className="text-center font-dm text-xs text-somma-black/55">
        Em seguida você vai pra sua área pessoal pra mandar as fotos do look, dar um título e publicar. 🌽
      </p>
    </form>
  )
}
