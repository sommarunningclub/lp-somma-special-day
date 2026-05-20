'use client'

import { useState, useTransition } from 'react'
import { login } from '@/actions/auth'

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function action(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await login(formData)
      // login() só retorna em caso de erro; sucesso redireciona no servidor
      if (result && !result.success) {
        setError(result.error)
      }
    })
  }

  return (
    <form action={action} className="rounded-3xl border-4 border-somma-black bg-somma-black/50 p-8 shadow-[8px_8px_0_#005EFF]">
      <h1 className="mb-2 text-center font-bebas text-3xl tracking-widest text-somma-yellow">
        Acesso Admin
      </h1>
      <p className="mb-6 text-center font-dm text-sm text-somma-cream/60">
        Digite a senha para gerenciar as propostas
      </p>

      <div className="mb-5">
        <input
          type="password"
          name="senha"
          placeholder="Senha de acesso"
          autoFocus
          required
          className="w-full rounded-2xl border-4 border-somma-black bg-somma-cream px-4 py-3 font-dm text-sm text-somma-black shadow-[3px_3px_0_#005EFF] placeholder:text-somma-black/40 focus:shadow-[3px_3px_0_#FF4800] focus:outline-none transition-shadow"
        />
        {error && (
          <p className="mt-2 font-dm text-xs text-somma-pink">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full border-4 border-somma-black bg-somma-orange px-6 py-3 font-bebas text-lg tracking-widest text-somma-cream shadow-[5px_5px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#0a0a0a] disabled:opacity-60"
      >
        {pending ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
