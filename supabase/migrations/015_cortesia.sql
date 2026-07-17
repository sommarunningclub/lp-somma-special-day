-- Lista de cortesias do Somma Special Day (pagina /cortesia).
-- data_nascimento e armazenada como texto no formato DD/MM/AAAA (4 digitos de ano),
-- exatamente como preenchido no formulario.
CREATE TABLE IF NOT EXISTS public.cortesia (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  telefone text NOT NULL,
  data_nascimento text NOT NULL,
  genero text NOT NULL CHECK (genero IN ('Masculino', 'Feminino')),
  cpf text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cortesia_cpf ON public.cortesia (cpf);
CREATE INDEX IF NOT EXISTS idx_cortesia_created_at ON public.cortesia (created_at DESC);

ALTER TABLE public.cortesia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.cortesia
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
