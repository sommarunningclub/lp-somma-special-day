ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_vip ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON public.propostas;
DROP POLICY IF EXISTS "Public read by slug" ON public.propostas;
DROP POLICY IF EXISTS "Service role full access" ON public.lista_vip;

CREATE POLICY "Service role full access" ON public.propostas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public read proposals" ON public.propostas
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role full access" ON public.lista_vip
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
