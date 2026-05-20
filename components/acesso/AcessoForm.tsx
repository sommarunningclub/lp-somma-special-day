'use client'

import { useState, useTransition } from 'react'
import { validarInsider } from '@/actions/insider'

function formatCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export default function AcessoForm() {
  const [cpf, setCpf] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function action(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await validarInsider(formData)
      if (result && !result.success) {
        setError(result.error)
      }
    })
  }

  return (
    <form action={action} className="rounded-3xl border-4 border-somma-black bg-somma-black/50 p-8 shadow-[8px_8px_0_#FF4800]">
      <h1 className="mb-2 text-center font-bebas text-3xl tracking-widest text-somma-yellow">
        Acesso Exclusivo
      </h1>
      <p className="mb-6 text-center font-dm text-sm text-somma-cream/60">
        Esta área é restrita. Informe seu CPF para entrar.
      </p>

      <div className="mb-5">
        <input
          name="cpf"
          value={cpf}
          onChange={e => { setCpf(formatCPF(e.target.value)); setError(null) }}
          placeholder="000.000.000-00"
          inputMode="numeric"
          autoFocus
          required
          className="w-full rounded-2xl border-4 border-somma-black bg-somma-cream px-4 py-3 text-center font-dm text-lg tracking-widest text-somma-black shadow-[3px_3px_0_#005EFF] placeholder:text-somma-black/40 focus:shadow-[3px_3px_0_#FF4800] focus:outline-none transition-shadow"
        />
        {error && (
          <p className="mt-2 text-center font-dm text-xs text-somma-pink">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full border-4 border-somma-black bg-somma-orange px-6 py-3 font-bebas text-lg tracking-widest text-somma-cream shadow-[5px_5px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#0a0a0a] disabled:opacity-60"
      >
        {pending ? 'Verificando...' : 'Entrar'}
      </button>
    </form>
  )
}
