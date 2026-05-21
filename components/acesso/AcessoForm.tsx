'use client'

import { useState, useTransition } from 'react'
import { validarInsider } from '@/actions/insider'

export default function AcessoForm() {
  const [identificador, setIdentificador] = useState('')
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
    <form action={action} className="rounded-2xl border-4 border-somma-black bg-somma-black p-6 shadow-[5px_5px_0_#FF4800] sm:rounded-3xl sm:p-8 sm:shadow-[8px_8px_0_#FF4800]">
      <h1 className="mb-2 text-center font-bebas text-3xl tracking-widest text-somma-yellow">
        Acesso Exclusivo
      </h1>
      <p className="mb-6 text-center font-dm text-sm text-somma-cream/60">
        Informe seu CPF, e-mail ou código VIP para entrar.
      </p>

      <div className="mb-5">
        <input
          name="identificador"
          value={identificador}
          onChange={e => { setIdentificador(e.target.value); setError(null) }}
          placeholder="CPF, e-mail ou código VIP"
          inputMode="text"
          autoFocus
          required
          className="w-full rounded-2xl border-4 border-somma-black bg-somma-cream px-4 py-3 text-center font-dm text-base tracking-wide text-somma-black shadow-[3px_3px_0_#005EFF] transition-shadow placeholder:text-somma-black/40 focus:shadow-[3px_3px_0_#FF4800] focus:outline-none sm:text-lg sm:tracking-widest"
        />
        {error && (
          <p className="mt-2 text-center font-dm text-xs text-somma-pink">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full border-4 border-somma-black bg-somma-orange px-6 py-3 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#0a0a0a] disabled:opacity-60 sm:shadow-[5px_5px_0_#0a0a0a]"
      >
        {pending ? 'Verificando...' : 'Entrar'}
      </button>
    </form>
  )
}
