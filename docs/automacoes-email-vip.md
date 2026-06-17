# Automações de E-mail — Lista VIP · Somma Special Day

Documento de referência para implementação futura.  
Criado em: junho/2026 · Evento: **18/07/2026 · COPMDF · Brasília**

---

## Índice

1. [Contexto do projeto](#1-contexto-do-projeto)
2. [Estado atual do funil](#2-estado-atual-do-funil)
3. [O que o Resend Automations oferece](#3-o-que-o-resend-automations-oferece)
4. [Recomendações por prioridade](#4-recomendações-por-prioridade)
5. [Matriz segmento × automação](#5-matriz-segmento--automação)
6. [Roadmap em 3 fases](#6-roadmap-em-3-fases)
7. [O que NÃO fazer agora](#7-o-que-não-fazer-agora)
8. [Como implementar (decisões técnicas)](#8-como-implementar-decisões-técnicas)
9. [Checklist para retomar](#9-checklist-para-retomar)

---

## 1. Contexto do projeto

### Evento

| Item | Valor |
|------|-------|
| Nome | Somma Special Day — 1 ano Somma Running Club |
| Data | 18/07/2026 |
| Horário | Portões 06h · corrida 07h–08h · programação até ~15h |
| Local | COPMDF · Brasília · DF |
| Percurso | 4 km (mapa) / 8 km (programação) |
| Kit | Kit Experience + camiseta (Baby Look, P, M, G, GG) · turma "Somma day" |

### Funil de conversão

```
/listavip → cadastro → e-mail cupom SOMMAVIP → /listavip/obrigado → compra no app TF Sports
```

### Pré-venda

| Item | Valor |
|------|-------|
| Cupom | `SOMMAVIP` (fixo para todos) |
| Preço | De R$ 119,00 → Por R$ 97,00 (18,49% off) |
| Lote | 1º lote (virada controlada no app TF Sports) |
| Limite de usos do cupom | ~100 no app TF Sports |
| Controle de vagas | `app_settings`: `presale_limit`, `presale_start_at`, `presale_open` |

### Páginas relevantes

| Rota | Função |
|------|--------|
| `/listavip` | Cadastro público na lista VIP |
| `/listavip/obrigado?codigo=VIP…` | Ticket pós-cadastro |
| `/acesso` → `/` | LP exclusiva para VIPs (line-up, percurso, programação) |
| `/admin/leads` | Admin: leads, funil de e-mail, controle de pré-venda |

### Arquivos-chave no código

| Área | Caminho |
|------|---------|
| Cadastro VIP | `actions/lista-vip.ts` |
| E-mail cupom | `lib/emails/send-vip-email.ts`, `lib/emails/vip-ticket.ts` |
| Constantes pré-venda | `lib/presale-constants.ts` |
| Lógica pré-venda | `lib/presale.ts` |
| Webhook Resend | `app/api/webhooks/resend/route.ts` |
| Admin leads | `app/admin/leads/page.tsx`, `components/admin/LeadManager.tsx` |
| Stats e-mail | `components/admin/EmailStatsDashboard.tsx` |
| Leads admin (sem e-mail) | `actions/admin-leads.ts` |
| Migration tracking | `supabase/migrations/006_email_tracking.sql` |

---

## 2. Estado atual do funil

### O que já funciona

- **1 e-mail automático** no cadastro: cupom `SOMMAVIP` + passo a passo TF Sports
- **Tracking via webhook Resend**: `sent` → `delivered` → `opened` → `clicked` (+ bounce/spam)
- **Dados em `lista_vip`**: timestamps, contadores, `resend_email_id`
- **Histórico bruto** em `email_events` (inclui link clicado)
- **Admin** com funil, filtros por status, export CSV, controle de pré-venda

### Campos de tracking em `lista_vip`

```
resend_email_id, email_status, email_sent_at, email_delivered_at,
email_opened_at, email_clicked_at, email_bounced_at,
email_open_count, email_click_count
```

### Gaps identificados

| Gap | Impacto |
|-----|---------|
| Só 1 e-mail (cadastro) | Leads frios/quentes sem follow-up |
| Leads criados pelo admin não recebem e-mail | `criarLeadListaVip` só insere no banco |
| `telefone` coletado, não usado | Canal alternativo (WhatsApp) inexplorado |
| `status_cupom` / `quantidade_usos` nunca atualizados | Sem saber quem comprou de fato |
| Sem cron/jobs | Nenhuma automação temporal |
| Compra é externa (TF Sports) | Sem webhook de conversão |
| Falha silenciosa no envio | `dispatchVipEmail` retorna null sem retry |

### Objetivo de negócio

**Converter cadastro na lista VIP em inscrição paga no app TF Sports** (R$ 97 com cupom, 1º lote), com urgência de escassez (vagas + virada de lote).

---

## 3. O que o Resend Automations oferece

> Referência para quando migrar fluxos para o motor do Resend.  
> Docs: https://resend.com/docs/dashboard/automations/introduction

### Tipos de step

| Step | Função |
|------|--------|
| `trigger` | Entrada — escuta evento customizado (`vip.signed_up`, etc.) |
| `send_email` | Envia template **publicado** no Resend |
| `delay` | Pausa (máx. 30 dias) |
| `wait_for_event` | Espera evento (ex.: clique) com timeout (máx. 30 dias) |
| `condition` | Bifurcação (`condition_met` / `condition_not_met`) |
| `contact_update` | Atualiza contato no Resend |
| `contact_delete` | Remove contato |
| `add_to_segment` | Adiciona a segmento |

### API disponível

- `resend.automations.create / list / get / update / remove / stop`
- `resend.automations.runs.list / get` (monitoramento por step)
- `resend.events.create / send` (disparar fluxos)
- Tudo também via dashboard

### Limitações importantes

- Resend **não escuta** `email.opened` / `email.clicked` sozinho — precisa ponte no webhook → `events.send`
- `send_email` exige **template publicado** (não aceita HTML inline como hoje)
- Métricas agregadas de automação: **só no dashboard** (sem API ainda)
- Plano free: 10.000 runs/mês, sem overage
- SDK do projeto (`resend ^6.12.3`) já suporta automations

### Abordagem recomendada para este projeto

| Curto prazo | Cron/job no admin + query Supabase + `emails.send` |
| Médio prazo | Resend Automations para fluxos contínuos de novos cadastros |
| Pontual | Botão manual no admin ou broadcast Resend |

---

## 4. Recomendações por prioridade

### Prioridade 1 — Converter quem já se cadastrou

#### 1.1 Lembrete: abriu mas não clicou (D+2)

```
QUANDO:  email_opened_at preenchido
ESPERAR: 48h após abertura
SE:      email_clicked_at IS NULL
ENTÃO:   e-mail "Seu cupom SOMMAVIP ainda está te esperando"
```

**Por quê:** segmento mais quente — leu o e-mail mas não foi ao app TF Sports.

**Conteúdo sugerido:**
- Cupom `SOMMAVIP` em destaque
- Preço: R$ 119 → R$ 97
- CTA direto para o link TF Sports
- Passo 3 simplificado do `PRESALE_PASSOS`
- Urgência do 1º lote

**Query Supabase:**
```sql
SELECT * FROM lista_vip
WHERE email_opened_at IS NOT NULL
  AND email_clicked_at IS NULL
  AND email_opened_at < NOW() - INTERVAL '48 hours'
  AND (status_cupom IS NULL OR status_cupom = 'ativo')
  AND email_status NOT IN ('bounced', 'complained', 'failed')
  AND reminder_opened_no_click_sent_at IS NULL; -- coluna a criar
```

---

#### 1.2 Lembrete: não abriu o e-mail (D+3)

```
QUANDO:  email_sent_at preenchido
ESPERAR: 72h
SE:      email_opened_at IS NULL AND sem bounce
ENTÃO:   reenvio com assunto diferente
```

**Assunto sugerido:** `[Somma] Seu desconto de R$ 22 expira — cupom SOMMAVIP`

**Por quê:** recupera cadastros que nunca viram o cupom (spam, assunto ignorado).

**Query Supabase:**
```sql
SELECT * FROM lista_vip
WHERE email_sent_at IS NOT NULL
  AND email_opened_at IS NULL
  AND email_sent_at < NOW() - INTERVAL '72 hours'
  AND email_status NOT IN ('bounced', 'complained', 'failed')
  AND reminder_not_opened_sent_at IS NULL; -- coluna a criar
```

---

#### 1.3 Nudge pós-clique sem compra (D+1)

```
QUANDO:  email_clicked_at preenchido (link TF Sports)
ESPERAR: 24h
SE:      status_cupom = 'ativo' (não comprou)
ENTÃO:   e-mail "Quase lá — falta só aplicar o cupom"
```

**Por quê:** clicou no app mas pode ter abandonado no checkout.

**Limitação:** sem webhook da TF Sports, `status_cupom` não atualiza sozinho. Até integrar, dispara para todos que clicaram.

**Conteúdo sugerido:**
- Reforço do passo 5 (`PRESALE_PASSOS`): aplicar cupom `SOMMAVIP`
- Print mental do valor caindo de R$ 119 para R$ 97
- CTA: reabrir evento no app

---

#### 1.4 E-mail da LP exclusiva (D+0, +2h)

```
QUANDO:  cadastro na lista_vip
ESPERAR: 2h após cadastro
SE:      email_clicked_at IS NULL (ainda não foi comprar)
ENTÃO:   e-mail "Conheça o Somma Special Day — acesso exclusivo"
```

**Por quê:** o e-mail atual foca na compra. A LP em `/acesso` (line-up, percurso, programação) é diferencial e aumenta engajamento antes da conversão.

**Conteúdo sugerido:**
- Link `/acesso` (login com CPF, e-mail ou código VIP)
- Destaques: Fit Dance, DJ, gincana, percurso 4 km
- "Antes de comprar, veja o que te espera"

---

### Prioridade 2 — Urgência e escassez

#### 2.1 Alerta de vagas acabando (80% do limite)

```
QUANDO:  count(lista_vip) >= 80% de presale_limit
ENTÃO:   broadcast para todos com status_cupom = 'ativo'
         "Restam X vagas no 1º lote da lista VIP"
```

**Implementação:**
- Job lê `app_settings` (`presale_limit`, `presale_start_at`)
- Conta cadastros elegíveis
- Dispara **uma vez** (flag `alerta_vagas_80_enviado` em `app_settings` ou tabela dedicada)

---

#### 2.2 Countdown para virada de lote

```
QUANDO:  data fixa (definir com TF Sports)
ENTÃO:   e-mail "Última chance: R$ 97 → preço sobe para R$ 119"
```

**Nota:** virada de lote é controlada no app TF Sports — alinhar data do e-mail com eles.

**Sugestão de datas (a confirmar):**
- D-7 do fim do 1º lote: "Falta 1 semana"
- D-1: "Último dia do 1º lote"

---

#### 2.3 Fechamento da lista VIP

```
QUANDO:  presale_open = false
ENTÃO:   e-mail final para quem NÃO comprou (status_cupom = 'ativo')
         "Lista VIP encerrada — última chance antes do 2º lote"
```

**Gatilho:** ao chamar `updatePresaleOpen(false)` em `actions/presale.ts`, disparar sequência ou broadcast.

---

### Prioridade 3 — Operacional e qualidade

#### 3.1 E-mail automático para leads criados pelo admin

```
QUANDO:  criarLeadListaVip (admin)
ENTÃO:  mesmo fluxo do cadastro público:
         - gerar codigo_unico + cupom SOMMAVIP
         - dispatchVipEmail
         - atualizar resend_email_id, email_status, email_sent_at
```

**Arquivo:** `actions/admin-leads.ts` — hoje só faz `insert` sem e-mail.

**Impacto:** correção operacional; leads manuais ficam paridade com cadastro público.

---

#### 3.2 Retry em falha de envio

```
QUANDO:  dispatchVipEmail retorna null
ENTÃO:  retry após 5 min (até 3 tentativas)
        + flag no admin: "falha no envio"
```

**Arquivo:** `actions/lista-vip.ts` → `dispatchVipEmail`

---

#### 3.3 Supressão de bounce/complaint

```
QUANDO:  webhook recebe bounced ou complained
ENTÃO:  parar todas as sequências para esse e-mail
        + badge vermelho no LeadManager
```

**Arquivo:** `app/api/webhooks/resend/route.ts` — já grava bounce; falta flag de supressão e bloqueio em jobs futuros.

---

#### 3.4 Botão "Reenviar cupom" no admin

```
AÇÃO MANUAL no LeadManager:
  → reenvia e-mail cupom para lead selecionado
  → atualiza resend_email_id e timestamps
```

**Por quê:** operação do dia a dia sem depender de automação.

---

### Prioridade 4 — Engajamento e viralidade

#### 4.1 Convite para indicar amigo (D+5)

```
QUANDO:  cadastro
ESPERAR: 5 dias
SE:      status_cupom = 'ativo' (não comprou)
ENTÃO:   e-mail "Chama um amigo pra lista VIP"
```

**Conteúdo:** mesmo CTA do WhatsApp em `FormSuccess` — link `/listavip`.

---

#### 4.2 Pré-evento: "Falta 1 mês" / "Falta 1 semana"

| Data | Público | Conteúdo |
|------|---------|----------|
| 18/06/2026 (1 mês antes) | Lista inteira ou só compradores | Programação completa, horários, local |
| 11/07/2026 (1 semana antes) | Compradores (quando houver tracking) | O que levar, horário 06h, como chegar COPMDF |

---

#### 4.3 WhatsApp para quem não abriu e-mail (opcional)

```
QUANDO:  72h sem abertura
SE:      telefone válido
ENTÃO:   mensagem curta com link /listavip ou cupom
```

**Limitação:** requer API WhatsApp (Meta Business, Twilio, etc.) — fora do Resend.

**Dado disponível:** campo `telefone` em `lista_vip`, hoje não utilizado.

---

## 5. Matriz segmento × automação

| Segmento | Condição | Automação | Prioridade |
|----------|----------|-----------|------------|
| Quente | `opened AND NOT clicked` | Lembrete D+2 | P1 |
| Frio | `sent AND NOT opened` | Reenvio D+3 | P1 |
| Muito quente | `clicked AND status_cupom='ativo'` | Nudge checkout D+1 | P1 |
| Novo engajado | `cadastro < 2h AND NOT clicked` | LP exclusiva | P1 |
| Admin manual | criado sem `email_sent_at` | Enviar cupom | P3 |
| Inválido | `bounced OR complained` | Suprimir | P3 |
| Todos ativos | `status_cupom='ativo'` | Urgência vagas/lote | P2 |
| Não converteu | `presale_open=false AND ativo` | Fechamento lista | P2 |
| Indicação | `cadastro D+5 AND ativo` | Convite amigo | P4 |
| Pré-evento | datas fixas | Programação / logística | P4 |

---

## 6. Roadmap em 3 fases

### Fase 1 — Esta semana (maior ROI, menor esforço)

| # | Automação | Tipo | Esforço |
|---|-----------|------|---------|
| 3.1 | Admin cria lead → envia cupom | Correção em `admin-leads.ts` | Baixo |
| 1.1 | Lembrete D+2 abriu sem clicar | Cron ou botão admin | Médio |
| 1.2 | Lembrete D+3 não abriu | Cron ou botão admin | Médio |
| 3.4 | Botão "Reenviar cupom" | UI admin | Baixo |

**Pré-requisitos técnicos:**
- Colunas de controle de envio (evitar reenvio duplicado):
  ```sql
  ALTER TABLE lista_vip ADD COLUMN IF NOT EXISTS reminder_opened_no_click_sent_at timestamptz;
  ALTER TABLE lista_vip ADD COLUMN IF NOT EXISTS reminder_not_opened_sent_at timestamptz;
  ALTER TABLE lista_vip ADD COLUMN IF NOT EXISTS reminder_post_click_sent_at timestamptz;
  ```
- Templates de e-mail para cada lembrete (novos arquivos em `lib/emails/`)
- Cron: Vercel Cron Job ou endpoint protegido chamado externamente

---

### Fase 2 — Próximas 2 semanas

| # | Automação | Tipo |
|---|-----------|------|
| 1.3 | Nudge pós-clique D+1 | Cron |
| 1.4 | LP exclusiva D+0 +2h | Cron ou Resend Automation |
| 2.1 | Alerta 80% vagas | Job + broadcast |
| 3.2 | Retry falha envio | Lógica em `lista-vip.ts` |
| 3.3 | Supressão bounce | Webhook + flag |

---

### Fase 3 — Pré-evento (julho/2026)

| # | Automação | Tipo |
|---|-----------|------|
| 2.2 | Countdown virada de lote | Broadcast agendado |
| 2.3 | Fechamento lista VIP | Hook em `updatePresaleOpen` |
| 4.1 | Convite indicar amigo D+5 | Cron |
| 4.2 | Pré-evento 1 mês / 1 semana | Broadcast agendado |

---

### Fase 4 — Opcional / futuro

| # | Automação | Dependência |
|---|-----------|-------------|
| 4.3 | WhatsApp | API WhatsApp |
| — | Tracking compra TF Sports | Webhook ou import manual |
| — | Migração para Resend Automations | Templates publicados + contatos Resend |
| — | Segmentação avançada no Resend | `add_to_segment` nos fluxos |

---

## 7. O que NÃO fazer agora

| Ideia | Motivo |
|-------|--------|
| Sequência longa (5+ e-mails) | Evento em ~5 semanas; 2–3 follow-ups bastam |
| Automação 100% Resend sem ponte webhook | Mais complexo que cron + Supabase no estado atual |
| E-mail diário | Risco de spam / unsubscribe |
| Segmentar por `sexo` | Sem hipótese de negócio clara |
| Tracking automático de compra | TF Sports não integra — marcar manual no admin |
| Broadcast para lista inteira sem filtro | Respeitar bounces e quem já comprou |

---

## 8. Como implementar (decisões técnicas)

### Opção A — Cron + Supabase (recomendado para Fase 1)

```
Vercel Cron (ex.: 0 10 * * *) 
  → GET /api/cron/email-reminders (protegido por CRON_SECRET)
  → query Supabase por segmento
  → resend.emails.send() com template do lembrete
  → atualiza coluna *_sent_at no lead
```

**Vantagens:** usa dados existentes, sem migrar para templates Resend, implementação rápida.

### Opção B — Resend Automations (médio prazo)

```
submitListaVip 
  → resend.events.send({ event: 'vip.signed_up', email, payload: { nome, cupom } })
  → Automação Resend executa sequência
```

**Pré-requisitos:**
- Templates publicados no Resend (migrar HTML de `vip-ticket.ts`)
- Contatos sincronizados no Resend (ou disparo por `email`)
- Ponte webhook → `events.send` para cliques/aberturas em fluxos com `wait_for_event`

### Opção C — Botão manual no admin

```
LeadManager 
  → filtro "abriu, não clicou"
  → botão "Enviar lembrete agora"
  → server action → query filtrada → send em lote
```

**Vantagens:** controle total, sem cron, bom para testar copy antes de automatizar.

### Variáveis de ambiente necessárias

| Variável | Uso |
|----------|-----|
| `RESEND_API_KEY` | Já existe |
| `VIP_EMAIL_FROM` | Já existe |
| `RESEND_WEBHOOK_SECRET` | Já existe (recomendado exigir em produção) |
| `CRON_SECRET` | Proteger endpoint de cron (a criar) |

### Novos templates de e-mail sugeridos

| Arquivo sugerido | Automação |
|------------------|-----------|
| `lib/emails/reminder-opened-no-click.ts` | 1.1 |
| `lib/emails/reminder-not-opened.ts` | 1.2 |
| `lib/emails/nudge-post-click.ts` | 1.3 |
| `lib/emails/exclusive-lp.ts` | 1.4 |
| `lib/emails/urgency-slots.ts` | 2.1 |
| `lib/emails/lote-countdown.ts` | 2.2 |
| `lib/emails/presale-closed.ts` | 2.3 |
| `lib/emails/invite-friend.ts` | 4.1 |
| `lib/emails/pre-event.ts` | 4.2 |

---

## 9. Checklist para retomar

Ao voltar para implementar, definir:

- [ ] **Fase alvo:** 1, 2 ou 3?
- [ ] **Mecanismo:** cron automático, botão manual, ou Resend Automations?
- [ ] **Delays:** 48h / 72h / 24h — confirmar ou ajustar
- [ ] **Copy:** texto de cada e-mail (assunto + corpo) — usar sugestões deste doc ou redigir novas
- [ ] **Limite de reenvio:** 1 lembrete por tipo por lead (colunas `*_sent_at`)
- [ ] **Data do fim do 1º lote** (alinhar com TF Sports) para automações 2.2 e 2.3
- [ ] **Cron schedule:** horário do job (sugestão: 10h BRT diário)
- [ ] **Teste:** enviar para e-mail próprio antes de disparar em massa

### Prompt sugerido para retomar no chat

> "Quero implementar a Fase 1 do doc `docs/automacoes-email-vip.md`.  
> Usar cron automático. Delays: 48h e 72h. Começar pela automação 1.1 e 3.1."

---

## Referências

- [Resend Automations — introdução](https://resend.com/docs/dashboard/automations/introduction)
- [Resend Custom Events](https://resend.com/docs/dashboard/automations/custom-events)
- [Resend Runs (monitoramento)](https://resend.com/docs/dashboard/automations/runs)
- [Resend Pricing — automations](https://resend.com/pricing)
- Código do projeto: `lib/presale-constants.ts`, `actions/lista-vip.ts`, `app/api/webhooks/resend/route.ts`

---

*Documento vivo — atualizar conforme decisões de implementação e feedback da TF Sports.*
