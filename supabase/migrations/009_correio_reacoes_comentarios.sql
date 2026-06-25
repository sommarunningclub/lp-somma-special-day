-- Engajamento do Correio Elegante: reacoes (emoji-only) + comentarios.
-- Aplicado sobre cada recado em public.correio_elegante.

-- 1) REACOES (emoji-only)
CREATE TABLE IF NOT EXISTS public.correio_reacoes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  correio_id uuid NOT NULL REFERENCES public.correio_elegante (id) ON DELETE CASCADE,
  emoji text NOT NULL,
  -- identidade anonima do dispositivo (uuid em localStorage no client)
  fingerprint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- 1 reacao por (recado, emoji, device) — toggle no client deduplica
  UNIQUE (correio_id, emoji, fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_correio_reacoes_correio ON public.correio_reacoes (correio_id);
CREATE INDEX IF NOT EXISTS idx_correio_reacoes_fp ON public.correio_reacoes (fingerprint);

ALTER TABLE public.correio_reacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access correio_reacoes" ON public.correio_reacoes;
CREATE POLICY "Service role full access correio_reacoes" ON public.correio_reacoes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2) COMENTARIOS
CREATE TABLE IF NOT EXISTS public.correio_comentarios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  correio_id uuid NOT NULL REFERENCES public.correio_elegante (id) ON DELETE CASCADE,
  autor_nome text NOT NULL,
  autor_instagram text,
  texto text NOT NULL,
  fingerprint text NOT NULL,
  oculto boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_correio_comentarios_correio ON public.correio_comentarios (correio_id, created_at DESC);

ALTER TABLE public.correio_comentarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access correio_comentarios" ON public.correio_comentarios;
CREATE POLICY "Service role full access correio_comentarios" ON public.correio_comentarios
  FOR ALL TO service_role USING (true) WITH CHECK (true);
