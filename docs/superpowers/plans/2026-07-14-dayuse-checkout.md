# Página /dayuse — Ingresso Day Use com checkout Asaas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar a página `/dayuse` do Special Day que vende o ingresso Day Use (R$ 75) via cartão de crédito à vista ou PIX pelo Asaas, com os pedidos persistidos no Supabase.

**Architecture:** Página única Server Component (`app/dayuse/page.tsx`) com seções informativas no visual neo-brutalista do Special Day + um Client Component de checkout. O checkout chama rotas API novas em `app/api/dayuse/*` que portam o fluxo Asaas do projeto `NOVO-SITE-SOMMA-V3` (criar customer → criar cobrança em `/payments` → PIX QR → polling de status) e gravam cada pedido na tabela `dayuse_orders`.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS v3, GSAP (ScrollTrigger), Supabase (service-role), Asaas API v3.

## Global Constraints

- **Preço do ingresso:** R$ 75,00 (variável única `DAYUSE_PRICE = 75`). À vista, 1x. Sem parcelamento, sem cupom.
- **Formas de pagamento:** apenas Cartão de Crédito e PIX.
- **Visual:** neo-brutalista Special Day — fonte `font-bebas`/`font-dm`, paleta `somma-black #0a0a0a` / `somma-blue #005EFF` / `somma-orange #FF4800` / `somma-yellow #FDB716` / `somma-pink #FD6FDB` / `somma-cream #F9F0DC`, blocos com borda `border-4 border-somma-black` e sombra `shadow-[4px_4px_0_#0a0a0a]` (ou `6px` em telas maiores).
- **NÃO usar `lucide-react`** (não está instalado). Use emoji ou SVG inline, como as demais seções do Special Day.
- **Asaas:** `ASAAS_API_URL = "https://api.asaas.com/v3"`, autenticação via header `access_token: process.env.ASAAS_API_KEY`. Essa env **não existe** neste projeto ainda — precisa ser adicionada no `.env.local` e na Vercel antes do deploy.
- **Supabase server:** usar service-role (`SUPABASE_SERVICE_ROLE_KEY`), padrão de `app/api/checkin/route.ts`.
- **Sem framework de testes** no projeto: o gate de cada tarefa é `npx tsc --noEmit` (typecheck) + verificação manual descrita. Não adicionar test runner.
- **Regras que a página comunica:** ❌ não dá direito ao kit · ❌ não dá direito ao corre (a corrida) · ✅ acesso a todo o after · programação · show Resenha do Sabino · Gincana Somma · sorteios (exceto sorteio do Adidas Evo SL, exclusivo de quem comprou o kit).
- **Evento:** sábado 18/07/2026, 07h.

## File Structure

**Criar:**
- `supabase/migrations/013_dayuse_orders.sql` — tabela `dayuse_orders`.
- `lib/dayuse/asaas.ts` — constantes/helpers Asaas compartilhados.
- `app/api/dayuse/customer/route.ts` — cria customer no Asaas.
- `app/api/dayuse/payment/route.ts` — cria cobrança + grava pedido.
- `app/api/dayuse/pix/route.ts` — busca QR Code PIX.
- `app/api/dayuse/payment-status/route.ts` — status + atualiza pedido para Pago.
- `components/special-day/dayuse/DayUseHero.tsx`
- `components/special-day/dayuse/DayUseInclui.tsx`
- `components/special-day/dayuse/DayUsePrograma.tsx`
- `components/special-day/dayuse/DayUseShow.tsx`
- `components/special-day/dayuse/DayUseGincana.tsx`
- `components/special-day/dayuse/DayUseSorteios.tsx`
- `components/special-day/dayuse/DayUseCheckout.tsx` — client, formulário/estados.
- `app/dayuse/page.tsx` — monta a página.

**Modificar:**
- `tailwind.config.ts` — popular `content` (hoje vazio).

---

### Task 1: Tailwind content glob (habilita utilities nos arquivos novos)

O `content` de `tailwind.config.ts` está vazio; o CSS compilado não gera as utilities `somma-*`. Popular os globs é aditivo e garante que os componentes novos (e existentes) sejam escaneados.

**Files:**
- Modify: `tailwind.config.ts:4-5`

**Interfaces:**
- Consumes: nada.
- Produces: nada (config de build).

- [ ] **Step 1: Popular o array `content`**

Trocar:

```ts
  content: [
  ],
```

por:

```ts
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
```

- [ ] **Step 2: Verificar que o build gera as utilities**

Run: `npm run build`
Expected: build conclui sem erro. Depois:
Run: `grep -rl "somma-cream" .next/static/css/*.css`
Expected: pelo menos um arquivo CSS listado (antes não continha `somma-cream`).

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "fix(tailwind): popula content glob para escanear app/ e components/"
```

---

### Task 2: Migração da tabela `dayuse_orders`

**Files:**
- Create: `supabase/migrations/013_dayuse_orders.sql`

**Interfaces:**
- Produces: tabela `public.dayuse_orders` com colunas `id, nome, email, cpf, telefone, valor, forma_pagamento, asaas_customer_id, asaas_payment_id, status_pagamento, created_at`. `status_pagamento ∈ {Pendente, Pago, Cancelado}`, `forma_pagamento ∈ {Cartão de Crédito, PIX}`.

- [ ] **Step 1: Criar a migração**

```sql
-- Pedidos do ingresso Day Use do Special Day (checkout Asaas).
CREATE TABLE IF NOT EXISTS public.dayuse_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  cpf text NOT NULL,
  telefone text NOT NULL,
  valor numeric(10,2) NOT NULL DEFAULT 75.00,
  forma_pagamento text NOT NULL CHECK (forma_pagamento IN ('Cartão de Crédito', 'PIX')),
  asaas_customer_id text,
  asaas_payment_id text,
  status_pagamento text NOT NULL DEFAULT 'Pendente'
    CHECK (status_pagamento IN ('Pendente', 'Pago', 'Cancelado')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dayuse_orders_payment_id ON public.dayuse_orders (asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_dayuse_orders_status ON public.dayuse_orders (status_pagamento);

ALTER TABLE public.dayuse_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.dayuse_orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

- [ ] **Step 2: Aplicar no Supabase**

Rodar o SQL acima no SQL Editor do projeto Supabase (mesmo projeto do `.env.local`). Verificar que a tabela `dayuse_orders` aparece em Table Editor com RLS habilitado.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/013_dayuse_orders.sql
git commit -m "feat(dayuse): migração da tabela dayuse_orders"
```

---

### Task 3: Helper Asaas compartilhado

**Files:**
- Create: `lib/dayuse/asaas.ts`

**Interfaces:**
- Produces:
  - `ASAAS_API_URL: string`
  - `DAYUSE_PRICE: number` (= 75)
  - `asaasHeaders(): { 'Content-Type': string; access_token: string }`
  - `asaasError(data: any): string`

- [ ] **Step 1: Criar o helper**

```ts
export const ASAAS_API_URL = 'https://api.asaas.com/v3'

// Preço único do ingresso Day Use. À vista, sem parcelamento.
export const DAYUSE_PRICE = 75

export function asaasHeaders() {
  return {
    'Content-Type': 'application/json',
    access_token: process.env.ASAAS_API_KEY || '',
  }
}

// Traduz os erros mais comuns do Asaas para mensagens amigáveis ao comprador.
export function asaasError(data: any): string {
  const code = data?.errors?.[0]?.code
  if (code === 'invalid_creditCard' || code === 'invalid_creditCardNumber')
    return 'Pagamento não autorizado, verifique seu cartão.'
  if (code === 'invalid_creditCardHolderInfo')
    return 'Dados do titular do cartão inválidos.'
  if (code === 'invalid_value') return 'Valor inválido para o pagamento.'
  return data?.errors?.[0]?.description || 'Erro ao processar pagamento'
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add lib/dayuse/asaas.ts
git commit -m "feat(dayuse): helper Asaas compartilhado (url, headers, preço, erros)"
```

---

### Task 4: Rota `POST /api/dayuse/customer`

**Files:**
- Create: `app/api/dayuse/customer/route.ts`

**Interfaces:**
- Consumes: `ASAAS_API_URL`, `asaasHeaders` de `@/lib/dayuse/asaas`.
- Produces: `POST` recebe `{ name, email, cpfCnpj, phone }` → responde `{ id: string }` (id do customer Asaas) ou `{ error }`.

- [ ] **Step 1: Criar a rota**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { ASAAS_API_URL, asaasHeaders } from '@/lib/dayuse/asaas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { name, email, cpfCnpj, phone } = await request.json()
    if (!name || !email || !cpfCnpj) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    const res = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: asaasHeaders(),
      body: JSON.stringify({
        name,
        email,
        cpfCnpj: String(cpfCnpj).replace(/\D/g, ''),
        phone: phone ? String(phone).replace(/\D/g, '') : undefined,
        notificationDisabled: false,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      console.error('[DayUse][Asaas] customer error:', data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || 'Erro ao criar cliente' },
        { status: res.status },
      )
    }

    return NextResponse.json({ id: data.id })
  } catch (e) {
    console.error('[DayUse][Asaas] customer exception:', e)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add app/api/dayuse/customer/route.ts
git commit -m "feat(dayuse): rota que cria customer no Asaas"
```

---

### Task 5: Rota `POST /api/dayuse/payment` (cobrança + persistência)

**Files:**
- Create: `app/api/dayuse/payment/route.ts`

**Interfaces:**
- Consumes: `ASAAS_API_URL`, `asaasHeaders`, `asaasError`, `DAYUSE_PRICE` de `@/lib/dayuse/asaas`.
- Produces: `POST` recebe
  `{ customerId: string, method: 'card' | 'pix', customer: { name, email, cpfCnpj, phone, postalCode, addressNumber }, card?: { holderName, number, expiryMonth, expiryYear, ccv } }`
  → responde `{ paymentId: string, status: string, paid: boolean }` ou `{ error }`. Insere/atualiza linha em `dayuse_orders`.

- [ ] **Step 1: Criar a rota**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ASAAS_API_URL, asaasHeaders, asaasError, DAYUSE_PRICE } from '@/lib/dayuse/asaas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || '0.0.0.0'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, method, customer, card } = body as {
      customerId?: string
      method?: 'card' | 'pix'
      customer?: {
        name: string; email: string; cpfCnpj: string; phone?: string
        postalCode?: string; addressNumber?: string
      }
      card?: { holderName: string; number: string; expiryMonth: string; expiryYear: string; ccv: string }
    }

    if (!customerId || !method || !customer) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    const forma = method === 'pix' ? 'PIX' : 'Cartão de Crédito'
    const today = new Date().toISOString().split('T')[0]

    // Grava o pedido como Pendente antes de cobrar (rastreabilidade mesmo se a cobrança falhar).
    const { data: order } = await supabase
      .from('dayuse_orders')
      .insert({
        nome: customer.name,
        email: customer.email,
        cpf: String(customer.cpfCnpj).replace(/\D/g, ''),
        telefone: String(customer.phone || '').replace(/\D/g, ''),
        valor: DAYUSE_PRICE,
        forma_pagamento: forma,
        asaas_customer_id: customerId,
        status_pagamento: 'Pendente',
      })
      .select('id')
      .single()

    const orderId = order?.id as string | undefined

    let payload: Record<string, unknown>
    if (method === 'pix') {
      payload = {
        customer: customerId,
        billingType: 'PIX',
        value: DAYUSE_PRICE,
        dueDate: today,
        description: 'Special Day - Ingresso Day Use',
      }
    } else {
      if (!card) {
        return NextResponse.json({ error: 'Dados do cartão faltando' }, { status: 400 })
      }
      payload = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: DAYUSE_PRICE,
        dueDate: today,
        description: 'Special Day - Ingresso Day Use',
        creditCard: {
          holderName: card.holderName,
          number: String(card.number).replace(/\s/g, ''),
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          ccv: card.ccv,
        },
        creditCardHolderInfo: {
          name: customer.name,
          email: customer.email,
          cpfCnpj: String(customer.cpfCnpj).replace(/\D/g, ''),
          postalCode: String(customer.postalCode || '').replace(/\D/g, ''),
          addressNumber: customer.addressNumber,
          phone: String(customer.phone || '').replace(/\D/g, ''),
        },
        remoteIp: clientIp(request),
      }
    }

    const res = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: asaasHeaders(),
      body: JSON.stringify(payload),
    })
    const data = await res.json()

    if (!res.ok) {
      console.error('[DayUse][Asaas] payment error:', data)
      return NextResponse.json({ error: asaasError(data) }, { status: res.status })
    }

    const paid = data.status === 'CONFIRMED' || data.status === 'RECEIVED'
    if (orderId) {
      await supabase
        .from('dayuse_orders')
        .update({ asaas_payment_id: data.id, status_pagamento: paid ? 'Pago' : 'Pendente' })
        .eq('id', orderId)
    }

    return NextResponse.json({ paymentId: data.id, status: data.status, paid })
  } catch (e) {
    console.error('[DayUse][Asaas] payment exception:', e)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add app/api/dayuse/payment/route.ts
git commit -m "feat(dayuse): rota de cobrança Asaas (cartão/PIX) com persistência do pedido"
```

---

### Task 6: Rotas `GET /api/dayuse/pix` e `GET /api/dayuse/payment-status`

Duas rotas GET pequenas, testadas juntas. A de status também confirma o pedido no banco.

**Files:**
- Create: `app/api/dayuse/pix/route.ts`
- Create: `app/api/dayuse/payment-status/route.ts`

**Interfaces:**
- Consumes: `ASAAS_API_URL`, `asaasHeaders` de `@/lib/dayuse/asaas`.
- Produces:
  - `GET /api/dayuse/pix?paymentId=` → `{ encodedImage, payload, expirationDate }` (repassa o corpo do Asaas) ou `{ error }`.
  - `GET /api/dayuse/payment-status?paymentId=` → `{ id, status, paid: boolean }` e, se `paid`, marca `dayuse_orders.status_pagamento = 'Pago'`.

- [ ] **Step 1: Criar `pix/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { ASAAS_API_URL, asaasHeaders } from '@/lib/dayuse/asaas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const paymentId = new URL(request.url).searchParams.get('paymentId')
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID é obrigatório' }, { status: 400 })
    }

    const res = await fetch(`${ASAAS_API_URL}/payments/${paymentId}/pixQrCode`, {
      method: 'GET',
      headers: asaasHeaders(),
    })
    const data = await res.json()

    if (!res.ok) {
      console.error('[DayUse][Asaas] pix error:', data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || 'Erro ao gerar QR Code' },
        { status: res.status },
      )
    }

    return NextResponse.json(data)
  } catch (e) {
    console.error('[DayUse][Asaas] pix exception:', e)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Criar `payment-status/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ASAAS_API_URL, asaasHeaders } from '@/lib/dayuse/asaas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

export async function GET(request: NextRequest) {
  try {
    const paymentId = new URL(request.url).searchParams.get('paymentId')
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID é obrigatório' }, { status: 400 })
    }

    const res = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: asaasHeaders(),
    })
    const data = await res.json()

    if (!res.ok) {
      console.error('[DayUse][Asaas] status error:', data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || 'Erro ao buscar status' },
        { status: res.status },
      )
    }

    const paid = data.status === 'RECEIVED' || data.status === 'CONFIRMED'
    if (paid) {
      await supabase
        .from('dayuse_orders')
        .update({ status_pagamento: 'Pago' })
        .eq('asaas_payment_id', paymentId)
    }

    return NextResponse.json({ id: data.id, status: data.status, paid })
  } catch (e) {
    console.error('[DayUse][Asaas] status exception:', e)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add app/api/dayuse/pix/route.ts app/api/dayuse/payment-status/route.ts
git commit -m "feat(dayuse): rotas de QR PIX e polling de status (confirma pedido)"
```

---

### Task 7: Seções informativas (Hero, Inclui, Programa, Show, Gincana, Sorteios)

Seis componentes presentacionais no visual Special Day. Sem lógica de rede — agrupados numa tarefa porque um revisor os avalia juntos.

**Files:**
- Create: `components/special-day/dayuse/DayUseHero.tsx`
- Create: `components/special-day/dayuse/DayUseInclui.tsx`
- Create: `components/special-day/dayuse/DayUsePrograma.tsx`
- Create: `components/special-day/dayuse/DayUseShow.tsx`
- Create: `components/special-day/dayuse/DayUseGincana.tsx`
- Create: `components/special-day/dayuse/DayUseSorteios.tsx`

**Interfaces:**
- Produces: cada arquivo exporta `default` um componente sem props. `DayUseHero` inclui um link âncora `href="#dayuse-checkout"`.

- [ ] **Step 1: `DayUseHero.tsx`**

```tsx
export default function DayUseHero() {
  return (
    <section className="relative overflow-hidden bg-somma-orange px-4 py-20 text-center sm:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-cream sm:text-sm">
          Special Day · 18 de julho · 2026
        </p>
        <h1 className="font-bebas text-6xl leading-[0.95] tracking-tight text-somma-cream sm:text-8xl md:text-9xl">
          Ingresso <span className="block text-somma-yellow">Day Use</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-dm text-base leading-relaxed text-somma-cream/90 sm:text-lg">
          Não vai correr, mas quer viver o after completo? Esse ingresso é seu.
          Um dia inteiro de samba, DJ, gincana, sorteios e a melhor comunidade de Brasília.
        </p>

        <div className="mt-8 inline-block rounded-2xl border-4 border-somma-black bg-somma-cream px-8 py-5 shadow-[6px_6px_0_#0a0a0a]">
          <p className="font-dm text-xs uppercase tracking-widest text-somma-black/60">Ingresso Day Use</p>
          <p className="font-bebas text-5xl leading-none tracking-tight text-somma-black sm:text-6xl">R$ 75</p>
        </div>

        <div className="mt-8">
          <a
            href="#dayuse-checkout"
            className="inline-block rounded-xl border-4 border-somma-black bg-somma-blue px-10 py-4 font-bebas text-2xl tracking-wide text-somma-cream shadow-[6px_6px_0_#0a0a0a] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_#0a0a0a]"
          >
            Garantir meu Day Use
          </a>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: `DayUseInclui.tsx`**

```tsx
const NAO_INCLUI = [
  { titulo: 'Não dá direito ao kit', desc: 'Camiseta, gym bag e brindes são exclusivos de quem comprou o kit do evento.' },
  { titulo: 'Não dá direito ao corre', desc: 'A corrida (4 km e 8 km) não está inclusa no Day Use.' },
]

const INCLUI = [
  { titulo: 'Acesso a todo o after', desc: 'Você entra e curte tudo: samba ao vivo, DJ, gincana, sorteios, bar e ativações dos parceiros.' },
]

export default function DayUseInclui() {
  return (
    <section className="bg-somma-cream px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-10 text-center font-bebas text-4xl tracking-tight text-somma-black sm:text-6xl">
          O que o Day Use <span className="text-somma-orange">é</span> e o que <span className="text-somma-blue">não é</span>
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border-4 border-somma-black bg-white p-6 shadow-[6px_6px_0_#0a0a0a]">
            <p className="mb-4 font-bebas text-2xl tracking-wide text-somma-black">O que NÃO inclui</p>
            <ul className="space-y-4">
              {NAO_INCLUI.map((item) => (
                <li key={item.titulo} className="flex items-start gap-3">
                  <span className="text-2xl leading-none">❌</span>
                  <div>
                    <p className="font-bebas text-xl tracking-wide text-somma-black">{item.titulo}</p>
                    <p className="font-dm text-sm leading-snug text-somma-black/65">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border-4 border-somma-black bg-somma-yellow p-6 shadow-[6px_6px_0_#0a0a0a]">
            <p className="mb-4 font-bebas text-2xl tracking-wide text-somma-black">O que INCLUI</p>
            <ul className="space-y-4">
              {INCLUI.map((item) => (
                <li key={item.titulo} className="flex items-start gap-3">
                  <span className="text-2xl leading-none">✅</span>
                  <div>
                    <p className="font-bebas text-xl tracking-wide text-somma-black">{item.titulo}</p>
                    <p className="font-dm text-sm leading-snug text-somma-black/70">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: `DayUsePrograma.tsx`** (programação do after; marca o corre como não incluso)

```tsx
const PROGRAMACAO = [
  { hora: '07h às 08h', titulo: 'Treinão Corre Somma', desc: 'A corrida de 4 km e 8 km pela orla.', emoji: '🏃', cor: '#005EFF', incluso: false },
  { hora: '08h às 09h', titulo: 'Fit Dance + café da manhã', desc: 'Aula pra soltar o corpo e café da manhã Big Box.', emoji: '🥐', cor: '#FDB716', incluso: true },
  { hora: '09h às 12h', titulo: 'Roda de samba & ativações', desc: 'Samba ao vivo, parceiros ativando, bar abrindo e Day Use solto.', emoji: '🥁', cor: '#FD6FDB', incluso: true },
  { hora: '11h às 13h30', titulo: 'Gincana Somma', desc: 'Competições insanas com a galera e brindes de monte.', emoji: '🎯', cor: '#FF4800', incluso: true },
  { hora: '13h30 às 15h', titulo: 'DJ & encerramento social', desc: 'A festa continua. A gente fecha o dia juntos.', emoji: '🎧', cor: '#005EFF', incluso: true },
]

export default function DayUsePrograma() {
  return (
    <section className="bg-somma-blue px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-center font-dm text-xs uppercase tracking-[0.3em] text-somma-yellow sm:text-sm">
          Do café ao pôr do sol
        </p>
        <h2 className="mb-10 text-center font-bebas text-4xl tracking-tight text-somma-cream sm:text-6xl">
          A programação do dia
        </h2>

        <div className="flex flex-col gap-3 sm:gap-4">
          {PROGRAMACAO.map((item) => (
            <div
              key={item.hora}
              className={`flex flex-col gap-3 rounded-2xl border-4 border-somma-black bg-white p-4 shadow-[4px_4px_0_#0a0a0a] sm:flex-row sm:items-center sm:gap-5 sm:p-5 ${item.incluso ? '' : 'opacity-70'}`}
            >
              <div
                className="flex shrink-0 items-center justify-center rounded-xl border-2 border-somma-black px-4 py-2 sm:w-44"
                style={{ backgroundColor: item.cor }}
              >
                <span className="font-bebas text-xl tracking-wide text-somma-cream sm:text-2xl">{item.hora}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none sm:text-3xl">{item.emoji}</span>
                <div>
                  <h3 className="font-bebas text-xl tracking-wide text-somma-black sm:text-2xl">
                    {item.titulo}
                    {!item.incluso && (
                      <span className="ml-2 rounded-md border-2 border-somma-black bg-somma-orange px-2 py-0.5 align-middle font-dm text-[10px] uppercase tracking-wider text-somma-cream">
                        Não incluso no Day Use
                      </span>
                    )}
                  </h3>
                  <p className="font-dm text-sm leading-snug text-somma-black/65">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: `DayUseShow.tsx`**

```tsx
export default function DayUseShow() {
  return (
    <section className="relative overflow-hidden bg-somma-pink px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-black/70 sm:text-sm">
          Show ao vivo
        </p>
        <h2 className="font-bebas text-5xl leading-[0.95] tracking-tight text-somma-black sm:text-7xl md:text-8xl">
          Resenha do Sabino
        </h2>
        <p className="mx-auto mt-6 max-w-xl font-dm text-base leading-relaxed text-somma-black/80 sm:text-lg">
          O melhor do samba e do pagode direto no nosso after. A Resenha do Sabino
          sobe no palco pra deixar o Special Day ainda mais inesquecível — e o seu
          Day Use garante lugar na roda.
        </p>
        <div className="mt-8 inline-block rounded-xl border-4 border-somma-black bg-somma-yellow px-6 py-3 font-bebas text-2xl tracking-wide text-somma-black shadow-[5px_5px_0_#0a0a0a]">
          🎤 Samba ao vivo incluso no Day Use
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: `DayUseGincana.tsx`**

```tsx
export default function DayUseGincana() {
  return (
    <section className="bg-somma-cream px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
          Zero seriedade
        </p>
        <h2 className="font-bebas text-4xl tracking-tight text-somma-black sm:text-6xl">
          Gincana Somma
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-dm text-base leading-relaxed text-somma-black/70 sm:text-lg">
          Competições insanas em equipe, muita zoeira e brindes pra galera. Com o
          Day Use você entra na disputa e vive a parte mais caótica (e divertida)
          do dia.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {['🎯 Provas em equipe', '🏆 Premiação', '😂 Muita zoeira'].map((tag) => (
            <span
              key={tag}
              className="rounded-xl border-4 border-somma-black bg-white px-5 py-2 font-bebas text-xl tracking-wide text-somma-black shadow-[4px_4px_0_#0a0a0a]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: `DayUseSorteios.tsx`** (com aviso do Adidas Evo SL)

```tsx
const SORTEIOS = [
  { emoji: '🎁', titulo: 'Brindes dos parceiros', desc: 'Kits e produtos das marcas presentes no evento.' },
  { emoji: '👟', titulo: 'Vouchers e experiências', desc: 'Prêmios sorteados ao longo do dia entre a galera presente.' },
  { emoji: '🍺', titulo: 'Combos do bar Somma', desc: 'Porque o after também é sobre celebrar junto.' },
]

export default function DayUseSorteios() {
  return (
    <section className="bg-somma-black px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-center font-dm text-xs uppercase tracking-[0.3em] text-somma-yellow sm:text-sm">
          Vai que é sua
        </p>
        <h2 className="mb-10 text-center font-bebas text-4xl tracking-tight text-somma-cream sm:text-6xl">
          Sorteios o dia inteiro
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {SORTEIOS.map((s) => (
            <div key={s.titulo} className="rounded-2xl border-4 border-somma-cream/20 bg-white/[0.04] p-6 text-center">
              <div className="mb-3 text-4xl">{s.emoji}</div>
              <p className="font-bebas text-2xl tracking-wide text-somma-cream">{s.titulo}</p>
              <p className="mt-2 font-dm text-sm leading-relaxed text-somma-cream/60">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border-4 border-somma-orange bg-somma-orange/10 p-5 text-center">
          <p className="font-dm text-sm leading-relaxed text-somma-cream/90">
            ⚠️ <strong className="text-somma-yellow">Atenção:</strong> o sorteio do
            <strong> Adidas Evo SL</strong> é exclusivo de quem comprou o <strong>kit do evento</strong>.
            O Day Use concorre a todos os outros sorteios, mas não a esse.
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 8: Commit**

```bash
git add components/special-day/dayuse/DayUseHero.tsx components/special-day/dayuse/DayUseInclui.tsx components/special-day/dayuse/DayUsePrograma.tsx components/special-day/dayuse/DayUseShow.tsx components/special-day/dayuse/DayUseGincana.tsx components/special-day/dayuse/DayUseSorteios.tsx
git commit -m "feat(dayuse): seções informativas (hero, regras, programação, show, gincana, sorteios)"
```

---

### Task 8: `DayUseCheckout.tsx` (formulário + estados de pagamento)

Client Component com a máquina de estados `form → processing → success | error | pix`, portando a lógica do `checkout-form.tsx` do V3 para um único produto à vista, no visual Special Day.

**Files:**
- Create: `components/special-day/dayuse/DayUseCheckout.tsx`

**Interfaces:**
- Consumes as rotas: `POST /api/dayuse/customer`, `POST /api/dayuse/payment`, `GET /api/dayuse/pix`, `GET /api/dayuse/payment-status` (contratos definidos nas Tasks 4–6). Autopreenche endereço via `https://brasilapi.com.br/api/cep/v2/{cep}`.
- Produces: `export default function DayUseCheckout()`. O elemento raiz tem `id="dayuse-checkout"` (alvo da âncora do Hero).

- [ ] **Step 1: Criar o componente**

```tsx
'use client'

import { useState, useEffect } from 'react'

function formatCPF(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
function formatPhone(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}
function formatCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2')
}
function formatCard(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

type PageState = 'form' | 'processing' | 'success' | 'error' | 'pix'

const inputClass =
  'w-full rounded-xl border-4 border-somma-black bg-white px-4 py-3 font-dm text-base text-somma-black placeholder-somma-black/40 focus:outline-none focus:shadow-[4px_4px_0_#0a0a0a] transition-all'

export default function DayUseCheckout() {
  const [pageState, setPageState] = useState<PageState>('form')
  const [error, setError] = useState<string | null>(null)
  const [method, setMethod] = useState<'card' | 'pix'>('card')
  const [isCepLoading, setIsCepLoading] = useState(false)

  const [customer, setCustomer] = useState({
    name: '', email: '', cpfCnpj: '', phone: '', postalCode: '', addressNumber: '',
    street: '', neighborhood: '', city: '', state: '',
  })
  const [card, setCard] = useState({ holderName: '', number: '', expiryMonth: '', expiryYear: '', ccv: '' })

  // PIX
  const [pixQrCode, setPixQrCode] = useState<string | null>(null)
  const [pixPayload, setPixPayload] = useState<string | null>(null)
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null)
  const [pixCopied, setPixCopied] = useState(false)

  // CEP autopreenche endereço (necessário pro creditCardHolderInfo do Asaas).
  const handleCep = async (value: string) => {
    const formatted = formatCEP(value)
    setCustomer((p) => ({ ...p, postalCode: formatted }))
    const clean = value.replace(/\D/g, '')
    if (clean.length !== 8) return
    setIsCepLoading(true)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`)
      if (!res.ok) throw new Error()
      const d = await res.json()
      setCustomer((p) => ({ ...p, street: d.street || '', neighborhood: d.neighborhood || '', city: d.city || '', state: d.state || '' }))
    } catch {
      /* CEP não encontrado — usuário segue manualmente pelo número */
    } finally {
      setIsCepLoading(false)
    }
  }

  // Polling do PIX (a cada 3s, teto ~20min).
  useEffect(() => {
    if (pageState !== 'pix' || !pixPaymentId) return
    let attempts = 0
    const MAX = 400
    const id = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/dayuse/payment-status?paymentId=${pixPaymentId}`)
        const d = await res.json()
        if (res.ok && d.paid) {
          clearInterval(id)
          setPageState('success')
        }
      } catch {
        /* rede instável — próxima tentativa cobre */
      }
      if (attempts >= MAX) clearInterval(id)
    }, 3000)
    return () => clearInterval(id)
  }, [pageState, pixPaymentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPageState('processing')
    try {
      const custRes = await fetch('/api/dayuse/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customer.name, email: customer.email, cpfCnpj: customer.cpfCnpj, phone: customer.phone }),
      })
      const cust = await custRes.json()
      if (!custRes.ok) throw new Error(cust.error || 'Erro ao salvar seus dados')

      const payRes = await fetch('/api/dayuse/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: cust.id,
          method,
          customer,
          card: method === 'card' ? card : undefined,
        }),
      })
      const pay = await payRes.json()
      if (!payRes.ok) throw new Error(pay.error || 'Erro ao processar pagamento')

      if (method === 'pix') {
        const qrRes = await fetch(`/api/dayuse/pix?paymentId=${pay.paymentId}`)
        const qr = await qrRes.json()
        if (!qrRes.ok) throw new Error(qr.error || 'Erro ao gerar QR Code PIX')
        setPixPaymentId(pay.paymentId)
        setPixQrCode(qr.encodedImage)
        setPixPayload(qr.payload)
        setPageState('pix')
        return
      }

      if (pay.paid) {
        setPageState('success')
      } else {
        throw new Error('Pagamento não confirmado. Verifique os dados do cartão.')
      }
    } catch (err: any) {
      setError(err.message)
      setPageState('error')
    }
  }

  // ─── SUCCESS ───
  if (pageState === 'success') {
    return (
      <section id="dayuse-checkout" className="bg-somma-yellow px-4 py-20 text-center">
        <div className="mx-auto max-w-md rounded-2xl border-4 border-somma-black bg-somma-cream p-8 shadow-[8px_8px_0_#0a0a0a]">
          <div className="mb-4 text-6xl">🎉</div>
          <h2 className="font-bebas text-4xl tracking-tight text-somma-black">Ingresso garantido!</h2>
          <p className="mt-3 font-dm text-somma-black/70">
            Seu Day Use do Special Day está confirmado. Te esperamos no after,
            sábado 18/07. Bora curtir!
          </p>
          <a href="/" className="mt-6 inline-block rounded-xl border-4 border-somma-black bg-somma-blue px-6 py-3 font-bebas text-xl tracking-wide text-somma-cream shadow-[4px_4px_0_#0a0a0a]">
            Voltar ao site
          </a>
        </div>
      </section>
    )
  }

  // ─── PIX ───
  if (pageState === 'pix') {
    return (
      <section id="dayuse-checkout" className="bg-somma-cream px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border-4 border-somma-black bg-white p-8 text-center shadow-[8px_8px_0_#0a0a0a]">
          <h2 className="font-bebas text-3xl tracking-tight text-somma-black">Pague com PIX</h2>
          <p className="mt-2 font-dm text-sm text-somma-black/60">Escaneie o QR Code ou copie o código.</p>
          {pixQrCode && (
            <img src={`data:image/png;base64,${pixQrCode}`} alt="QR Code PIX" width={220} height={220} className="mx-auto mt-6 rounded-xl border-4 border-somma-black" />
          )}
          <p className="mt-4 font-bebas text-4xl tracking-tight text-somma-black">R$ 75</p>
          {pixPayload && (
            <button
              type="button"
              onClick={async () => { await navigator.clipboard.writeText(pixPayload); setPixCopied(true); setTimeout(() => setPixCopied(false), 3000) }}
              className="mt-4 w-full rounded-xl border-4 border-somma-black bg-somma-blue px-6 py-3 font-bebas text-xl tracking-wide text-somma-cream shadow-[4px_4px_0_#0a0a0a]"
            >
              {pixCopied ? 'Código copiado!' : 'Copiar código PIX'}
            </button>
          )}
          <p className="mt-4 font-dm text-xs text-somma-black/50">
            A confirmação aparece aqui automaticamente após o pagamento.
          </p>
        </div>
      </section>
    )
  }

  // ─── PROCESSING ───
  if (pageState === 'processing') {
    return (
      <section id="dayuse-checkout" className="bg-somma-cream px-4 py-24 text-center">
        <div className="mx-auto max-w-sm">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-somma-black border-t-somma-orange" />
          <h2 className="font-bebas text-3xl tracking-tight text-somma-black">Processando…</h2>
          <p className="mt-2 font-dm text-sm text-somma-black/60">Seu pagamento está sendo validado com segurança.</p>
        </div>
      </section>
    )
  }

  // ─── ERROR ───
  if (pageState === 'error') {
    return (
      <section id="dayuse-checkout" className="bg-somma-cream px-4 py-20 text-center">
        <div className="mx-auto max-w-md rounded-2xl border-4 border-somma-black bg-white p-8 shadow-[8px_8px_0_#0a0a0a]">
          <div className="mb-4 text-5xl">😕</div>
          <h2 className="font-bebas text-3xl tracking-tight text-somma-black">Ops, deu ruim</h2>
          <p className="mt-2 font-dm text-sm text-somma-black/70">{error || 'Ocorreu um erro ao processar seu pagamento.'}</p>
          <button
            onClick={() => { setPageState('form'); setError(null) }}
            className="mt-6 rounded-xl border-4 border-somma-black bg-somma-orange px-6 py-3 font-bebas text-xl tracking-wide text-somma-cream shadow-[4px_4px_0_#0a0a0a]"
          >
            Tentar de novo
          </button>
        </div>
      </section>
    )
  }

  // ─── FORM ───
  return (
    <section id="dayuse-checkout" className="bg-somma-cream px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-lg">
        <h2 className="mb-2 text-center font-bebas text-4xl tracking-tight text-somma-black sm:text-5xl">
          Garanta seu Day Use
        </h2>
        <p className="mb-8 text-center font-dm text-sm text-somma-black/60">Ingresso único · R$ 75 · à vista</p>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border-4 border-somma-black bg-white p-6 shadow-[8px_8px_0_#0a0a0a] sm:p-8">
          {/* Dados */}
          <div className="space-y-3">
            <input required className={inputClass} placeholder="Nome completo" value={customer.name}
              onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))} />
            <input required type="email" className={inputClass} placeholder="E-mail" value={customer.email}
              onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input required className={inputClass} placeholder="CPF" inputMode="numeric" value={customer.cpfCnpj}
                onChange={(e) => setCustomer((p) => ({ ...p, cpfCnpj: formatCPF(e.target.value) }))} />
              <input required className={inputClass} placeholder="WhatsApp" inputMode="tel" value={customer.phone}
                onChange={(e) => setCustomer((p) => ({ ...p, phone: formatPhone(e.target.value) }))} />
            </div>
          </div>

          {/* Toggle pagamento */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setMethod('card')}
              className={`rounded-xl border-4 border-somma-black px-4 py-3 font-bebas text-lg tracking-wide transition-all ${method === 'card' ? 'bg-somma-blue text-somma-cream shadow-[4px_4px_0_#0a0a0a]' : 'bg-white text-somma-black/60'}`}>
              💳 Cartão
            </button>
            <button type="button" onClick={() => setMethod('pix')}
              className={`rounded-xl border-4 border-somma-black px-4 py-3 font-bebas text-lg tracking-wide transition-all ${method === 'pix' ? 'bg-somma-blue text-somma-cream shadow-[4px_4px_0_#0a0a0a]' : 'bg-white text-somma-black/60'}`}>
              ⚡ PIX
            </button>
          </div>

          {/* Cartão + endereço (só no cartão) */}
          {method === 'card' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required className={inputClass} placeholder="CEP" inputMode="numeric" value={customer.postalCode}
                  onChange={(e) => handleCep(e.target.value)} />
                <input required className={inputClass} placeholder="Número" value={customer.addressNumber}
                  onChange={(e) => setCustomer((p) => ({ ...p, addressNumber: e.target.value }))} />
              </div>
              {isCepLoading && <p className="font-dm text-xs text-somma-black/50">Buscando endereço…</p>}
              {customer.street && (
                <p className="font-dm text-xs text-somma-black/60">{customer.street}, {customer.neighborhood} · {customer.city}/{customer.state}</p>
              )}
              <input required className={inputClass} placeholder="Número do cartão" inputMode="numeric" maxLength={19} value={card.number}
                onChange={(e) => setCard((p) => ({ ...p, number: formatCard(e.target.value) }))} />
              <input required className={`${inputClass} uppercase`} placeholder="Nome impresso no cartão" value={card.holderName}
                onChange={(e) => setCard((p) => ({ ...p, holderName: e.target.value.toUpperCase() }))} />
              <div className="grid grid-cols-3 gap-3">
                <input required className={inputClass} placeholder="MM" maxLength={2} inputMode="numeric" value={card.expiryMonth}
                  onChange={(e) => setCard((p) => ({ ...p, expiryMonth: e.target.value.replace(/\D/g, '') }))} />
                <input required className={inputClass} placeholder="AAAA" maxLength={4} inputMode="numeric" value={card.expiryYear}
                  onChange={(e) => setCard((p) => ({ ...p, expiryYear: e.target.value.replace(/\D/g, '') }))} />
                <input required className={inputClass} placeholder="CVV" maxLength={4} inputMode="numeric" value={card.ccv}
                  onChange={(e) => setCard((p) => ({ ...p, ccv: e.target.value.replace(/\D/g, '') }))} />
              </div>
            </div>
          )}

          {method === 'pix' && (
            <p className="rounded-xl border-4 border-somma-black bg-somma-yellow px-4 py-3 font-dm text-sm text-somma-black">
              Pagamento único de R$ 75 via PIX. O QR Code aparece na próxima tela.
            </p>
          )}

          <button type="submit"
            className="w-full rounded-xl border-4 border-somma-black bg-somma-orange px-6 py-4 font-bebas text-2xl tracking-wide text-somma-cream shadow-[6px_6px_0_#0a0a0a] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_#0a0a0a]">
            Pagar R$ 75
          </button>
          <p className="text-center font-dm text-xs text-somma-black/40">🔒 Pagamento processado com segurança pelo Asaas.</p>
        </form>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add components/special-day/dayuse/DayUseCheckout.tsx
git commit -m "feat(dayuse): checkout com cartão e PIX no visual Special Day"
```

---

### Task 9: Página `/dayuse` (monta tudo)

**Files:**
- Create: `app/dayuse/page.tsx`

**Interfaces:**
- Consumes: todos os componentes de `components/special-day/dayuse/*` (Tasks 7–8) e `SmoothScroll` de `@/components/SmoothScroll`.
- Produces: rota `/dayuse`.

- [ ] **Step 1: Criar a página**

```tsx
import type { Metadata } from 'next'
import SmoothScroll from '@/components/SmoothScroll'
import DayUseHero from '@/components/special-day/dayuse/DayUseHero'
import DayUseInclui from '@/components/special-day/dayuse/DayUseInclui'
import DayUsePrograma from '@/components/special-day/dayuse/DayUsePrograma'
import DayUseShow from '@/components/special-day/dayuse/DayUseShow'
import DayUseGincana from '@/components/special-day/dayuse/DayUseGincana'
import DayUseSorteios from '@/components/special-day/dayuse/DayUseSorteios'
import DayUseCheckout from '@/components/special-day/dayuse/DayUseCheckout'

export const metadata: Metadata = {
  title: 'Day Use · Special Day — Somma Club',
  description: 'Ingresso Day Use do Special Day: acesso a todo o after (samba, DJ, gincana e sorteios) por R$ 75. Não inclui kit nem a corrida.',
}

export default function DayUsePage() {
  return (
    <SmoothScroll>
      <DayUseHero />
      <DayUseInclui />
      <DayUsePrograma />
      <DayUseShow />
      <DayUseGincana />
      <DayUseSorteios />
      <DayUseCheckout />
    </SmoothScroll>
  )
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build conclui; a rota `/dayuse` aparece na lista de rotas geradas.

- [ ] **Step 3: Verificação manual (dev)**

Adicionar `ASAAS_API_KEY` ao `.env.local` (mesma chave do V3) e rodar `npm run dev`.
Verificar em `http://localhost:3000/dayuse`:
- Todas as seções renderizam com o visual Special Day (cores, sombras, Bebas).
- CTA do Hero rola até o formulário (`#dayuse-checkout`).
- No cartão, digitar um CEP válido autopreenche endereço.
- Submeter com cartão de teste do Asaas → tela de sucesso; conferir linha em `dayuse_orders` com `status_pagamento = 'Pago'`.
- Selecionar PIX e submeter → QR aparece; conferir linha `Pendente` em `dayuse_orders`.

- [ ] **Step 4: Commit**

```bash
git add app/dayuse/page.tsx
git commit -m "feat(dayuse): página /dayuse montando seções e checkout"
```

---

## Self-Review

**Spec coverage:**
- Regra "não kit" / "não corre" / "acesso ao after" → Task 7 (`DayUseInclui`) + badge em `DayUsePrograma`. ✅
- Programação → Task 7 (`DayUsePrograma`). ✅
- Show Resenha do Sabino → Task 7 (`DayUseShow`). ✅
- Gincana → Task 7 (`DayUseGincana`). ✅
- Sorteios + exclusão do Adidas Evo SL → Task 7 (`DayUseSorteios`). ✅
- Compra via cartão e PIX (R$ 75) → Tasks 4–6 (rotas) + Task 8 (checkout). ✅
- Integração Asaas com variáveis/checkout do V3 → Tasks 3–6. ✅
- Persistência no Supabase → Task 2 + gravação nas Tasks 5–6. ✅
- Visual Special Day → Global Constraints + Tasks 7–9. ✅
- Tailwind escaneando novos arquivos → Task 1. ✅

**Placeholder scan:** sem TBD/TODO; todo código presente. Copy de sorteios é genérica por decisão do spec (lista final opcional). ✅

**Type consistency:** rota `payment` recebe `{ customerId, method, customer, card }` e o checkout (Task 8) envia exatamente esse shape; `customer` inclui `postalCode`/`addressNumber` usados no `creditCardHolderInfo`. `payment-status` e `pix` recebem `paymentId` via query, consistente com o checkout. `DAYUSE_PRICE` usado em `payment` e no texto. ✅
