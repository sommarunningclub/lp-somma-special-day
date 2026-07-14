# Admin Day Use — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar em `/admin/dayuse` uma área para validar pedidos de Day Use: ver todos os dados, buscar por nome/e-mail/CPF, validar entrega da pulseira, reenviar comprovante e editar o pedido.

**Architecture:** Página server-component protegida por `isAuthenticated()` que carrega os pedidos via service-role client e delega para um client component com busca, resumo e ações. Duas rotas API admin (`PATCH` para editar/toggle pulseira, `POST /resend` para reenviar e-mail via Asaas). Uma migration adiciona colunas de pulseira.

**Tech Stack:** Next.js App Router (server + client components), Supabase (service-role client), Asaas API, Resend (via helper existente), Tailwind (tokens somma-*).

## Global Constraints

- Todas as rotas API e páginas admin: `runtime = 'nodejs'`, `export const dynamic = 'force-dynamic'`.
- Gate de auth: `if (!(await isAuthenticated())) redirect('/login-admin')` em páginas; `if (!(await isAdmin()))` → 401 em rotas API (seguir padrão existente).
- Service-role client: `createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })`.
- Tabela: `public.dayuse_orders`. Status válidos: `Pendente`, `Pago`, `Cancelado`. Formas: `Cartão de Crédito`, `PIX`.
- Reenvio de e-mail e validação de pulseira: **apenas** pedidos com `status_pagamento = 'Pago'` (409 caso contrário).
- Validação de pulseira é reversível (toggle marca/desmarca gravando/limpando timestamp).
- CPF e telefone sempre normalizados sem máscara antes de gravar: `String(x).replace(/\D/g, '')`.
- Visual seguindo os admins existentes (bg somma-cream, fontes bebas/dm, link "← Admin").
- Não há framework de testes configurado neste projeto; a verificação de cada task é via `npx tsc --noEmit` e checagem manual descrita.

---

### Task 1: Migration — colunas de pulseira

**Files:**
- Create: `supabase/migrations/014_dayuse_pulseira.sql`

**Interfaces:**
- Produces: colunas `pulseira_entregue boolean NOT NULL DEFAULT false` e `pulseira_entregue_em timestamptz` na tabela `public.dayuse_orders`.

- [ ] **Step 1: Criar a migration**

```sql
-- Entrega da pulseira do Day Use (validação na entrada do evento).
ALTER TABLE public.dayuse_orders
  ADD COLUMN IF NOT EXISTS pulseira_entregue boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pulseira_entregue_em timestamptz;
```

- [ ] **Step 2: Aplicar a migration no Supabase**

Rodar o SQL acima no SQL editor do Supabase (ou via `supabase db push`, conforme o fluxo do projeto). Confirmar que as colunas existem:

```sql
select column_name from information_schema.columns
where table_name = 'dayuse_orders' and column_name like 'pulseira%';
```
Expected: retorna `pulseira_entregue` e `pulseira_entregue_em`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/014_dayuse_pulseira.sql
git commit -m "feat(admin-dayuse): migration com colunas de entrega da pulseira"
```

---

### Task 2: Tipo compartilhado do pedido Day Use

**Files:**
- Create: `lib/dayuse/types.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface DayUseOrder {
    id: string
    nome: string
    email: string
    cpf: string
    telefone: string
    valor: number
    forma_pagamento: 'Cartão de Crédito' | 'PIX'
    asaas_customer_id: string | null
    asaas_payment_id: string | null
    status_pagamento: 'Pendente' | 'Pago' | 'Cancelado'
    pulseira_entregue: boolean
    pulseira_entregue_em: string | null
    created_at: string
  }
  export const DAYUSE_STATUS: readonly ['Pendente', 'Pago', 'Cancelado']
  export const DAYUSE_FORMAS: readonly ['Cartão de Crédito', 'PIX']
  ```

- [ ] **Step 1: Criar o arquivo de tipos**

```ts
export interface DayUseOrder {
  id: string
  nome: string
  email: string
  cpf: string
  telefone: string
  valor: number
  forma_pagamento: 'Cartão de Crédito' | 'PIX'
  asaas_customer_id: string | null
  asaas_payment_id: string | null
  status_pagamento: 'Pendente' | 'Pago' | 'Cancelado'
  pulseira_entregue: boolean
  pulseira_entregue_em: string | null
  created_at: string
}

export const DAYUSE_STATUS = ['Pendente', 'Pago', 'Cancelado'] as const
export const DAYUSE_FORMAS = ['Cartão de Crédito', 'PIX'] as const
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos referentes a `lib/dayuse/types.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/dayuse/types.ts
git commit -m "feat(admin-dayuse): tipo compartilhado DayUseOrder"
```

---

### Task 3: Rota PATCH — editar pedido e toggle da pulseira

**Files:**
- Create: `app/api/admin/dayuse/[id]/route.ts`

**Interfaces:**
- Consumes: `DayUseOrder`, `DAYUSE_STATUS`, `DAYUSE_FORMAS` de `@/lib/dayuse/types`; `isAdmin` de `@/lib/insider`.
- Produces: `PATCH /api/admin/dayuse/:id` aceitando body parcial com quaisquer de `{ nome, email, cpf, telefone, forma_pagamento, valor, status_pagamento, pulseira_entregue }`. Retorna `{ ok: true, order: DayUseOrder }` ou `{ error }`.

- [ ] **Step 1: Criar a rota**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/insider'
import { DAYUSE_STATUS, DAYUSE_FORMAS } from '@/lib/dayuse/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const id = params.id
  const body = await request.json().catch(() => ({} as Record<string, unknown>))
  const update: Record<string, unknown> = {}

  if (typeof body.nome === 'string' && body.nome.trim()) update.nome = body.nome.trim()
  if (typeof body.email === 'string' && body.email.trim()) update.email = body.email.trim()
  if (typeof body.cpf === 'string') update.cpf = String(body.cpf).replace(/\D/g, '')
  if (typeof body.telefone === 'string') update.telefone = String(body.telefone).replace(/\D/g, '')

  if (typeof body.forma_pagamento === 'string') {
    if (!DAYUSE_FORMAS.includes(body.forma_pagamento as never))
      return NextResponse.json({ error: 'Forma de pagamento inválida' }, { status: 400 })
    update.forma_pagamento = body.forma_pagamento
  }

  if (body.valor !== undefined) {
    const valor = Number(body.valor)
    if (!Number.isFinite(valor) || valor < 0)
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    update.valor = valor
  }

  if (typeof body.status_pagamento === 'string') {
    if (!DAYUSE_STATUS.includes(body.status_pagamento as never))
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    update.status_pagamento = body.status_pagamento
  }

  // Toggle da pulseira só é permitido para pedidos Pagos.
  if (typeof body.pulseira_entregue === 'boolean') {
    if (body.pulseira_entregue) {
      const targetStatus =
        typeof update.status_pagamento === 'string' ? update.status_pagamento : null
      const { data: cur } = await supabase
        .from('dayuse_orders')
        .select('status_pagamento')
        .eq('id', id)
        .maybeSingle()
      const status = targetStatus ?? cur?.status_pagamento
      if (status !== 'Pago')
        return NextResponse.json(
          { error: 'Só é possível validar a pulseira de pedidos Pagos.' },
          { status: 409 },
        )
      update.pulseira_entregue = true
      update.pulseira_entregue_em = new Date().toISOString()
    } else {
      update.pulseira_entregue = false
      update.pulseira_entregue_em = null
    }
  }

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 })

  const { data, error } = await supabase
    .from('dayuse_orders')
    .update(update)
    .eq('id', id)
    .select('*')
  if (error) {
    console.error('[admin-dayuse] update error:', error)
    return NextResponse.json({ error: 'Falha ao atualizar o pedido' }, { status: 500 })
  }
  if (!data?.length) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

  return NextResponse.json({ ok: true, order: data[0] })
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos.

- [ ] **Step 3: Teste manual da rota (com o app rodando)**

Com um pedido existente Pago, rodar (autenticado como admin no browser, ou copiar cookie):
- PATCH `{ "nome": "Teste Edit" }` → `{ ok: true, order: { nome: "Teste Edit", ... } }`.
- PATCH `{ "pulseira_entregue": true }` num pedido Pendente → 409 com mensagem de pulseira.
- PATCH `{ "pulseira_entregue": true }` num pedido Pago → `pulseira_entregue: true` e `pulseira_entregue_em` preenchido.
- PATCH `{ "status_pagamento": "Foo" }` → 400.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/dayuse/[id]/route.ts
git commit -m "feat(admin-dayuse): rota PATCH para editar pedido e validar pulseira"
```

---

### Task 4: Rota POST /resend — reenviar comprovante

**Files:**
- Create: `app/api/admin/dayuse/[id]/resend/route.ts`

**Interfaces:**
- Consumes: `isAdmin`; `ASAAS_API_URL`, `asaasHeaders` de `@/lib/dayuse/asaas`; `sendDayUseConfirmation` de `@/lib/emails/send-dayuse`.
- Produces: `POST /api/admin/dayuse/:id/resend` → `{ ok: true, emailId }` ou `{ error }` (409 se não Pago).

- [ ] **Step 1: Criar a rota**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/insider'
import { ASAAS_API_URL, asaasHeaders } from '@/lib/dayuse/asaas'
import { sendDayUseConfirmation } from '@/lib/emails/send-dayuse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: order, error } = await supabase
    .from('dayuse_orders')
    .select('nome, email, valor, forma_pagamento, status_pagamento, asaas_payment_id')
    .eq('id', params.id)
    .maybeSingle()

  if (error || !order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  if (order.status_pagamento !== 'Pago')
    return NextResponse.json(
      { error: 'Só é possível reenviar o comprovante de pedidos Pagos.' },
      { status: 409 },
    )

  // Busca o comprovante no Asaas (não persistido no nosso banco).
  let receiptUrl: string | null = null
  let dataPagamento: string | null = null
  if (order.asaas_payment_id) {
    try {
      const res = await fetch(`${ASAAS_API_URL}/payments/${order.asaas_payment_id}`, {
        method: 'GET',
        headers: asaasHeaders(),
        cache: 'no-store',
      })
      const pay = await res.json()
      if (res.ok) {
        receiptUrl = pay.transactionReceiptUrl || pay.invoiceUrl || null
        dataPagamento = pay.paymentDate || pay.clientPaymentDate || pay.confirmedDate || null
      }
    } catch (e) {
      console.error('[admin-dayuse] asaas fetch error:', e)
    }
  }

  const emailId = await sendDayUseConfirmation({
    nome: order.nome,
    email: order.email,
    valor: Number(order.valor),
    forma: order.forma_pagamento,
    dataPagamento,
    transactionId: order.asaas_payment_id || params.id,
    receiptUrl,
  })

  if (!emailId)
    return NextResponse.json({ error: 'Falha ao enviar o e-mail. Tente novamente.' }, { status: 502 })

  return NextResponse.json({ ok: true, emailId })
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos.

- [ ] **Step 3: Teste manual**

- POST `/api/admin/dayuse/<id-pendente>/resend` → 409.
- POST `/api/admin/dayuse/<id-pago>/resend` → `{ ok: true, emailId }` e e-mail chega na caixa.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/dayuse/[id]/resend/route.ts
git commit -m "feat(admin-dayuse): rota para reenviar comprovante via Asaas"
```

---

### Task 5: Client component — dashboard com busca, resumo e ações

**Files:**
- Create: `components/admin/dayuse/DayUseAdminDashboard.tsx`

**Interfaces:**
- Consumes: `DayUseOrder`, `DAYUSE_STATUS`, `DAYUSE_FORMAS` de `@/lib/dayuse/types`.
- Produces: `export default function DayUseAdminDashboard({ orders }: { orders: DayUseOrder[] })`.

- [ ] **Step 1: Criar o componente**

Componente client (`'use client'`) com:
- `useState` para `orders` (inicializado com a prop), `query` (busca), pedido em edição (`editing: DayUseOrder | null`), e mapa de loading por ação (`busy: Record<string, string | null>`).
- Filtro: normaliza `query` e compara contra `nome` (lower), `email` (lower) e `cpf` (só dígitos da query vs `cpf`).
- Cards de resumo: total, pagos (`status_pagamento === 'Pago'`), pulseiras entregues (`pulseira_entregue`).
- Helper `patch(id, payload)` → `fetch('/api/admin/dayuse/' + id, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })`; em sucesso, atualiza a linha no estado com `res.order`; em erro, `alert(res.error)`.
- Helper `resend(id)` → `POST /api/admin/dayuse/:id/resend`; `alert` de sucesso/erro.
- Por linha: dados completos, badge de status, botões **Validar pulseira** (chama `patch(id, { pulseira_entregue: !o.pulseira_entregue })`, desabilitado se `status_pagamento !== 'Pago'`), **Reenviar e-mail** (desabilitado se ≠ Pago), **Editar** (abre modal).
- Modal de edição (renderizado quando `editing`): inputs controlados para `nome, email, cpf, telefone`, selects para `forma_pagamento` (de `DAYUSE_FORMAS`) e `status_pagamento` (de `DAYUSE_STATUS`), input numérico para `valor`. Botão salvar → `patch(editing.id, {...campos})` e fecha modal em sucesso.

```tsx
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
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos.

- [ ] **Step 3: Commit**

```bash
git add components/admin/dayuse/DayUseAdminDashboard.tsx
git commit -m "feat(admin-dayuse): dashboard client com busca, validação e edição"
```

---

### Task 6: Página `/admin/dayuse`

**Files:**
- Create: `app/admin/dayuse/page.tsx`

**Interfaces:**
- Consumes: `isAuthenticated` de `@/lib/auth`; `DayUseOrder` de `@/lib/dayuse/types`; `DayUseAdminDashboard`.

- [ ] **Step 1: Criar a página**

```tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { isAuthenticated } from '@/lib/auth'
import type { DayUseOrder } from '@/lib/dayuse/types'
import DayUseAdminDashboard from '@/components/admin/dayuse/DayUseAdminDashboard'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function AdminDayUsePage() {
  if (!(await isAuthenticated())) redirect('/login-admin')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
  const { data } = await supabase
    .from('dayuse_orders')
    .select('*')
    .order('created_at', { ascending: false })

  const orders = (data ?? []) as DayUseOrder[]

  return (
    <main className="min-h-screen bg-somma-cream px-4 py-8 font-dm text-somma-black md:px-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-dm text-xs font-bold uppercase tracking-[0.3em] text-somma-orange">Admin</p>
            <h1 className="font-bebas text-4xl uppercase tracking-wide text-somma-black sm:text-5xl">Day Use</h1>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border-2 border-somma-black bg-white px-4 py-2 font-dm text-sm font-bold text-somma-black"
          >
            ← Admin
          </Link>
        </div>
        <DayUseAdminDashboard orders={orders} />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos.

- [ ] **Step 3: Teste manual**

Abrir `/admin/dayuse` autenticado → lista de pedidos, busca, cards de resumo. Sem sessão → redireciona para `/login-admin`.

- [ ] **Step 4: Commit**

```bash
git add app/admin/dayuse/page.tsx
git commit -m "feat(admin-dayuse): página /admin/dayuse"
```

---

### Task 7: Link de acesso no `/admin`

**Files:**
- Modify: `app/admin/page.tsx` (bloco de botões do header, junto a "Lista VIP")

**Interfaces:**
- Consumes: nenhum novo.

- [ ] **Step 1: Adicionar o link "Day Use"**

No bloco `<div className="flex flex-col gap-3 sm:flex-row sm:items-center">`, logo após o `<Link href="/admin/leads" ...>Lista VIP</Link>`, adicionar:

```tsx
<Link
  href="/admin/dayuse"
  className="w-full rounded-full border-4 border-somma-orange bg-somma-orange/20 px-5 py-3 text-center font-bebas tracking-widest text-somma-orange transition-all hover:bg-somma-orange hover:text-somma-cream sm:w-auto"
>
  Day Use
</Link>
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos.

- [ ] **Step 3: Teste manual**

`/admin` mostra o botão "Day Use" que leva a `/admin/dayuse`.

- [ ] **Step 4: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat(admin-dayuse): link de acesso ao Day Use no /admin"
```

---

## Self-Review

- **Spec coverage:** ver todos os dados (Task 5/6) ✓; busca nome/e-mail/CPF (Task 5) ✓; validar pulseira reversível só Pago (Task 1 colunas, Task 3 toggle, Task 5 botão) ✓; reenviar comprovante só Pago (Task 4) ✓; editar todos os campos (Task 3 PATCH, Task 5 modal) ✓; acesso via /admin (Task 7) ✓.
- **Placeholders:** nenhum — todo código está completo.
- **Type consistency:** `DayUseOrder`, `DAYUSE_STATUS`, `DAYUSE_FORMAS` definidos em Task 2 e usados consistentemente; rota PATCH retorna `{ order }` consumido em `patch()` da Task 5; `pulseira_entregue`/`pulseira_entregue_em` consistentes entre migration, rota e componente.
