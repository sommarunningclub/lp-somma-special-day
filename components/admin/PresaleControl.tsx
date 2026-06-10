'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updatePresaleLimit, updatePresaleOpen } from '@/actions/presale'

type Props = {
  limit: number
  count: number
  manualOpen: boolean
}

export default function PresaleControl({ limit, count, manualOpen }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(String(limit))
  const [isPending, startTransition] = useTransition()
  const [isToggling, startToggle] = useTransition()
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const ilimitado = limit <= 0
  const restantes = ilimitado ? null : Math.max(0, limit - count)
  const closedByLimit = !ilimitado && count >= limit
  const closed = !manualOpen || closedByLimit

  function handleSave() {
    setMsg(null)
    const parsed = Number.parseInt(value, 10)
    startTransition(async () => {
      const res = await updatePresaleLimit(parsed)
      if (res.success) {
        setMsg({ type: 'ok', text: 'Limite atualizado!' })
        router.refresh()
      } else {
        setMsg({ type: 'err', text: res.error })
      }
    })
  }

  function handleToggle() {
    setMsg(null)
    const abrir = !manualOpen
    startToggle(async () => {
      const res = await updatePresaleOpen(abrir)
      if (res.success) {
        setMsg({ type: 'ok', text: abrir ? 'Formulário ABERTO! A página já aceita cadastros.' : 'Formulário FECHADO. A página exibe "encerrado".' })
        router.refresh()
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
            Use o botão ao lado para <strong>abrir ou fechar o formulário</strong> da Lista VIP a qualquer momento.
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

      {/* Interruptor manual do formulário */}
      <div className={`mt-5 flex flex-col gap-3 rounded-xl border-2 p-4 sm:flex-row sm:items-center sm:justify-between ${manualOpen ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <div>
          <p className="font-dm text-sm font-bold text-somma-black">
            Formulário da Lista VIP: {manualOpen ? 'ABERTO' : 'FECHADO'}
          </p>
          <p className="mt-0.5 font-dm text-xs text-somma-black/55">
            {manualOpen
              ? 'O público consegue se cadastrar normalmente em /listavip.'
              : 'A página /listavip mostra "cadastro encerrado" e não aceita novos cadastros.'}
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`shrink-0 rounded-xl border-4 border-somma-black px-6 py-3 font-bebas text-lg tracking-widest text-white shadow-[3px_3px_0_#0a0a0a] transition-all hover:translate-x-[1px] hover:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60 ${
            manualOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isToggling ? 'SALVANDO...' : manualOpen ? 'FECHAR FORMULÁRIO' : 'ABRIR FORMULÁRIO'}
        </button>
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
