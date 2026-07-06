# Barra de progresso de disparo — Design

**Data:** 2026-07-06
**Área:** `/admin/leads` → painel "Réguas do Evento · Disparos por base"

## Objetivo

Ao clicar em **Disparar** (envio manual em massa) ou **Teste** (envio único) no
painel de réguas, mostrar um overlay central com barra de progresso animada, % e
uma mensagem de "Aguarde — enviando e-mails…", dando feedback visual claro de que
o envio está em andamento e impedindo cliques duplos. Ao terminar, o overlay
mostra o resultado real e fecha sozinho.

## Contexto atual

Fluxo de disparo hoje (sem progresso):

1. `components/admin/EventoReguasManager.tsx` → `GroupTable.handleDispatch` /
   `handleTest` chamam as server actions dentro de `useTransition`.
2. `actions/evento.ts` → `dispatchReguaNow(base, step)` chama
   `lib/evento/dispatch.ts#dispatchStep`, que **bloqueia até enviar tudo**: envia
   em lotes de 100 com throttle de 600ms entre lotes
   (`lib/evento/send.ts#sendEventoBatch`) e retorna `{ sent, failed }` no final.
3. O cliente `await`a e mostra uma mensagem-banner (`onMsg`) + `router.refresh()`.

Não há streaming de progresso; o store (`setRun`) só grava `enviando` no início e
`enviado`/`erro` no fim. Por isso a barra será **estimada** (animação client-side),
travando em 100% com a contagem real quando a action resolve.

## Decisões (brainstorming)

- **Tipo de progresso:** animação estimada (sem mudança de backend, sem risco de
  timeout). O resultado real define o 100% e o texto final.
- **Apresentação:** overlay central (modal bloqueante) com backdrop, para reforçar
  o "aguarde" e evitar cliques duplos.
- **Escopo:** aparece em **Disparar** e **Teste** (o teste é 1 e-mail, animação curta).

## Arquitetura

Nenhuma mudança em server actions, `lib/evento/*` ou banco. Tudo client-side.

### Novo arquivo: `components/admin/DispatchProgress.tsx`

Exporta dois itens de responsabilidade única:

#### 1. `useDispatchProgress()` — hook orquestrador

Estado interno (`DispatchState`):

```ts
type DispatchPhase = 'idle' | 'running' | 'done' | 'error'
interface DispatchState {
  phase: DispatchPhase
  title: string        // ex.: "Enviando e-mails…"
  percent: number      // 0–100
  resultText: string   // preenchido nas fases done/error
}
```

Expõe:

```ts
run<T>(
  opts: {
    title: string
    estimate: number                              // nº estimado de destinatários
    describe: (r: T) => { ok: boolean; text: string }
  },
  task: () => Promise<T>
): Promise<T>
```

Comportamento de `run`:

1. Define `phase: 'running'`, `title`, `percent: 0`.
2. Calcula a duração estimada a partir de `estimate` (ver abaixo) e anima
   `percent` de **0 → ~90%** com easing (ease-out; desacelera perto de 90%) via
   `requestAnimationFrame`. Nunca passa de ~90% enquanto a `task` não resolve.
3. `await task()`.
4. Ao resolver: para a animação, seta `percent: 100`, `phase: 'done'|'error'` e
   `resultText` a partir de `describe(resultado)`, segura ~1000ms e volta a
   `phase: 'idle'` (fecha o overlay). Retorna o valor resolvido ao chamador.
5. Se a `task` **rejeitar** (exceção): `phase: 'error'`, `percent: 100`,
   `resultText` genérico ("Falha ao enviar."), segura ~1000ms, fecha, e
   re-lança para o chamador tratar.

Detalhes de implementação:

- O loop de animação usa `requestAnimationFrame`; o handle do rAF e um flag de
  "cancelado" ficam em `useRef`. Um `useEffect` de cleanup cancela o rAF no
  unmount para não vazar.
- `Date.now()`/timestamps de animação vêm de `performance.now()` dentro do rAF
  (client-side, permitido no browser).

**Estimativa de duração:**

- Disparar: `chunks = Math.max(1, Math.ceil(estimate / 100))`;
  `durationMs = Math.max(1500, chunks * 1200)` (≈ envio + throttle de 600ms por lote).
- Teste: `estimate = 1` → `chunks = 1` → piso de 1500ms, mas como o retorno costuma
  ser rápido, a barra trava em 100% assim que a action resolve. (Alternativamente,
  título "Enviando teste…" deixa claro que é um envio único.)

A estimativa só afeta a **velocidade** da animação; nunca a correção do resultado.

#### 2. `<DispatchProgressOverlay state={DispatchState} />` — apresentação

- Renderiza `null` quando `state.phase === 'idle'`.
- Caso contrário: `fixed inset-0 z-50`, fundo `bg-somma-black/50 backdrop-blur-sm`,
  card central no estilo Somma (creme/branco, borda arredondada, fontes
  `bebas`/`dm`, acento laranja/azul).
- Conteúdo: título (`state.title`), **barra de progresso** (trilho + preenchimento
  animado via `width: ${percent}%` com `transition-[width]`), o **% numérico**,
  um spinner e o texto "Aguarde — enviando e-mails…".
- Nas fases `done`/`error`: troca o texto de "Aguarde…" por `state.resultText`
  (verde para `done`, vermelho para `error`) e a barra fica cheia (100%).
- Não fecha por clique no backdrop (bloqueante durante o envio).

### Fiação em `components/admin/EventoReguasManager.tsx`

- No componente `EventoReguasManager`: `const progress = useDispatchProgress()`.
  Renderizar `<DispatchProgressOverlay state={progress.state} />` dentro do wrapper.
  Passar `progress.run` para cada `<GroupTable ... run={progress.run} />`.
- `GroupTable` recebe `run` via props. Em `handleDispatch(step, subject)`:
  - Mantém o `confirm(...)` atual.
  - Substitui o corpo do `startTransition` por:
    ```ts
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
    ```
- Em `handleTest(step)`: mesma estrutura, com
  `title: 'Enviando teste…'`, `estimate: 1`,
  `describe: (r) => r.success ? { ok:true, text:'Teste enviado' } : { ok:false, text:r.error }`,
  `task: () => sendReguaTest(group.base, step, testEmail)`, mantendo a validação de
  `testEmail` vazia e o `onMsg` de sucesso/erro atuais.

`useTransition`/`isPending` continuam desabilitando os botões; o overlay apenas se
sobrepõe. `onMsg` (banner) segue mostrando o resumo textual como redundância.

## Fluxo de dados

```
Clique "Disparar"
  → confirm()
  → progress.run({ title, estimate, describe }, () => dispatchReguaNow(...))
       → overlay abre (phase: running), barra anima 0→~90%
       → dispatchReguaNow → dispatchStep → sendEventoBatch (lotes)
       → resolve { success, data:{ sent, failed } }
       → overlay: percent 100, phase done, resultText "X enviados · Y falhas"
       → segura ~1s, phase idle (fecha)
  → onMsg(banner) + router.refresh()
```

## Tratamento de erro

- Server action retorna `{ success:false, error }`: `describe` marca `ok:false`,
  overlay mostra vermelho, banner mostra o erro.
- `task` lança exceção inesperada: overlay entra em `error` com texto genérico,
  `run` re-lança, e o `catch` no handler mostra banner de falha.
- Unmount durante animação: cleanup do `useEffect` cancela o rAF.

## Testes / verificação

Projeto sem suíte de testes automatizada. Verificação manual:

1. `Teste`: com e-mail preenchido, clicar → overlay aparece curto, mostra
   "Teste enviado", fecha. Sem e-mail → banner de erro, sem overlay.
2. `Disparar`: confirmar no `confirm()` → overlay anima, trava em 100% com
   contagem real, fecha; banner e números da tabela atualizam após refresh.
3. Cancelar o `confirm()` → nada acontece (sem overlay).
4. Base com muitos elegíveis (ex.: cadastro_site, 943) → animação dura mais,
   coerente com o tempo real de envio.

## Fora de escopo (YAGNI)

- Progresso real por chunk / streaming (SSE). Explicitamente descartado.
- Barra para disparos agendados via cron (rodam no servidor, sem tela aberta).
- Barra de progresso inline por linha.
