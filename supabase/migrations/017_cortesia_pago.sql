-- Controle manual de pagamento das cortesias (checkbox em /cortesia/admin).
-- pago    -> marcado pelo admin quando o pagamento foi feito
-- pago_em -> data/hora em que foi marcado como pago (nulo quando nao pago)
-- Rode este arquivo no SQL Editor do Supabase.
ALTER TABLE public.cortesia
  ADD COLUMN IF NOT EXISTS pago boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pago_em timestamptz;
