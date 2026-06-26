-- =========================================================================
-- SOMMA GPS Tracking — consolidação (GPS + relógio) e calibração por corredor
-- Rode no Supabase (SQL Editor). Idempotente.
-- =========================================================================

alter table gps_tracking_sessions
  add column if not exists consolidated jsonb,            -- resultado oficial reconciliado
  add column if not exists calibration_factor numeric;    -- distancia_relogio / distancia_gps

-- Calibração acumulada por corredor (chave = nome normalizado, MVP sem auth).
create table if not exists gps_tracking_calibration (
  runner_key text primary key,
  distance_factor numeric not null,
  samples integer not null default 1,
  updated_at timestamptz not null default now()
);
alter table gps_tracking_calibration enable row level security;
