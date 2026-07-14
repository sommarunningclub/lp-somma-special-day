# Admin Day Use — validação de pedidos

**Data:** 2026-07-14
**Branch:** feat/dayuse-checkout

## Objetivo

Adicionar em `/admin` uma área para validar os pedidos de Day Use do Special Day:
ver todos os dados da compra, buscar por nome/e-mail/CPF, validar a entrega da
pulseira, reenviar o e-mail de comprovante e editar as informações do pedido.

## Decisões

- **Validação da pulseira:** botão marca "entregue" gravando data/hora; permite
  reverter (desmarcar). Só habilitado para pedidos `Pago`.
- **Edição:** todos os campos editáveis (nome, e-mail, CPF, telefone,
  forma_pagamento, valor, status_pagamento).
- **Escopo de reenvio/validação:** apenas pedidos com `status_pagamento = 'Pago'`.

## Banco — migration `014_dayuse_pulseira.sql`

Adicionar à tabela `public.dayuse_orders`:

- `pulseira_entregue boolean NOT NULL DEFAULT false`
- `pulseira_entregue_em timestamptz` — data/hora da entrega (null quando não entregue)

## Página — `app/admin/dayuse/page.tsx`

- Server component; `export const dynamic = 'force-dynamic'`, `runtime = 'nodejs'`.
- Gate: `if (!(await isAuthenticated())) redirect('/login-admin')`.
- Carrega todos os pedidos via service-role client (`createClient` com
  `SUPABASE_SERVICE_ROLE_KEY`), ordenados por `created_at desc`.
- Visual seguindo os demais admins (bg somma-cream, fontes bebas/dm, header com
  título e link "← Admin").
- Passa os pedidos para o client component.

## Client component — `components/admin/dayuse/DayUseAdminDashboard.tsx`

- **Busca** por nome, e-mail ou CPF (filtro client-side; CPF normalizado sem máscara).
- **Cards de resumo:** total de pedidos, total pagos, pulseiras entregues.
- **Tabela/lista** com todos os dados: nome, e-mail, CPF, telefone, valor, forma,
  status do pagamento, data, status da pulseira.
- **Ações por linha:**
  - Badge de status do pagamento (Pendente/Pago/Cancelado).
  - **Validar pulseira** — toggle marcar/desmarcar; habilitado só se `Pago`.
  - **Reenviar e-mail** — habilitado só se `Pago`.
  - **Editar** — abre modal com todos os campos.
- **Modal de edição:** todos os campos; salva via API PATCH; atualiza o estado local.
- Estados de loading/erro por ação; feedback de sucesso.

## Rotas API

Todas com gate admin (`isAuthenticated()` → 401), `runtime = 'nodejs'`,
service-role client.

### `PATCH app/api/admin/dayuse/[id]/route.ts`

- Edita campos do pedido: `nome, email, cpf, telefone, forma_pagamento, valor,
  status_pagamento`.
- Toggle da pulseira: quando recebe `pulseira_entregue`, grava/limpa
  `pulseira_entregue_em` (`now()` ao marcar, `null` ao desmarcar).
- Validação: `forma_pagamento` ∈ {Cartão de Crédito, PIX}; `status_pagamento` ∈
  {Pendente, Pago, Cancelado}; CPF/telefone normalizados sem máscara.
- Guard-rail: marcar pulseira só se `status_pagamento = 'Pago'` (409 caso contrário).

### `POST app/api/admin/dayuse/[id]/resend/route.ts`

- Só se pedido `Pago` (409 caso contrário) e com `asaas_payment_id`.
- Busca o payment no Asaas (`GET /payments/:id`) para obter `receiptUrl`
  (`transactionReceiptUrl || invoiceUrl`) e data de pagamento.
- Chama `sendDayUseConfirmation` com os dados do pedido.
- Retorna sucesso/erro (não derruba fluxo — segue o padrão do envio existente).

## Acesso

Adicionar link/card "Day Use" em `app/admin/page.tsx` apontando para `/admin/dayuse`.

## Guard-rails / erros

- Reenvio e validar-pulseira → 409 se status ≠ Pago.
- Toggle de pulseira grava/limpa timestamp conforme o novo valor.
- Todas as rotas exigem sessão admin.
