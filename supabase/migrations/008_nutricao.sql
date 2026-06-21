-- Sequencia de nutricao por e-mail para leads capturados na home.
-- Independente da lista_vip / vip_campaign_*.

-- 1) Leads de nutricao (capturados pelo form da home)
CREATE TABLE IF NOT EXISTS public.nutricao_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL UNIQUE,
  telefone text,
  source text NOT NULL DEFAULT 'home',
  -- tracking via Resend
  resend_email_id text,
  email_status text,
  email_open_count integer NOT NULL DEFAULT 0,
  email_click_count integer NOT NULL DEFAULT 0,
  last_opened_at timestamptz,
  last_clicked_at timestamptz,
  -- automacao
  jump_to_final boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nutricao_leads_email ON public.nutricao_leads (email);
CREATE INDEX IF NOT EXISTS idx_nutricao_leads_resend_email_id ON public.nutricao_leads (resend_email_id);
CREATE INDEX IF NOT EXISTS idx_nutricao_leads_created_at ON public.nutricao_leads (created_at);

ALTER TABLE public.nutricao_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access nutricao_leads" ON public.nutricao_leads;
CREATE POLICY "Service role full access nutricao_leads" ON public.nutricao_leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2) Registro de envios (dedup por lead + step)
CREATE TABLE IF NOT EXISTS public.nutricao_sends (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.nutricao_leads (id) ON DELETE CASCADE,
  step text NOT NULL,
  resend_email_id text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lead_id, step)
);

CREATE INDEX IF NOT EXISTS idx_nutricao_sends_step ON public.nutricao_sends (step);
CREATE INDEX IF NOT EXISTS idx_nutricao_sends_lead_id ON public.nutricao_sends (lead_id);
CREATE INDEX IF NOT EXISTS idx_nutricao_sends_resend_email_id ON public.nutricao_sends (resend_email_id);

ALTER TABLE public.nutricao_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access nutricao_sends" ON public.nutricao_sends;
CREATE POLICY "Service role full access nutricao_sends" ON public.nutricao_sends
  FOR ALL TO service_role USING (true) WITH CHECK (true);
