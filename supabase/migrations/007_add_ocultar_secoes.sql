ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS ocultar_avulsas    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ocultar_comparativo boolean NOT NULL DEFAULT false;
