-- Rastreamento de e-mails (Resend): entregue / aberto / clicado.
-- Rode no SQL Editor do Supabase.

-- 1) Colunas de status do e-mail em cada lead
ALTER TABLE public.lista_vip
  ADD COLUMN IF NOT EXISTS resend_email_id text,
  ADD COLUMN IF NOT EXISTS email_status text,
  ADD COLUMN IF NOT EXISTS email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_clicked_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_bounced_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_open_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS email_click_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_lista_vip_resend_email_id ON public.lista_vip (resend_email_id);
CREATE INDEX IF NOT EXISTS idx_lista_vip_email_status ON public.lista_vip (email_status);

-- 2) Histórico bruto de eventos (inclui o link clicado)
CREATE TABLE IF NOT EXISTS public.email_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES public.lista_vip (id) ON DELETE SET NULL,
  email text,
  resend_email_id text,
  type text NOT NULL,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_events_lead_id ON public.email_events (lead_id);
CREATE INDEX IF NOT EXISTS idx_email_events_email ON public.email_events (email);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON public.email_events (type);

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access email_events" ON public.email_events;
CREATE POLICY "Service role full access email_events" ON public.email_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
