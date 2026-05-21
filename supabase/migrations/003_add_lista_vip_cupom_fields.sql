ALTER TABLE public.lista_vip
  ADD COLUMN IF NOT EXISTS codigo_unico text,
  ADD COLUMN IF NOT EXISTS status_cupom text NOT NULL DEFAULT 'ativo',
  ADD COLUMN IF NOT EXISTS quantidade_usos integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_expiracao timestamptz;

WITH leads_sem_codigo AS (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS position
  FROM public.lista_vip
  WHERE codigo_unico IS NULL
)
UPDATE public.lista_vip AS lead
SET codigo_unico = 'VIP' || (900000 + leads_sem_codigo.position)::text
FROM leads_sem_codigo
WHERE lead.id = leads_sem_codigo.id;

ALTER TABLE public.lista_vip
  ALTER COLUMN codigo_unico SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lista_vip_codigo_unico_key'
  ) THEN
    ALTER TABLE public.lista_vip ADD CONSTRAINT lista_vip_codigo_unico_key UNIQUE (codigo_unico);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lista_vip_status_cupom_check'
  ) THEN
    ALTER TABLE public.lista_vip ADD CONSTRAINT lista_vip_status_cupom_check CHECK (status_cupom IN ('ativo', 'usado', 'expirado', 'cancelado'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lista_vip_quantidade_usos_check'
  ) THEN
    ALTER TABLE public.lista_vip ADD CONSTRAINT lista_vip_quantidade_usos_check CHECK (quantidade_usos >= 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lista_vip_codigo_unico ON public.lista_vip (codigo_unico);
CREATE INDEX IF NOT EXISTS idx_lista_vip_status_cupom ON public.lista_vip (status_cupom);
