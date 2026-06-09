'use client'

import { useState, useTransition } from 'react'
import { updatePresaleLimit } from '@/actions/presale'

type Props = {
  limit: number
  count: number
}

export default function PresaleControl({ limit, count }: Props) {
  const [value, setValue] = useState(String(limit))
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const ilimitado = limit <= 0
  const restantes = ilimitado ? null : Math.max(0, limit - count)
  const closed = !ilimitado && count >= limit

  function handleSave() {
    setMsg(null)
    const parsed = Number.parseInt(value, 10)
    startTransition(async () => {
      const res = await updatePresaleLimit(parsed)
      if (res.success) {
        setMsg({ type: 'ok', text: 'Limite atualizado!' })
      } else {
        setMsg({ type: 'err', text: res.error })
      }
    })
  }

  return (
    <div className="mb-8 rounded-2xl border-4 border-somma-blue/30 bg-white p-5 md:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bebas text-2xl tracking-wider text-somma-blue">Pré-venda · Cadastros</h2>
          <p className="mt-0.5 text-sm text-somma-black/60">
            Vagas <strong>ilimitadas</strong> (controle por virada de lote no app). Use <strong>0</strong> para manter sem limite, ou defina um número para travar o cadastro.
          </p>
        </div>
        <span
          className={`mt-2 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 font-dm text-xs font-bold uppercase tracking-wide sm:mt-0 ${
            closed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${closed ? 'bg-red-500' : 'bg-green-500'}`} />
          {closed ? 'Encerrada' : 'Aberta'}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat label="Cadastros" value={String(count)} />
        <Stat label="Limite" value={ilimitado ? 'Ilimitado' : String(limit)} />
        <Stat label="Restantes" value={restantes === null ? '∞' : String(restantes)} />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70">
            Limite de vagas (0 = ilimitado)
          </label>
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-xl border-4 border-somma-black bg-somma-orange px-6 py-3 font-bebas text-lg tracking-widest text-somma-cream shadow-[3px_3px_0_#0a0a0a] transition-all hover:translate-x-[1px] hover:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'SALVANDO...' : 'SALVAR'}
        </button>
      </div>

      {msg && (
        <p className={`mt-3 font-dm text-sm ${msg.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</p>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-somma-black/[0.04] px-4 py-3 text-center">
      <p className="font-bebas text-3xl leading-none tracking-wide text-somma-black">{value}</p>
      <p className="mt-1 font-dm text-[11px] font-bold uppercase tracking-wider text-somma-black/50">{label}</p>
    </div>
  )
}
