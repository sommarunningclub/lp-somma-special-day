'use client'

import { useMemo, useState } from 'react'
import { setCortesiaPago } from '@/actions/cortesia'

export interface CortesiaLead {
  id: string
  nome: string
  email: string
  telefone: string
  data_nascimento: string
  genero: string
  cpf: string
  created_at_fmt: string
  pago: boolean
  pago_em_fmt: string
}

const onlyDigits = (s: string) => s.replace(/\D/g, '')

/** Campos exibidos em cada cartão, na ordem de preenchimento em outro sistema. */
const FIELDS: { key: keyof CortesiaLead; label: string }[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'E-mail' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'data_nascimento', label: 'Nascimento' },
  { key: 'genero', label: 'Gênero' },
  { key: 'cpf', label: 'CPF' },
]

const TSV_HEADER = ['Nome', 'E-mail', 'Telefone', 'Nascimento', 'Gênero', 'CPF', 'Cadastrado em']
// Exportação completa inclui a coluna de controle de pagamento.
const EXPORT_HEADER = [...TSV_HEADER, 'Pago']

const rowValues = (l: CortesiaLead) => [
  l.nome,
  l.email,
  l.telefone,
  l.data_nascimento,
  l.genero,
  l.cpf,
  l.created_at_fmt,
]

const rowToTsv = (l: CortesiaLead) => rowValues(l).join('\t')

/** Bloco rotulado, ótimo para colar em formulários/documentos. */
const rowToBlock = (l: CortesiaLead) =>
  TSV_HEADER.map((label, i) => `${label}: ${rowValues(l)[i]}`).join('\n')

/** Escapa um valor para CSV (aspas duplas + campos com vírgula/quebra). */
const csvCell = (v: string) => {
  const s = v ?? ''
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* cai no fallback abaixo */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export default function CortesiaAdminDashboard({ leads }: { leads: CortesiaLead[] }) {
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [onlyPending, setOnlyPending] = useState(false)

  // Estado local do "pago" (atualização otimista sobre o valor do servidor).
  const [pagoState, setPagoState] = useState<Record<string, boolean>>({})
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const [pagoError, setPagoError] = useState<string | null>(null)

  const isPago = (l: CortesiaLead) => pagoState[l.id] ?? l.pago
  const pagosCount = leads.filter(isPago).length
  const pendentesCount = leads.length - pagosCount

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const qDigits = onlyDigits(q)
    return leads.filter((l) => {
      const paid = pagoState[l.id] ?? l.pago
      if (onlyPending && paid) return false
      if (!q) return true
      const hay = `${l.nome} ${l.email}`.toLowerCase()
      const digits = onlyDigits(`${l.cpf}${l.telefone}`)
      return hay.includes(q) || (qDigits.length >= 2 && digits.includes(qDigits))
    })
  }, [leads, query, onlyPending, pagoState])

  async function copy(text: string, key: string) {
    const ok = await copyText(text)
    if (!ok) return
    setCopied(key)
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500)
  }

  async function togglePago(l: CortesiaLead) {
    const next = !isPago(l)
    setPagoError(null)
    // Otimista: reflete na hora e trava o card enquanto salva.
    setPagoState((m) => ({ ...m, [l.id]: next }))
    setSavingIds((s) => new Set(s).add(l.id))

    const res = await setCortesiaPago(l.id, next)

    setSavingIds((s) => {
      const n = new Set(s)
      n.delete(l.id)
      return n
    })
    if (!res.success) {
      // Reverte em caso de erro.
      setPagoState((m) => ({ ...m, [l.id]: !next }))
      setPagoError(res.error)
    }
  }

  const exportRow = (l: CortesiaLead) => [...rowValues(l), isPago(l) ? 'Sim' : 'Não']

  function copyAllTsv() {
    const tsv = [EXPORT_HEADER.join('\t'), ...filtered.map((l) => exportRow(l).join('\t'))].join('\n')
    copy(tsv, 'all-tsv')
  }

  function downloadCsv() {
    const csv = [EXPORT_HEADER, ...filtered.map(exportRow)]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n')
    // BOM p/ Excel abrir acentos corretamente
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cortesia-${filtered.length}-cadastros.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Barra de controles */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border-4 border-somma-black bg-white p-4 shadow-[5px_5px_0_#005EFF] sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-somma-black/40" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, e-mail, CPF ou telefone…"
            aria-label="Buscar cadastros"
            className="w-full rounded-xl border-2 border-somma-black/15 bg-somma-cream py-2.5 pl-10 pr-3 font-dm text-sm text-somma-black placeholder:text-somma-black/40 focus:border-somma-blue focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-dm text-xs font-bold text-somma-black/50">
            {filtered.length} de {leads.length}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-600/10 px-3 py-1 font-dm text-xs font-bold text-green-700">
            {pagosCount} pago{pagosCount !== 1 ? 's' : ''}
            <span className="text-green-700/50">·</span>
            {pendentesCount} pendente{pendentesCount !== 1 ? 's' : ''}
          </span>
          <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-full border-2 border-somma-black/15 bg-somma-cream px-3 py-1.5 font-dm text-xs font-bold text-somma-black/70 transition-colors hover:border-green-600">
            <input
              type="checkbox"
              checked={onlyPending}
              onChange={(e) => setOnlyPending(e.target.checked)}
              className="h-4 w-4 accent-green-600"
            />
            Só pendentes
          </label>
          <button
            type="button"
            onClick={copyAllTsv}
            disabled={filtered.length === 0}
            className="rounded-full border-2 border-somma-blue bg-somma-blue/10 px-4 py-2 font-bebas text-xs tracking-widest text-somma-blue transition-all hover:bg-somma-blue hover:text-white disabled:opacity-40"
          >
            {copied === 'all-tsv' ? 'Copiado!' : 'Copiar tudo (planilha)'}
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={filtered.length === 0}
            className="rounded-full border-2 border-somma-black bg-somma-black/5 px-4 py-2 font-bebas text-xs tracking-widest text-somma-black transition-all hover:bg-somma-black hover:text-somma-cream disabled:opacity-40"
          >
            Baixar CSV
          </button>
        </div>
      </div>

      {pagoError && (
        <p role="alert" className="mb-4 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2.5 font-dm text-sm text-red-600">
          {pagoError}
        </p>
      )}

      {/* Cartões */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-4 border-dashed border-somma-black/20 bg-white/60 px-5 py-16 text-center font-dm text-somma-black/50">
          {leads.length === 0
            ? 'Nenhum cadastro na cortesia ainda.'
            : onlyPending
              ? 'Nenhum cadastro pendente. 🎉'
              : 'Nenhum resultado para a busca.'}
        </div>
      ) : (
        <ul className="grid gap-4">
          {filtered.map((l, i) => {
            const pago = isPago(l)
            const saving = savingIds.has(l.id)
            return (
              <li
                key={l.id}
                className={`rounded-2xl border-4 bg-white p-4 transition-all sm:p-5 ${
                  pago
                    ? 'border-green-600 shadow-[5px_5px_0_#16a34a]'
                    : 'border-somma-black shadow-[5px_5px_0_#0a0a0a]'
                }`}
              >
                <div className="mb-4 flex flex-col gap-3 border-b-2 border-somma-black/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-bebas text-lg text-somma-cream ${
                        pago ? 'bg-green-600' : 'bg-somma-orange'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-bebas text-2xl tracking-wide text-somma-black">{l.nome || '—'}</h2>
                      <p className="font-dm text-xs text-somma-black/45">
                        {pago && l.pago_em_fmt ? `Pago em ${l.pago_em_fmt}` : `Cadastrado em ${l.created_at_fmt}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <label
                      className={`flex cursor-pointer select-none items-center gap-2 rounded-full border-2 px-3.5 py-1.5 font-bebas text-[11px] tracking-widest transition-all ${
                        pago
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-somma-black/20 bg-white text-somma-black/60 hover:border-green-600 hover:text-green-700'
                      } ${saving ? 'opacity-60' : ''}`}
                      title="Marcar que o pagamento foi feito"
                    >
                      <input
                        type="checkbox"
                        checked={pago}
                        disabled={saving}
                        onChange={() => togglePago(l)}
                        className="h-4 w-4 accent-green-600"
                      />
                      {saving ? 'Salvando…' : pago ? 'Pago ✓' : 'Marcar pago'}
                    </label>
                    <button
                      type="button"
                      onClick={() => copy(rowToTsv(l), `${l.id}:tsv`)}
                      title="Copiar como linha de planilha (colunas separadas por Tab)"
                      className="rounded-full border-2 border-somma-blue bg-somma-blue/10 px-3.5 py-1.5 font-bebas text-[11px] tracking-widest text-somma-blue transition-all hover:bg-somma-blue hover:text-white"
                    >
                      {copied === `${l.id}:tsv` ? 'Copiado!' : 'Linha p/ planilha'}
                    </button>
                    <button
                      type="button"
                      onClick={() => copy(rowToBlock(l), `${l.id}:block`)}
                      title="Copiar todos os dados rotulados (Nome: …)"
                      className="rounded-full border-2 border-somma-black bg-somma-black/5 px-3.5 py-1.5 font-bebas text-[11px] tracking-widest text-somma-black transition-all hover:bg-somma-black hover:text-somma-cream"
                    >
                      {copied === `${l.id}:block` ? 'Copiado!' : 'Copiar tudo'}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {FIELDS.map((f) => {
                    const value = String(l[f.key] ?? '')
                    const key = `${l.id}:${f.key}`
                    const isCopied = copied === key
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => copy(value, key)}
                        title={`Clique para copiar: ${f.label}`}
                        className="group flex w-full items-center justify-between gap-3 rounded-xl border-2 border-somma-black/10 bg-somma-cream px-4 py-2.5 text-left transition-all hover:border-somma-blue hover:bg-somma-blue/5"
                      >
                        <span className="min-w-0">
                          <span className="block font-dm text-[10px] font-bold uppercase tracking-[0.2em] text-somma-black/45">
                            {f.label}
                          </span>
                          <span className="mt-0.5 block truncate font-dm text-sm font-semibold text-somma-black">
                            {value || '—'}
                          </span>
                        </span>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-bebas text-[11px] tracking-widest transition-colors ${
                            isCopied
                              ? 'bg-green-600 text-white'
                              : 'bg-somma-black/5 text-somma-black/50 group-hover:bg-somma-blue group-hover:text-white'
                          }`}
                        >
                          {isCopied ? 'Copiado!' : <CopyIcon />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
