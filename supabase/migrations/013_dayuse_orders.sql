-- Pedidos do ingresso Day Use do Special Day (checkout Asaas).
CREATE TABLE IF NOT EXISTS public.dayuse_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  cpf text NOT NULL,
  telefone text NOT NULL,
  valor numeric(10,2) NOT NULL DEFAULT 75.00,
  forma_pagamento text NOT NULL CHECK (forma_pagamento IN ('Cartão de Crédito', 'PIX')),
  asaas_customer_id text,
  asaas_payment_id text,
  status_pagamento text NOT NULL DEFAULT 'Pendente'
    CHECK (status_pagamento IN ('Pendente', 'Pago', 'Cancelado')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dayuse_orders_payment_id ON public.dayuse_orders (asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_dayuse_orders_status ON public.dayuse_orders (status_pagamento);

ALTER TABLE public.dayuse_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON public.dayuse_orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
