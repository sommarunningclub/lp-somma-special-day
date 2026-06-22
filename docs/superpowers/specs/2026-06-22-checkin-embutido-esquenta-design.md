# Check-in embutido na landing do Esquenta

Design / spec · 2026-06-22

## Objetivo

Permitir que o usuário faça a **jornada completa de check-in dentro da página `/esquenta-junino`**
(projeto specialday / 1-ano-SommaDay), gravando o registro no evento já criado na gestão
("ESQUENTA SOMMA SPECIAL DAY", id `83b744b2-e3a5-42fa-b5c4-09bdbcdf0d70`), na tabela `checkins`.

Como os dois projetos (site público, gestão e specialday) compartilham o **mesmo Supabase**
(`riqfjewvygqsbuokvsjw`) e a **mesma tabela `checkins`**, o check-in feito na landing aparece
automaticamente no painel da gestão (módulo Check-in + contador do evento).

## Contexto verificado

- `eventos` e `checkins` são compartilhadas pelos 3 apps no Supabase `riqfjewvygqsbuokvsjw`.
- O `/check-in` do site público grava em `checkins` via `POST /api/checkin` (service role):
  campos `nome_completo, email, telefone, cpf, sexo, pelotao|null, data_do_evento,
  nome_do_evento, evento_id, data_hora_checkin, validacao_do_checkin=false`; dedupe por
  `evento_id` + `cpf` (com/sem formatação) → 409.
- Evento alvo: tipo `personalizado` (sem pelotão), `checkin_status` controlado pela gestão
  (manual + cron por `checkin_abertura`/`checkin_fechamento`). Abre 22/06 11:34.

## Arquitetura (tudo no projeto specialday)

### Config
`lib/esquenta-constants.ts` → `ESQUENTA.checkinEventoId = '83b744b2-e3a5-42fa-b5c4-09bdbcdf0d70'`.

### Rotas de API (Supabase service role)
- `GET /api/checkin/evento?id=<uuid>` → `{ id, titulo, data_evento, tipo, checkin_status, pelotoes }`.
  Usado pelo widget para renderizar o estado correto. Sem id válido → 400.
- `POST /api/checkin` → réplica fiel da lógica do site público:
  1. valida `nome_completo, email, telefone, cpf, sexo` (400 se faltar);
  2. dedupe por `evento_id` + cpf (limpo e formatado) → 409 com mensagem amigável;
  3. insert em `checkins` com os mesmos campos do site público (`validacao_do_checkin=false`,
     `data_hora_checkin=now`).

### Componente `components/esquenta/EsquentaCheckin.tsx` (client, `id="check-in"`)
1. On mount: `GET /api/checkin/evento?id=<checkinEventoId>`.
2. Render por `checkin_status`:
   - `bloqueado` → "Check-in abre em breve" (estado informativo).
   - `encerrado` → "Check-in encerrado".
   - `aberto` → formulário: nome, e-mail, telefone (máscara), CPF (máscara), sexo.
     Se `tipo === 'corrida'` e houver `pelotoes`, mostra seleção de pelotão; tipo
     `personalizado` não mostra (caso do Esquenta).
   - erro de fetch → fallback mostrando o formulário (não trava o usuário).
3. Submit → `POST /api/checkin` (envia `evento_id`, `nome_do_evento`, `data_do_evento` do
   evento carregado) → estado de sucesso ("Check-in confirmado!").
4. Visual SOMMA (tokens, mesmos padrões de input do `PresaleSignupForm`).

### Página
`app/esquenta-junino/page.tsx` → inserir `<EsquentaCheckin />` **logo após `<EsquentaHero />`**.
`ESQUENTA.participarHref` passa a ser `#check-in` (CTAs "Quero participar" do Hero e do CTA final).

## Fora de escopo
- Não altera o site público (`sommaclub.com.br`) nem a gestão.
- Não cria/edita evento (isso é feito na gestão).
- Não mexe em pelotão/validação além do necessário.
- Divergência de local (gestão: "Parque da Cidade"; landing: "106 Sul") é decisão de conteúdo,
  não afeta o check-in — sinalizar ao usuário.

## Verificação
- Build + typecheck.
- `GET /api/checkin/evento` retorna o status real do evento.
- Teste de `POST /api/checkin` (1 registro de teste) → conferir no painel da gestão e remover.
