'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCpf } from '@/lib/contest/cpf'

const input =
  'w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20'

export default function AccessForm() {
  const router = useRouter()
  const [cpf, setCpf] = useState('')
  const [website, setWebsite] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    try {
      const res = await fetch('/api/concurso/acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, website }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        router.refresh()
        return
      }
      setErro(json.error ?? 'Não conseguimos entrar com esse CPF.')
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border-4 border-somma-black bg-somma-cream p-6 shadow-[8px_8px_0_#FF4800] sm:p-8">
      <h2 className="font-bebas text-3xl uppercase tracking-wide text-somma-black">Acessar minha inscrição</h2>
      <p className="mt-1 font-dm text-sm text-somma-black/60">
        Entra com o CPF que você usou na inscrição.
      </p>

      <form onSubmit={entrar} className="mt-5 space-y-3">
        {/* honeypot */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />
        <input
          inputMode="numeric"
          required
          value={cpf}
          onChange={(e) => setCpf(formatCpf(e.target.value))}
          className={`${input} text-center text-lg tracking-[0.18em]`}
          placeholder="000.000.000-00"
          maxLength={14}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-3.5 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] disabled:opacity-60"
        >
          {loading ? 'ENTRANDO...' : 'ENTRAR'}
        </button>
      </form>

      {erro && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center font-dm text-sm text-red-600">
          {erro}
        </p>
      )}

      <p className="mt-4 text-center font-dm text-xs text-somma-black/45">
        Ainda não se inscreveu?{' '}
        <a href="/esquenta-junino/concurso/participar" className="font-bold text-somma-orange underline-offset-2 hover:underline">
          Criar inscrição
        </a>
      </p>
    </div>
  )
}
