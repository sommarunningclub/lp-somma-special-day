# Concurso Junino SOMMA

Sistema de inscrição, galeria, votação (1 voto/CPF) e ranking ao vivo do Esquenta Junino.

## Rotas
- `/esquenta-junino/concurso` — institucional + CTAs
- `/esquenta-junino/concurso/participar` — inscrição
- `/esquenta-junino/concurso/minha-inscricao` — área privada (acesso por código no e-mail)
- `/esquenta-junino/concurso/looks` — galeria + votação
- `/esquenta-junino/concurso/looks/[slug]` — página individual (OG dinâmico)
- `/esquenta-junino/concurso/ranking` — corrida pelo prêmio (ao vivo)
- `/admin/concurso-junino` — painel admin (protegido)

## Variáveis de ambiente
| Var | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL` | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | acesso server-side (RLS bypass) |
| `VOTER_HASH_SECRET` | HMAC do CPF (`cpf_hash`/`voter_hash`) — **nunca** salva CPF em texto |
| `PARTICIPANT_SESSION_SECRET` | assina o cookie de sessão do participante |
| `RESEND_API_KEY` + `VIP_EMAIL_FROM` | e-mail do código de acesso (OTP) |
| `ADMIN_SECRET_KEY` (ou `SESSION_SECRET`) | login do admin (`/login-admin`) |

> Os 2 segredos do concurso já estão no Vercel (produção). Para rodar local: `vercel env pull`.

## Migrations
Rode no **Supabase → SQL Editor**: [`supabase/migrations/0001_concurso_junino.sql`](../supabase/migrations/0001_concurso_junino.sql).
Cria tabelas (`contest_settings`, `contest_participants`, `contest_votes`, `contest_vote_attempts`, `contest_admin_audit_logs`), índices, RLS (nega anon; service role no servidor) e views públicas seguras. Idempotente.

## Storage
Bucket **privado** `contest-junino` (já criado). Fotos são guardadas como _path_ e servidas por **signed URL** (2h) só para itens publicados. Ao excluir uma inscrição, as fotos são removidas.

## Admin
1. Acesse `/login-admin` e entre com `ADMIN_SECRET_KEY`.
2. Vá em `/admin/concurso-junino`.
3. Lá dá pra: filtrar/buscar inscrições, ver fotos, publicar/esconder/desqualificar/excluir, editar dados, exportar CSV (inscritos / votos agregados) e configurar o concurso. CPF de eleitores **nunca** é exibido (só existe como hash).

## Ativar / desativar o concurso
No admin (aba **Configurações**) ou direto na tabela `contest_settings`:
- `is_active` — liga/desliga tudo
- `is_registration_open` — abre/fecha inscrições (respeita `registration_starts_at/ends_at`)
- `is_voting_open` — abre/fecha votação (respeita `voting_starts_at/ends_at`)
- `show_vote_count_publicly` — mostra/esconde nº de votos no público
- `max_photos` — 1 ou 2

## Votação (anti-fraude)
- 1 voto por CPF garantido por índice único em `voter_hash` (HMAC).
- Honeypot no form + rate-limit por IP (`contest_vote_attempts`) e por sessão (cookie).
- Falhas retornam mensagem genérica (não revela se um CPF já votou).
- Inserção de voto só via `POST /api/concurso/votar` (server). Inserção direta por client é bloqueada por RLS.

## Testar localmente
```bash
vercel env pull          # baixa as envs (inclui os segredos)
npm install
npm run dev
```
1. `/esquenta-junino/concurso/participar` → cria inscrição (1+ foto) → cai na área privada e publica.
2. `/esquenta-junino/concurso/looks` → vota (CPF válido). Tentar votar 2x com o mesmo CPF deve falhar genericamente.
3. `/esquenta-junino/concurso/ranking` → acompanha a corrida (atualiza por poll).
4. `/admin/concurso-junino` → gestão (após login em `/login-admin`).
</content>
