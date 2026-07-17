'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleCortesiaBloqueada } from '@/actions/cortesia'

export default function CortesiaBlockToggle({
  initialBlocked,
  total,
  limite,
}: {
  initialBlocked: boolean
  total: number
  limite: number
}) {
  const router = useRouter()
  const [blocked, setBlocked] = useState(initialBlocked)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const atingiuLimite = total >= limite
  // Estado efetivo visto pelo publico: fechado por bloqueio manual OU pelo teto.
  const fechado = blocked || atingiuLimite

  function onToggle() {
    const next = !blocked
    const msg = next
      ? 'Bloquear o formulário de cortesia? Novos cadastros serão impedidos até você reabrir.'
      : 'Reabrir o formulário de cortesia? Novos cadastros voltam a ser aceitos.'
    if (!window.confirm(msg)) return

    setError(null)
    startTransition(async () => {
      const res = await toggleCortesiaBloqueada(next)
      if (res.success) {
        setBlocked(res.bloqueada)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div
      className={`mb-6 rounded-2xl border-4 bg-white p-4 sm:p-5 ${
        fechado
          ? 'border-red-600 shadow-[5px_5px_0_#dc2626]'
          : 'border-green-600 shadow-[5px_5px_0_#16a34a]'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-dm text-[11px] font-bold uppercase tracking-widest ${
              fechado ? 'bg-red-600/10 text-red-600' : 'bg-green-600/10 text-green-700'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${fechado ? 'bg-red-600' : 'bg-green-600'}`} />
            {fechado ? 'Formulário fechado' : 'Formulário aberto'}
          </span>
          <p className="mt-2 font-dm text-sm text-somma-black/70">
            {blocked ? (
              <>Bloqueado manualmente. Ninguém consegue se cadastrar até você reabrir.</>
            ) : atingiuLimite ? (
              <>Fechado automaticamente: o limite de {limite} cortesias foi atingido.</>
            ) : (
              <>Aberto ao público. {total} de {limite} cortesias preenchidas.</>
            )}
          </p>
          {error && <p className="mt-2 font-dm text-sm text-red-600">{error}</p>}
        </div>

        <button
          type="button"
          onClick={onToggle}
          disabled={isPending}
          className={`shrink-0 rounded-full border-4 px-6 py-2.5 font-bebas tracking-widest transition-all disabled:opacity-60 ${
            blocked
              ? 'border-green-600 bg-green-600/15 text-green-700 hover:bg-green-600 hover:text-white'
              : 'border-red-600 bg-red-600/15 text-red-600 hover:bg-red-600 hover:text-white'
          }`}
        >
          {isPending ? 'Salvando...' : blocked ? 'Reabrir formulário' : 'Bloquear formulário'}
        </button>
      </div>
    </div>
  )
}
