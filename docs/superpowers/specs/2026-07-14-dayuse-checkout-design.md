# Página /dayuse — Ingresso Day Use com checkout Asaas

**Data:** 2026-07-14
**Evento:** Somma Special Day — sábado 18/07/2026, 07h

## Objetivo

Criar a página `/dayuse` em `specialday.sommaclub.com.br` para vender o ingresso **Day Use** (R$ 75) a quem quer participar só do after do evento, sem correr e sem kit. A página deixa claras as regras, apresenta a programação/atrações e permite comprar o ingresso via **cartão de crédito (à vista)** ou **PIX**, usando o Asaas (checkout transparente), espelhando o fluxo já existente no projeto `NOVO-SITE-SOMMA-V3`.

## Regras que a página deve comunicar

1. ❌ **Não dá direito ao kit.**
2. ❌ **Não dá direito ao corre** (a corrida de 4/8 km).
3. ✅ **Dá acesso a todo o after.**
4. Programação do dia (do after).
5. Show ao vivo: **Resenha do Sabino**.
6. **Gincana Somma.**
7. **Sorteios** — Day Use concorre aos sorteios, **exceto o sorteio do Adidas Evo SL**, que é exclusivo de quem comprou o kit.

## Escopo

**Incluído:**
- Página única `/dayuse` no visual neo-brutalista do Special Day (Bebas, blocos com sombra, paleta `somma-*`).
- Checkout transparente Asaas (cartão à vista 1x + PIX), portado do V3 para este projeto.
- Persistência dos pedidos numa nova tabela Supabase `dayuse_orders`.

**Fora de escopo (confirmado):**
- E-mail de confirmação.
- QR/código de check-in.
- Cupom de desconto.
- Parcelamento no cartão (venda é à vista, 1x R$ 75).
- Webhook Asaas (confirmação do comprador é via polling client-side, como no V3).

## Arquitetura

### Página
- `app/dayuse/page.tsx` — Server Component, monta as seções na ordem abaixo.
- Componentes novos em `components/special-day/dayuse/`.

**Seções (ordem):**
1. `DayUseHero` — título "Day Use · Special Day", data 18/07, preço R$ 75, CTA "Garantir meu Day Use" (âncora que rola até o checkout).
2. `DayUseInclui` — card de regras: o que **não** inclui (kit, corre) e o que **inclui** (todo o after). Visualmente inequívoco (❌ vermelho / ✅ verde ou destaque).
3. `DayUsePrograma` — programação do after. Reaproveita o conteúdo de `ScheduleSection` (array `PROGRAMACAO`), marcando o bloco "Treinão/Corre Somma" como *não incluso no Day Use*.
4. `DayUseShow` — destaque do show ao vivo **Resenha do Sabino**.
5. `DayUseGincana` — bloco da Gincana Somma.
6. `DayUseSorteios` — lista de sorteios + aviso destacado de que o **Adidas Evo SL é exclusivo de quem comprou o kit** (Day Use não concorre a esse item).
7. `DayUseCheckout` — client component com o formulário de pagamento.

### Checkout — `DayUseCheckout` (client component)

Máquina de estados de página: `form → processing → success | error | pix`.

**Campos sempre exigidos:** nome, e-mail, CPF, WhatsApp.
**Toggle de pagamento:** Cartão de Crédito | PIX.
- **Cartão (à vista, 1x R$ 75):** + número, nome impresso, validade (mês/ano), CVV, e CEP + número do endereço (exigidos pelo `creditCardHolderInfo` do Asaas). CEP autopreenche via BrasilAPI (como no V3).
- **PIX:** gera QR Code + copia-e-cola; tela `pix` com polling de status a cada 3s (teto ~20 min / 400 tentativas, como no V3).

Fluxo de submit (espelha `checkout-form.tsx` do V3, simplificado para 1 produto à vista):
1. `POST /api/dayuse/customer` → cria/recupera customer no Asaas, retorna `customerId`.
2. `POST /api/dayuse/payment` com `{ customerId, method: "card" | "pix", ...dados }`:
   - grava o pedido em `dayuse_orders` com `status_pagamento = "Pendente"`;
   - cria a cobrança em `/payments` no Asaas (billingType `CREDIT_CARD` ou `PIX`, `value: 75`, `dueDate: hoje`);
   - para cartão: inclui `creditCard`, `creditCardHolderInfo`, `remoteIp` (lido do header `x-forwarded-for` no servidor). Se aprovado na hora (`CONFIRMED`/`RECEIVED`), atualiza o pedido para `Pago` e retorna sucesso;
   - para PIX: retorna `paymentId`.
3. PIX: `GET /api/dayuse/pix?paymentId=...` → QR (`encodedImage`, `payload`, `expirationDate`).
4. PIX: cliente faz polling em `GET /api/dayuse/payment-status?paymentId=...`; quando `paid`, a rota atualiza `dayuse_orders.status_pagamento = "Pago"` e o cliente vai para `success`.

### Rotas API novas (em `app/api/dayuse/`)

Espelham o padrão do V3 (`ASAAS_API_URL = "https://api.asaas.com/v3"`, header `access_token: process.env.ASAAS_API_KEY`).

- `POST /api/dayuse/customer` — cria customer no Asaas (name, email, cpfCnpj, phone). Sem `groupName`/professor (não se aplica).
- `POST /api/dayuse/payment` — cria a cobrança (cartão ou PIX) e grava/atualiza `dayuse_orders`. Lê IP do request no servidor (dispensa a rota `/api/client-ip` do V3).
- `GET /api/dayuse/pix?paymentId=` — busca o QR Code PIX.
- `GET /api/dayuse/payment-status?paymentId=` — retorna status; ao detectar pago, marca o pedido como `Pago`.

Persistência usa o client service-role do Supabase já existente no projeto (`lib/supabase/`), padrão das rotas admin.

### Banco — nova tabela `dayuse_orders`

Migração em `supabase/`. Colunas:

| coluna | tipo | notas |
|---|---|---|
| id | uuid pk default gen_random_uuid() | |
| created_at | timestamptz default now() | |
| nome | text | |
| email | text | |
| cpf | text | dígitos |
| telefone | text | |
| valor | numeric | 75.00 |
| forma_pagamento | text | `Cartão de Crédito` \| `PIX` |
| asaas_customer_id | text | |
| asaas_payment_id | text | index para lookup no polling |
| status_pagamento | text | `Pendente` \| `Pago` |

RLS: acesso apenas via service-role (mesmo padrão das tabelas de evento existentes).

## Pré-requisito operacional

`ASAAS_API_KEY` **não existe** no `.env.local` deste projeto. O código usará `process.env.ASAAS_API_KEY` (mesma conta de produção do V3). É preciso adicionar essa variável no `.env.local` local e na Vercel antes do deploy. Sem essa chave, o checkout retorna erro.

## Conteúdo (copy) a definir na implementação

- **Sorteios:** lista dos prêmios sorteados (além do Adidas Evo SL, que fica de fora do Day Use). Se a lista final não estiver disponível, usar copy genérica ("vários sorteios ao longo do dia") + o aviso do Adidas.
- **Resenha do Sabino:** breve descrição do show.
- Textos das seções seguem o tom das seções existentes do Special Day.

## Testes / verificação

- Fluxo cartão aprovado → tela de sucesso + linha em `dayuse_orders` com `Pago`.
- Fluxo cartão recusado → tela de erro, pedido fica `Pendente`.
- Fluxo PIX → QR gerado, polling detecta pagamento (teste sandbox/manual) → `Pago`.
- Página responsiva (mobile-first, como o resto do Special Day).
- Sem `ASAAS_API_KEY`: erro tratado, sem quebrar a página.
