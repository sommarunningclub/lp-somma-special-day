# Campanha de escassez — Fim do lote VIP (R$ 97)

Design / spec · Criado em 2026-06-17

## 1. Objetivo

Disparar uma sequência de e-mails de **escassez/contagem regressiva** para toda a lista VIP
(`lista_vip`), anunciando que o **lote promocional de R$ 97** (cupom `SOMMAVIP`) **encerra
no domingo 21/06/2026 às 23h59** (depois o valor volta para R$ 119). Meta: converter
cadastros em inscrição paga no app TF Sports antes da virada de lote.

Não é drip por comportamento — é uma campanha temporal com datas fixas, enviada a todos
os contatos elegíveis.

## 2. Contexto travado

- Hoje: quarta, 17/06/2026. Deadline: domingo, 21/06/2026 23h59 (America/Sao_Paulo).
- Lista VIP: ~446 contatos em `lista_vip` (Supabase).
- Plano Vercel: **Pro** (cron com granularidade fina liberado).
- Domínio Resend `sommaclub.com.br`: verificado, sending enabled (sa-east-1).
- Remetente: `VIP_EMAIL_FROM` = "Somma Special Day <contato@sommaclub.com.br>".

## 3. Cronograma (6 disparos)

Todos os horários em America/Sao_Paulo (UTC-3).

| Passo (`step`) | Quando | Mote | Assunto (rascunho) |
|---|---|---|---|
| `d4_anuncio`  | qua 17/06 10h | Anúncio / não perca | O valor VIP de R$ 97 acaba domingo |
| `d3`          | qui 18/06 10h | Faltam 3 dias | Faltam 3 dias pro fim do 1º lote (R$ 97) |
| `d2`          | sex 19/06 10h | Faltam 2 dias | Só até domingo: R$ 97 com o cupom SOMMAVIP |
| `d1_amanha`   | sáb 20/06 10h | É amanhã | ⏰ Amanhã o preço sobe — último dia de R$ 97 |
| `d0_hoje`     | dom 21/06 10h | É hoje | 🚨 Últimas horas: R$ 97 vira R$ 119 hoje |
| `d0_noite`    | dom 21/06 20h | Últimas horas mesmo | Acaba à meia-noite: garanta R$ 97 agora |

Se hoje (17/06) já passou das 10h, o passo `d4_anuncio` é disparado no primeiro acionamento
(cron ou manual) — kickoff imediato.

## 4. Destinatários (elegibilidade por passo)

Enviar para cada contato de `lista_vip` que satisfaça TODAS as condições:

- `status_cupom` é `'ativo'` ou `NULL`;
- `email_status` NÃO em (`bounced`, `complained`, `failed`);
- `unsubscribed_at IS NULL` (nova coluna);
- ainda **não recebeu este `step`** (sem linha em `vip_campaign_sends` para `lead_id`+`step`).

Limitação conhecida: sem webhook de compra da TF Sports, não há como excluir quem já
comprou. Risco aceito para esta campanha; supressão manual pode ser adicionada depois
(marcar `status_cupom='usado'` no admin já exclui o contato).

## 5. Arquitetura

### 5.1 Componentes

| Unidade | Caminho | Responsabilidade |
|---|---|---|
| Config da campanha | `lib/campaign/vip-countdown-steps.ts` | Define os 6 passos: `step`, `sendAt` (ISO), `subject`, dados de copy |
| Template de e-mail | `lib/emails/countdown-vip.ts` | `renderCountdownEmail({ nome, step, unsubscribeUrl })` → `{ subject, html }`, estilo igual ao `vip-ticket.ts` |
| Envio em lote | `lib/emails/send-countdown.ts` | Recebe lista de destinatários + step, monta payload e chama Resend `batch.send` (lotes de 100) |
| Rota cron | `app/api/cron/vip-countdown/route.ts` | Seleciona passos vencidos não enviados, consulta elegíveis, envia, registra em `vip_campaign_sends` |
| Unsubscribe | `app/unsubscribe/route.ts` | Marca `unsubscribed_at` via token (= `codigo_unico`) |
| Cron schedule | `vercel.json` | `{ "crons": [{ "path": "/api/cron/vip-countdown", "schedule": "0 * * * *" }] }` (de hora em hora) |
| Migration | `supabase/migrations/007_vip_countdown_campaign.sql` | Cria `vip_campaign_sends` + coluna `unsubscribed_at` |

### 5.2 Fluxo da rota cron

1. Autentica: header `Authorization: Bearer ${CRON_SECRET}` (Vercel injeta automaticamente).
   Acionamento manual aceito com mesmo header + query opcional `?step=<step>&dry=1`.
2. Calcula `now` (UTC). Para cada passo com `sendAt <= now`, em ordem, processa o primeiro
   que ainda tenha destinatários pendentes (idempotente).
3. Consulta `lista_vip` filtrando elegibilidade (seção 4) + `LEFT JOIN`/`NOT IN` contra
   `vip_campaign_sends` para o `step`.
4. Para cada destinatário monta `{ from, to, subject, html, headers: { 'List-Unsubscribe': ... } }`
   com `nome` e `unsubscribeUrl` personalizados.
5. Envia via `resend.batch.send` em lotes de 100.
6. Insere uma linha em `vip_campaign_sends (lead_id, step, resend_email_id, sent_at)` por envio
   bem-sucedido. Erros são logados; o passo pode ser reexecutado no próximo cron (dedup garante
   que não duplica).
7. Retorna JSON com `{ step, elegiveis, enviados, falhas }`.

### 5.3 Esquema de dados

```sql
-- 007_vip_countdown_campaign.sql
alter table public.lista_vip add column if not exists unsubscribed_at timestamptz;

create table if not exists public.vip_campaign_sends (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.lista_vip(id) on delete cascade,
  step text not null,
  resend_email_id text,
  sent_at timestamptz not null default now(),
  unique (lead_id, step)
);
create index if not exists idx_vip_campaign_sends_step on public.vip_campaign_sends(step);
```

### 5.4 Variáveis de ambiente

- `RESEND_API_KEY` (existe), `VIP_EMAIL_FROM` (existe).
- `CRON_SECRET` (novo — gerar e adicionar em `.env.local` e no Vercel).
- URL base para unsubscribe: usar constante `https://specialday.sommaclub.com.br`
  (ou `NEXT_PUBLIC_SITE_URL` se existir).

## 6. Conteúdo dos e-mails

Reaproveita o visual do `vip-ticket.ts` (cupom em destaque, R$ 119 → R$ 97, CTA pro
`PRESALE.eventoUrl`). Cada passo varia: headline de urgência, linha "faltam X dias / é hoje /
últimas horas", e o subject da tabela 3. Rodapé com link de descadastro em todos.

## 7. Deliverability

- Header `List-Unsubscribe` (mailto + URL one-click) e link visível no rodapé.
- Envios espaçados em lotes (batch de 100) para respeitar rate limit do Resend.
- Respeitar `unsubscribed_at`, `bounced`, `complained` para proteger reputação do domínio.

## 8. Operação / verificação

- Teste: enviar `d4_anuncio` em modo de 1 destinatário (e-mail do operador) antes do disparo real.
- Kickoff: após deploy + migration + env, acionar a rota manualmente para soltar o passo de hoje.
- Acompanhamento: tracking existente (`email_events`, webhook Resend) continua valendo;
  dashboard de leads no admin mostra aberturas/cliques.

## 9. Fora de escopo (agora)

Drip comportamental (abriu/clicou), webhook de compra TF Sports, WhatsApp, broadcast pelo
painel do Resend, UI de gestão da campanha no admin.
