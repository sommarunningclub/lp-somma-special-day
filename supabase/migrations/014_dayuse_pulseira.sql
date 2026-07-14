-- Entrega da pulseira do Day Use (validação na entrada do evento).
ALTER TABLE public.dayuse_orders
  ADD COLUMN IF NOT EXISTS pulseira_entregue boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pulseira_entregue_em timestamptz;
