CREATE TABLE IF NOT EXISTS public.lista_vip (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  cpf text UNIQUE NOT NULL,
  telefone text NOT NULL,
  sexo text NOT NULL CHECK (sexo IN ('M', 'F', 'Outro')),
  codigo_unico text UNIQUE NOT NULL,
  status_cupom text NOT NULL DEFAULT 'ativo' CHECK (status_cupom IN ('ativo', 'usado', 'expirado', 'cancelado')),
  quantidade_usos integer NOT NULL DEFAULT 0 CHECK (quantidade_usos >= 0),
  data_expiracao timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lista_vip_codigo_unico ON public.lista_vip (codigo_unico);
CREATE INDEX IF NOT EXISTS idx_lista_vip_status_cupom ON public.lista_vip (status_cupom);

ALTER TABLE public.lista_vip ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.lista_vip
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
