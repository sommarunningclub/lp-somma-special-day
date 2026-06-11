import type { CotaKey, AvulsaKey } from '@/lib/proposta-data'

export interface Proposta {
  id: string
  slug: string
  cliente_nome: string
  cliente_empresa: string | null
  mensagem_abertura: string | null
  validade: string | null
  cota_recomendada: CotaKey | null
  cotas_visiveis: CotaKey[]
  avulsas_visiveis: AvulsaKey[]
  valores_personalizados: Partial<Record<CotaKey, number>>
  whatsapp_telefone: string | null
  contato_responsavel: string | null
  ocultar_avulsas: boolean
  ocultar_comparativo: boolean
  created_at: string
  updated_at: string
}
