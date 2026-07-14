'use client'

import { useMemo, useState } from 'react'
import { DayUseOrder, DAYUSE_STATUS, DAYUSE_FORMAS } from '@/lib/dayuse/types'

const onlyDigits = (s: string) => s.replace(/\D/g, '')
const fmtCpf = (c: string) =>
  c.length === 11 ? c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : c
const fmtMoney = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtDate = (s: string) => new Date(s).toLocaleString('pt-BR')

const statusColor: Record<string, string> = {
  Pago: 'border-green-600 bg-green-500/15 text-green-700',
  Pendente: 'border-somma-yellow bg-somma-yellow/15 text-yellow-700',
  Cancelado: 'border-red-500 bg-red-500/15 text-red-600',
}

export default function DayUseAdminDashboard({ orders: initial }: { orders: DayUseOrder[] }) {
  const [orders, setOrders] = useState<DayUseOrder[]>(initial)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<DayUseOrder | null>(null)
  const [busy, setBusy] = useState<Record<string, string | null>>({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return orders
    const qDigits = onlyDigits(q)
    return orders.filter(
      o =>
        o.nome.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        (qDigits.length > 0 && o.cpf.includes(qDigits)),
    )
  }, [orders, query])

  const totals = useMemo(
    () => ({
      total: orders.length,
      pagos: orders.filter(o => o.status_pagamento === 'Pago').length,
      pulseiras: orders.filter(o => o.pulseira_entregue).length,
    }),
    [orders],
  )

  const setRow = (id: string, action: string | null) =>
    setBusy(b => ({ ...b, [id]: action }))

  async function patch(id: string, payload: Record<string, unknown>, action: string) {
    setRow(id, action)
    try {
      const res = await fetch(`/api/admin/dayuse/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        alert(json.error || 'Erro ao salvar.')
        return false
      }
      setOrders(list => list.map(o => (o.id === id ? (json.order as DayUseOrder) : o)))
      return true
    } catch {
      alert('Erro de rede.')
      return false
    } finally {
      setRow(id, null)
    }
  }

  async function remove(id: string, nome: string) {
    if (!confirm(`Excluir o pedido de ${nome}? Isso também remove a cobrança no Asaas e não pode ser desfeito.`))
      return
    setRow(id, 'delete')
    try {
      const res = await fetch(`/api/admin/dayuse/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) {
        alert(json.error || 'Erro ao excluir.')
        return
      }
      setOrders(list => list.filter(o => o.id !== id))
    } catch {
      alert('Erro de rede.')
    } finally {
      setRow(id, null)
    }
  }

  async function resend(id: string) {
    setRow(id, 'resend')
    try {
      const res = await fetch(`/api/admin/dayuse/${id}/resend`, { method: 'POST' })
      const json = await res.json()
      alert(res.ok ? 'Comprovante reenviado!' : json.error || 'Erro ao reenviar.')
    } catch {
      alert('Erro de rede.')
    } finally {
      setRow(id, null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Pedidos" value={totals.total} />
        <Stat label="Pagos" value={totals.pagos} />
        <Stat label="Pulseiras" value={totals.pulseiras} />
      </div>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Buscar por nome, e-mail ou CPF"
        className="w-full rounded-xl border-2 border-somma-black bg-white px-4 py-3 font-dm text-somma-black outline-none"
      />

      <div className="space-y-3">
        {filtered.map(o => {
          const isPago = o.status_pagamento === 'Pago'
          const b = busy[o.id]
          return (
            <article
              key={o.id}
              className="rounded-2xl border-4 border-somma-black bg-white p-4 shadow-[4px_4px_0_#005EFF]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bebas text-2xl tracking-wide text-somma-black">{o.nome}</h3>
                  <p className="text-sm text-somma-black/70">{o.email}</p>
                  <p className="text-sm text-somma-black/70">
                    CPF {fmtCpf(o.cpf)} · Tel {o.telefone}
                  </p>
                  <p className="mt-1 text-sm text-somma-black/70">
                    {fmtMoney(Number(o.valor))} · {o.forma_pagamento} · {fmtDate(o.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full border-2 px-3 py-1 font-dm text-xs font-bold ${statusColor[o.status_pagamento] || ''}`}
                  >
                    {o.status_pagamento}
                  </span>
                  {o.pulseira_entregue && (
                    <span className="rounded-full border-2 border-green-600 bg-green-500/15 px-3 py-1 font-dm text-xs font-bold text-green-700">
                      Pulseira entregue
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  disabled={!isPago || !!b}
                  onClick={() => patch(o.id, { pulseira_entregue: !o.pulseira_entregue }, 'pulseira')}
                  className="rounded-full border-2 border-somma-black bg-somma-orange px-4 py-2 font-bebas text-sm tracking-widest text-somma-cream disabled:opacity-40"
                >
                  {b === 'pulseira'
                    ? '...'
                    : o.pulseira_entregue
                      ? 'Desfazer pulseira'
                      : 'Validar pulseira'}
                </button>
                <button
                  disabled={!isPago || !!b}
                  onClick={() => resend(o.id)}
                  className="rounded-full border-2 border-somma-blue bg-somma-blue/10 px-4 py-2 font-bebas text-sm tracking-widest text-somma-blue disabled:opacity-40"
                >
                  {b === 'resend' ? '...' : 'Reenviar e-mail'}
                </button>
                <button
                  disabled={!!b}
                  onClick={() => setEditing(o)}
                  className="rounded-full border-2 border-somma-black bg-white px-4 py-2 font-bebas text-sm tracking-widest text-somma-black disabled:opacity-40"
                >
                  Editar
                </button>
                <button
                  disabled={!!b}
                  onClick={() => remove(o.id, o.nome)}
                  className="rounded-full border-2 border-red-600 bg-red-500/10 px-4 py-2 font-bebas text-sm tracking-widest text-red-600 disabled:opacity-40"
                >
                  {b === 'delete' ? '...' : 'Excluir'}
                </button>
              </div>
            </article>
          )
        })}
        {filtered.length === 0 && (
          <p className="rounded-2xl border-4 border-somma-black bg-white px-5 py-12 text-center text-somma-black/50">
            Nenhum pedido encontrado.
          </p>
        )}
      </div>

      {editing && (
        <EditModal
          order={editing}
          busy={busy[editing.id] === 'edit'}
          onClose={() => setEditing(null)}
          onSave={async fields => {
            const ok = await patch(editing.id, fields, 'edit')
            if (ok) setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border-4 border-somma-black bg-white p-4 text-center shadow-[4px_4px_0_#005EFF]">
      <p className="font-bebas text-4xl text-somma-orange">{value}</p>
      <p className="font-dm text-xs uppercase tracking-widest text-somma-black/60">{label}</p>
    </div>
  )
}

function EditModal({
  order,
  busy,
  onClose,
  onSave,
}: {
  order: DayUseOrder
  busy: boolean
  onClose: () => void
  onSave: (fields: Record<string, unknown>) => void
}) {
  const [f, setF] = useState({
    nome: order.nome,
    email: order.email,
    cpf: order.cpf,
    telefone: order.telefone,
    forma_pagamento: order.forma_pagamento,
    status_pagamento: order.status_pagamento,
    valor: String(order.valor),
  })
  const set = (k: string, v: string) => setF(prev => ({ ...prev, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border-4 border-somma-black bg-somma-cream p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="mb-4 font-bebas text-3xl tracking-wide text-somma-black">Editar pedido</h3>
        <div className="space-y-3">
          <Field label="Nome" value={f.nome} onChange={v => set('nome', v)} />
          <Field label="E-mail" value={f.email} onChange={v => set('email', v)} />
          <Field label="CPF" value={f.cpf} onChange={v => set('cpf', v)} />
          <Field label="Telefone" value={f.telefone} onChange={v => set('telefone', v)} />
          <Field label="Valor" value={f.valor} onChange={v => set('valor', v)} type="number" />
          <label className="block">
            <span className="font-dm text-xs uppercase tracking-widest text-somma-black/60">Forma</span>
            <select
              value={f.forma_pagamento}
              onChange={e => set('forma_pagamento', e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-somma-black bg-white px-3 py-2"
            >
              {DAYUSE_FORMAS.map(x => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-dm text-xs uppercase tracking-widest text-somma-black/60">Status</span>
            <select
              value={f.status_pagamento}
              onChange={e => set('status_pagamento', e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-somma-black bg-white px-3 py-2"
            >
              {DAYUSE_STATUS.map(x => (
                <option key={x} value={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-full border-2 border-somma-black px-5 py-2 font-bebas tracking-widest">
            Cancelar
          </button>
          <button
            disabled={busy}
            onClick={() => onSave({ ...f, valor: Number(f.valor) })}
            className="rounded-full border-2 border-somma-black bg-somma-orange px-6 py-2 font-bebas tracking-widest text-somma-cream disabled:opacity-40"
          >
            {busy ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="font-dm text-xs uppercase tracking-widest text-somma-black/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border-2 border-somma-black bg-white px-3 py-2"
      />
    </label>
  )
}
