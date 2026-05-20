import { z } from 'zod'

export const cotaKeyEnum = z.enum(['master', 'ouro', 'prata', 'apoio'])
export const avulsaKeyEnum = z.enum([
  'logo-camiseta',
  'hidratacao',
  'cafe-manha',
  'bar-drink',
  'recovery',
  'dj-stage',
])

export const propostaSchema = z.object({
  cliente_nome: z.string().min(2, 'Nome do cliente é obrigatório'),
  cliente_empresa: z.string().optional().or(z.literal('')),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug inválido (apenas letras, números e hífen)').min(2),
  mensagem_abertura: z.string().optional().or(z.literal('')),
  validade: z.string().optional().or(z.literal('')),
  cota_recomendada: cotaKeyEnum.nullable().optional(),
  cotas_visiveis: z.array(cotaKeyEnum),
  avulsas_visiveis: z.array(avulsaKeyEnum),
  valores_personalizados: z.record(cotaKeyEnum, z.number().nonnegative()).optional(),
  whatsapp_telefone: z.string().optional().or(z.literal('')),
  contato_responsavel: z.string().optional().or(z.literal('')),
})

export type PropostaInput = z.infer<typeof propostaSchema>
