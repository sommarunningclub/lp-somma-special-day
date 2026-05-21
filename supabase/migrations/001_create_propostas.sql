CREATE TABLE IF NOT EXISTS public.propostas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  cliente_nome text NOT NULL,
  cliente_empresa text,
  mensagem_abertura text,
  validade text,
  cota_recomendada text CHECK (cota_recomendada IN ('master', 'ouro', 'prata', 'apoio')),
  cotas_visiveis jsonb NOT NULL DEFAULT '["master","ouro","prata","apoio"]'::jsonb,
  avulsas_visiveis jsonb NOT NULL DEFAULT '["logo-camiseta","hidratacao","cafe-manha","bar-drink","recovery","dj-stage"]'::jsonb,
  valores_personalizados jsonb NOT NULL DEFAULT '{}'::jsonb,
  whatsapp_telefone text,
  contato_responsavel text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: allow service role full access (admin uses service_role key)
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.propostas
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public read access for viewing proposals by slug
CREATE POLICY "Public read by slug" ON public.propostas
  FOR SELECT
  USING (true);
