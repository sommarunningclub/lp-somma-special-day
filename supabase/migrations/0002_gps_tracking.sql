-- =========================================================================
-- SOMMA GPS Tracking (MVP) — sessões e pontos de GPS
-- Rode no Supabase (SQL Editor). Idempotente.
-- RLS nega tudo pra anon; todo acesso passa por rotas server (service role).
-- O participante acessa a própria sessão só pelo TOKEN (guardamos só o hash).
-- =========================================================================

create extension if not exists pgcrypto;

-- ----- sessões ------------------------------------------------------------
create table if not exists gps_tracking_sessions (
  id uuid primary key default gen_random_uuid(),
  tracking_token_hash text unique not null,
  participant_name text not null,
  reference_location_name text,
  reference_lat numeric,
  reference_lng numeric,
  planned_route_polyline text,
  status text not null default 'created',  -- created | running | paused | finished | cancelled
  started_at timestamptz,
  paused_at timestamptz,
  finished_at timestamptz,
  total_distance_m numeric not null default 0,
  total_duration_seconds integer not null default 0,
  average_pace_seconds_per_km numeric,
  latest_lat numeric,
  latest_lng numeric,
  latest_accuracy_m numeric,
  last_point_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_gps_sessions_status on gps_tracking_sessions(status);
create index if not exists idx_gps_sessions_last_point on gps_tracking_sessions(last_point_at desc);
create index if not exists idx_gps_sessions_created on gps_tracking_sessions(created_at desc);

-- ----- pontos -------------------------------------------------------------
create table if not exists gps_tracking_points (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references gps_tracking_sessions(id) on delete cascade,
  latitude numeric not null,
  longitude numeric not null,
  accuracy_m numeric,
  altitude_m numeric,
  speed_mps numeric,
  heading numeric,
  captured_at timestamptz not null,
  received_at timestamptz not null default now(),
  is_valid boolean not null default true,
  rejection_reason text,
  created_at timestamptz not null default now()
);
create index if not exists idx_gps_points_session on gps_tracking_points(session_id);
create index if not exists idx_gps_points_captured on gps_tracking_points(captured_at);
create index if not exists idx_gps_points_session_captured on gps_tracking_points(session_id, captured_at);
-- evita duplicado exato (mesmo ponto reenviado pela fila offline)
create unique index if not exists uq_gps_points_dedupe on gps_tracking_points(session_id, captured_at, latitude, longitude);

-- ----- RLS: liga em tudo; sem policies => anon negado; service_role bypassa
alter table gps_tracking_sessions enable row level security;
alter table gps_tracking_points   enable row level security;

-- updated_at automático nas sessões
create or replace function gps_touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;
drop trigger if exists trg_gps_sessions_touch on gps_tracking_sessions;
create trigger trg_gps_sessions_touch before update on gps_tracking_sessions
  for each row execute function gps_touch_updated_at();
