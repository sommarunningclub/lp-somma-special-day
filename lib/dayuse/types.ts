export interface DayUseOrder {
  id: string
  nome: string
  email: string
  cpf: string
  telefone: string
  valor: number
  forma_pagamento: 'Cartão de Crédito' | 'PIX'
  asaas_customer_id: string | null
  asaas_payment_id: string | null
  status_pagamento: 'Pendente' | 'Pago' | 'Cancelado'
  pulseira_entregue: boolean
  pulseira_entregue_em: string | null
  created_at: string
}

export const DAYUSE_STATUS = ['Pendente', 'Pago', 'Cancelado'] as const
export const DAYUSE_FORMAS = ['Cartão de Crédito', 'PIX'] as const
