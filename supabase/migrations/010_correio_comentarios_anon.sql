-- Permite comentarios sem identificacao (autor opcional).
ALTER TABLE public.correio_comentarios
  ALTER COLUMN autor_nome DROP NOT NULL;
