# Barra de progresso de disparo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar um overlay central com barra de progresso animada e mensagem de "Aguarde" ao clicar em Disparar/Teste no painel de réguas de `/admin/leads`.

**Architecture:** Progresso 100% client-side (animação estimada), sem tocar em server actions, `lib/evento/*` ou banco. Um novo componente `DispatchProgress.tsx` expõe um hook orquestrador (`useDispatchProgress`) e o overlay de apresentação (`DispatchProgressOverlay`), fiados em `EventoReguasManager.tsx`.

**Tech Stack:** Next.js 14 (App Router, client components), React 18, TypeScript, Tailwind (tokens Somma: `somma-cream`/`somma-orange`/`somma-blue`/`somma-black`, fontes `bebas`/`dm`).

## Global Constraints

- Sem mudanças em `actions/evento.ts`, `lib/evento/*` ou schema do banco.
- Componente client (`'use client'`); animação via `requestAnimationFrame` + `performance.now()` (nunca `Date.now()`/`new Date()` no corpo do módulo).
- Estilo Somma: cores `somma-*`, fontes `font-bebas`/`font-dm`, cantos arredondados como o restante do painel.
- `estimate` só controla a velocidade da animação; o resultado real (retorno da action) sempre define o 100% e o texto final.
- Projeto sem suíte de testes automatizada → gate de cada task é `npx tsc --noEmit` + verificação manual descrita.

---

## File Structure

- **Create** `components/admin/DispatchProgress.tsx` — tipos `DispatchState`/`DispatchPhase`, hook `useDispatchProgress()`, componente `DispatchProgressOverlay`. Responsabilidade única: estado + animação + apresentação do overlay.
- **Modify** `components/admin/EventoReguasManager.tsx` — instanciar o hook, renderizar o overlay, passar `run` para `GroupTable`, e reescrever `handleDispatch`/`handleTest` para usar `run`.

---

## Task 1: Componente `DispatchProgress.tsx` (hook + overlay)

**Files:**
- Create: `components/admin/DispatchProgress.tsx`

**Interfaces:**
- Consumes: nada (React apenas).
- Produces:
  - `type DispatchPhase = 'idle' | 'running' | 'done' | 'error'`
  - `interface DispatchState { phase: DispatchPhase; title: string; percent: number; resultText: string }`
  - `interface RunOptions<T> { title: string; estimate: number; describe: (r: T) => { ok: boolean; text: string } }`
  - `useDispatchProgress(): { state: DispatchState; run: <T>(opts: RunOptions<T>, task: () => Promise<T>) => Promise<T> }`
  - `function DispatchProgressOverlay({ state }: { state: DispatchState }): JSX.Element | null`

- [ ] **Step 1: Criar o arquivo com tipos, hook e overlay**

Create `components/admin/DispatchProgress.tsx`:

```tsx
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type DispatchPhase = 'idle' | 'running' | 'done' | 'error'

export interface DispatchState {
  phase: DispatchPhase
  title: string
  percent: number
  resultText: string
}

export interface RunOptions<T> {
  title: string
  /** Nº estimado de destinatários — controla só a velocidade da animação. */
  estimate: number
  describe: (r: T) => { ok: boolean; text: string }
}

const IDLE: DispatchState = { phase: 'idle', title: '', percent: 0, resultText: '' }

/** Duração estimada da animação a partir do nº de destinatários. */
function estimateDurationMs(estimate: number): number {
  const chunks = Math.max(1, Math.ceil(estimate / 100))
  return Math.max(1500, chunks * 1200) // ~envio + throttle de 600ms por lote
}

/** Ease-out: rápido no começo, desacelera perto do teto. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 2)
}

export function useDispatchProgress() {
  const [state, setState] = useState<DispatchState>(IDLE)
  const rafRef = useRef<number | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      stopRaf()
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current)
    }
  }, [stopRaf])

  const run = useCallback(
    async <T,>(opts: RunOptions<T>, task: () => Promise<T>): Promise<T> => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      stopRaf()
      setState({ phase: 'running', title: opts.title, percent: 0, resultText: '' })

      const duration = estimateDurationMs(opts.estimate)
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const pct = Math.round(easeOut(t) * 90) // trava em ~90% até a task resolver
        setState((s) => (s.phase === 'running' ? { ...s, percent: pct } : s))
        if (t < 1) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)

      const finish = (phase: 'done' | 'error', text: string) => {
        stopRaf()
        setState((s) => ({ ...s, phase, percent: 100, resultText: text }))
        closeTimerRef.current = setTimeout(() => setState(IDLE), 1000)
      }

      try {
        const result = await task()
        const d = opts.describe(result)
        finish(d.ok ? 'done' : 'error', d.text)
        return result
      } catch (err) {
        finish('error', 'Falha ao enviar.')
        throw err
      }
    },
    [stopRaf],
  )

  return { state, run }
}

export function DispatchProgressOverlay({ state }: { state: DispatchState }) {
  if (state.phase === 'idle') return null

  const done = state.phase === 'done'
  const error = state.phase === 'error'
  const barColor = error ? 'bg-red-500' : done ? 'bg-green-500' : 'bg-somma-orange'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-somma-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border-4 border-somma-blue/30 bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3">
          {state.phase === 'running' && (
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-somma-orange border-t-transparent" />
          )}
          <h3 className="font-bebas text-2xl tracking-wider text-somma-black">{state.title}</h3>
        </div>

        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-somma-black/10">
          <div
            className={`h-full rounded-full transition-[width] duration-200 ease-out ${barColor}`}
            style={{ width: `${state.percent}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between font-dm text-sm">
          <span className={error ? 'text-red-600' : done ? 'text-green-700' : 'text-somma-black/60'}>
            {state.phase === 'running' ? 'Aguarde — enviando e-mails…' : state.resultText}
          </span>
          <span className="font-bold text-somma-black/70">{state.percent}%</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros novos referentes a `DispatchProgress.tsx`. (O arquivo ainda não é importado; isso valida tipos/JSX isoladamente.)

- [ ] **Step 3: Commit**

```bash
git add components/admin/DispatchProgress.tsx
git commit -m "feat(reguas): componente DispatchProgress (hook + overlay de progresso)"
```

---

## Task 2: Fiar o overlay no `EventoReguasManager`

**Files:**
- Modify: `components/admin/EventoReguasManager.tsx`

**Interfaces:**
- Consumes: `useDispatchProgress`, `DispatchProgressOverlay`, e o tipo do `run` da Task 1.
- Produces: nada novo para outras tasks (feature completa).

- [ ] **Step 1: Importar o componente e definir o tipo de `run`**

No topo de `components/admin/EventoReguasManager.tsx`, após a linha
`import { updateReguaSchedule, sendReguaTest, dispatchReguaNow } from '@/actions/evento'`, adicionar:

```tsx
import { useDispatchProgress, DispatchProgressOverlay, type RunOptions } from './DispatchProgress'

type RunFn = <T>(opts: RunOptions<T>, task: () => Promise<T>) => Promise<T>
```

- [ ] **Step 2: `GroupTable` recebe `run` via props**

Alterar a assinatura do `GroupTable` (o objeto de props desestruturado) de:

```tsx
function GroupTable({
  group,
  testEmail,
  onMsg,
}: {
  group: ReguaGroup
  testEmail: string
  onMsg: (m: { type: 'ok' | 'err'; text: string } | null) => void
}) {
```

para:

```tsx
function GroupTable({
  group,
  testEmail,
  onMsg,
  run,
}: {
  group: ReguaGroup
  testEmail: string
  onMsg: (m: { type: 'ok' | 'err'; text: string } | null) => void
  run: RunFn
}) {
```

- [ ] **Step 3: Reescrever `handleTest` para usar `run`**

Substituir a função `handleTest` inteira por:

```tsx
  function handleTest(step: string) {
    onMsg(null)
    if (!testEmail) {
      onMsg({ type: 'err', text: 'Digite um e-mail para o teste no topo do painel.' })
      return
    }
    startTransition(async () => {
      try {
        const res = await run(
          {
            title: 'Enviando teste…',
            estimate: 1,
            describe: (r) => (r.success ? { ok: true, text: 'Teste enviado' } : { ok: false, text: r.error }),
          },
          () => sendReguaTest(group.base, step, testEmail),
        )
        onMsg(res.success ? { type: 'ok', text: `Teste enviado para ${testEmail}.` } : { type: 'err', text: res.error })
      } catch {
        onMsg({ type: 'err', text: 'Falha ao enviar teste.' })
      }
    })
  }
```

- [ ] **Step 4: Reescrever `handleDispatch` para usar `run`**

Substituir a função `handleDispatch` inteira por:

```tsx
  function handleDispatch(step: string, subject: string) {
    onMsg(null)
    if (!confirm(`Disparar AGORA para os elegíveis de "${group.label}"?\n\n"${subject}"\n\nQuem já recebeu este passo será ignorado.`)) return
    startTransition(async () => {
      try {
        const res = await run(
          {
            title: 'Enviando e-mails…',
            estimate: group.totalEligible,
            describe: (r) =>
              r.success
                ? { ok: true, text: `${r.data.sent} enviados · ${r.data.failed} falhas` }
                : { ok: false, text: r.error },
          },
          () => dispatchReguaNow(group.base, step),
        )
        if (res.success) {
          onMsg({ type: 'ok', text: `Disparo concluído: ${res.data.sent} enviados, ${res.data.failed} falhas.` })
          router.refresh()
        } else onMsg({ type: 'err', text: res.error })
      } catch {
        onMsg({ type: 'err', text: 'Falha ao disparar.' })
      }
    })
  }
```

- [ ] **Step 5: Instanciar o hook e renderizar o overlay + passar `run`**

No componente `EventoReguasManager` (o `export default`), adicionar o hook junto aos outros `useState`:

```tsx
export default function EventoReguasManager({ groups }: { groups: ReguaGroup[] }) {
  const [testEmail, setTestEmail] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const progress = useDispatchProgress()
```

Passar `run` no `.map` dos grupos:

```tsx
      {groups.map((g) => (
        <GroupTable key={g.base} group={g} testEmail={testEmail} onMsg={setMsg} run={progress.run} />
      ))}
```

E renderizar o overlay uma vez, imediatamente antes do `</div>` de fechamento do wrapper raiz (após o `<p>` do rodapé):

```tsx
      <DispatchProgressOverlay state={progress.state} />
    </div>
  )
}
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros. Confirma que `run` está tipado e `RunOptions` importa corretamente.

- [ ] **Step 7: Verificação manual**

Run: `npm run dev`, logar em `/admin/leads`.
Verificar:
1. **Teste** com e-mail preenchido → overlay "Enviando teste…" aparece, barra anima, trava em 100% com "Teste enviado", fecha em ~1s; banner mostra sucesso.
2. **Teste** sem e-mail → banner de erro, sem overlay.
3. **Disparar** → confirmar no `confirm()` → overlay "Enviando e-mails…" anima até ~90%, trava em 100% com "X enviados · Y falhas", fecha; banner e números da tabela atualizam.
4. **Disparar** e cancelar o `confirm()` → nada acontece.
5. Erro (ex.: sessão expirada) → overlay fica vermelho e banner mostra o erro.

- [ ] **Step 8: Commit**

```bash
git add components/admin/EventoReguasManager.tsx
git commit -m "feat(reguas): overlay de progresso ao disparar/testar réguas"
```

---

## Self-Review

**Spec coverage:**
- Overlay central estimado → Task 1 (hook + overlay), Task 2 (fiação). ✓
- Aparece em Disparar e Teste → Task 2 Steps 3–4. ✓
- Barra 0→~90%, trava em 100% com resultado real → `run` (Task 1 Step 1). ✓
- Estilo Somma, bloqueante, "Aguarde" → `DispatchProgressOverlay`. ✓
- Sem mudanças de backend / cleanup de rAF / duração estimada → cobertos. ✓
- Fora de escopo (streaming, cron, inline) → não implementados. ✓

**Placeholder scan:** nenhum TBD/TODO; todo código está completo.

**Type consistency:** `DispatchState`, `RunOptions<T>`, `useDispatchProgress`, `DispatchProgressOverlay`, `run: RunFn` consistentes entre Task 1 e Task 2. `describe` usa `r.success`/`r.data.sent`/`r.data.failed`/`r.error`, coerente com o tipo `Result<T>` retornado por `dispatchReguaNow`/`sendReguaTest` em `actions/evento.ts`.
