-- =========================================================================
-- Concurso Junino SOMMA — schema, índices, RLS e views públicas
-- Rode no Supabase (SQL Editor). Idempotente.
-- CPF nunca é armazenado em texto: só cpf_hash / voter_hash (HMAC-SHA256).
-- RLS nega tudo pra anon; todo acesso passa por rotas server (service role).
-- Views públicas expõem só colunas seguras (sem email/whatsapp/cpf).
-- =========================================================================

create extension if not exists pgcrypto;

do $$ begin
  create type contest_status as enum ('draft','published','hidden','disqualified','deleted');
exception when duplicate_object then null; end $$;

-- ----- configurações (linha única) ---------------------------------------
create table if not exists contest_settings (
  id int primary key default 1,
  contest_name text not null default 'Concurso Junino SOMMA',
  is_registration_open boolean not null default true,
  is_voting_open boolean not null default true,
  registration_starts_at timestamptz,
  registration_ends_at timestamptz,
  voting_starts_at timestamptz,
  voting_ends_at timestamptz,
  prize_title text default '',
  rules_content text default '',
  max_photos int not null default 2,
  show_vote_count_publicly boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contest_settings_singleton check (id = 1)
);
insert into contest_settings (id) values (1) on conflict (id) do nothing;

-- ----- participantes ------------------------------------------------------
create table if not exists contest_participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  display_name text not null,
  email text not null,
  whatsapp text,
  cpf_hash text not null,
  instagram_handle text,
  city text,
  look_title text not null,
  look_description text,
  main_photo_url text,   -- path no bucket privado (não URL pública)
  second_photo_url text, -- path
  status contest_status not null default 'draft',
  slug text unique not null,
  access_code_hash text,            -- OTP de acesso (sha256), transitório
  access_code_expires_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_cp_status on contest_participants(status);
create index if not exists idx_cp_published_at on contest_participants(published_at desc);
create unique index if not exists uq_cp_cpf_active on contest_participants(cpf_hash) where status <> 'deleted';

-- ----- votos (1 por CPF garantido pelo índice único) ----------------------
create table if not exists contest_votes (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references contest_participants(id) on delete cascade,
  voter_hash text not null,
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now()
);
create unique index if not exists uq_votes_voter on contest_votes(voter_hash);
create index if not exists idx_votes_participant on contest_votes(participant_id);

-- ----- tentativas de voto (rate limit por IP) -----------------------------
create table if not exists contest_vote_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_attempts_ip_time on contest_vote_attempts(ip_hash, created_at desc);

-- ----- auditoria de admin -------------------------------------------------
create table if not exists contest_admin_audit_logs (
  id bigint generated always as identity primary key,
  admin_user_id text,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ----- RLS: liga em tudo; sem policies => anon negado; service_role bypassa
alter table contest_settings        enable row level security;
alter table contest_participants    enable row level security;
alter table contest_votes           enable row level security;
alter table contest_vote_attempts   enable row level security;
alter table contest_admin_audit_logs enable row level security;

-- ----- views públicas (só colunas seguras de participantes publicados) -----
create or replace view contest_public_participants as
  select id, display_name, city, instagram_handle, look_title, look_description,
         main_photo_url, second_photo_url, slug, published_at
  from contest_participants
  where status = 'published';

create or replace view contest_public_leaderboard as
  select p.id, p.slug, p.display_name, p.city, p.look_title,
         p.main_photo_url, p.published_at,
         coalesce(v.votes, 0)::int as votes
  from contest_participants p
  left join (
    select participant_id, count(*)::int as votes
    from contest_votes group by participant_id
  ) v on v.participant_id = p.id
  where p.status = 'published';

grant select on contest_public_participants to anon, authenticated;
grant select on contest_public_leaderboard  to anon, authenticated;

-- updated_at automático
create or replace function contest_touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;
drop trigger if exists trg_cp_touch on contest_participants;
create trigger trg_cp_touch before update on contest_participants
  for each row execute function contest_touch_updated_at();
drop trigger if exists trg_cs_touch on contest_settings;
create trigger trg_cs_touch before update on contest_settings
  for each row execute function contest_touch_updated_at();
