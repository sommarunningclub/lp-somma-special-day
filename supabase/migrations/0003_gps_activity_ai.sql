-- =========================================================================
-- SOMMA GPS Tracking — tipo de corrida + relatório com foto do relógio (IA)
-- Rode no Supabase (SQL Editor). Idempotente.
-- =========================================================================

alter table gps_tracking_sessions
  add column if not exists activity_type text not null default 'rua', -- rua | esteira | caminhada
  add column if not exists watch_photo_url text,        -- path no bucket privado gps-watch
  add column if not exists watch_metrics jsonb,         -- métricas extraídas do relógio (IA)
  add column if not exists ai_report text;              -- relatório final gerado pela IA
