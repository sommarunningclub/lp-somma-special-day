'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const input =
  'w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20'

export default function AccessForm() {
  const router = useRouter()
  const [etapa, setEtapa] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [website, setWebsite] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function pedir(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    try {
      await fetch('/api/concurso/acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      })
      setEtapa('code')
      setMsg('Se houver uma inscrição com esse e-mail, enviamos um código de 6 dígitos. Confere sua caixa de entrada.')
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function verificar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    try {
      const res = await fetch('/api/concurso/acesso/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      if (res.ok) {
        router.refresh()
        return
      }
      setErro('Código inválido ou expirado.')
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border-4 border-somma-black bg-somma-cream p-6 shadow-[8px_8px_0_#FF4800] sm:p-8">
      <h2 className="font-bebas text-3xl uppercase tracking-wide text-somma-black">Acessar minha inscrição</h2>
      <p className="mt-1 font-dm text-sm text-somma-black/60">Entra com o e-mail que você usou na inscrição.</p>

      {etapa === 'email' ? (
        <form onSubmit={pedir} className="mt-5 space-y-3">
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
            aria-hidden="true"
          />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} placeholder="seu@email.com" />
          <button type="submit" disabled={loading} className="w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-3.5 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] disabled:opacity-60">
            {loading ? 'ENVIANDO...' : 'ENVIAR CÓDIGO'}
          </button>
        </form>
      ) : (
        <form onSubmit={verificar} className="mt-5 space-y-3">
          {msg && <p className="rounded-xl bg-somma-blue/5 px-4 py-2.5 font-dm text-sm text-somma-black/70">{msg}</p>}
          <input
            inputMode="numeric"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className={`${input} text-center text-2xl tracking-[0.5em]`}
            placeholder="000000"
          />
          <button type="submit" disabled={loading || code.length !== 6} className="w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-3.5 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] disabled:opacity-60">
            {loading ? 'VERIFICANDO...' : 'ENTRAR'}
          </button>
          <button type="button" onClick={() => setEtapa('email')} className="w-full font-dm text-sm font-bold text-somma-black/60 underline-offset-2 hover:underline">
            Usar outro e-mail
          </button>
        </form>
      )}

      {erro && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center font-dm text-sm text-red-600">{erro}</p>}
    </div>
  )
}
