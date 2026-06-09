-- Pré-venda Somma Special Day: cupom fixo (SOMMAVIP) + limite de vagas configurável no admin.
-- Rode este arquivo no SQL Editor do Supabase.

-- 1) Tabela de configurações simples (chave/valor)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access settings" ON public.app_settings;
CREATE POLICY "Service role full access settings" ON public.app_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2) Limite REAL da pré-venda (inclui a folga oculta). O público sempre vê "100 vagas".
--    Comece com folga: 110. Ajuste no admin quando quiser.
INSERT INTO public.app_settings (key, value)
VALUES ('presale_limit', '110')
ON CONFLICT (key) DO NOTHING;

-- 3) Marco zero da contagem. Cadastros anteriores a este instante NÃO contam para as vagas.
INSERT INTO public.app_settings (key, value)
VALUES ('presale_start_at', now()::text)
ON CONFLICT (key) DO NOTHING;

-- 4) Cupom exibido ao usuário (rastreabilidade no admin).
ALTER TABLE public.lista_vip
  ADD COLUMN IF NOT EXISTS cupom text;
