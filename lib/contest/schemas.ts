import { z } from 'zod'
import { isValidCpf } from './cpf'

const opt = (max: number) => z.string().trim().max(max).optional().or(z.literal(''))

// Inscrição (form público). As fotos vão à parte (dataURLs validadas no servidor).
export const registroSchema = z.object({
  full_name: z.string().trim().min(3, 'Informe seu nome completo').max(120),
  display_name: z.string().trim().min(2, 'Escolha um nome de exibição').max(40),
  email: z.string().trim().email('E-mail inválido').max(160),
  whatsapp: z.string().trim().min(10, 'WhatsApp com DDD').max(20),
  cpf: z.string().refine(isValidCpf, 'CPF inválido'),
  instagram: opt(40),
  city: opt(60),
  look_title: z.string().trim().min(2, 'Dá um título pro look').max(80),
  look_description: opt(500),
  authorize_image: z.boolean().refine((v) => v === true, 'Você precisa autorizar o uso de imagem'),
  accept_rules: z.boolean().refine((v) => v === true, 'Você precisa aceitar o regulamento e a privacidade'),
})
export type RegistroInput = z.infer<typeof registroSchema>

// Edição na área privada (campos editáveis).
export const edicaoSchema = z.object({
  display_name: z.string().trim().min(2, 'Escolha um nome de exibição').max(40),
  instagram: opt(40),
  city: opt(60),
  look_title: z.string().trim().min(2, 'Dá um título pro look').max(80),
  look_description: opt(500),
})
export type EdicaoInput = z.infer<typeof edicaoSchema>

export const voteSchema = z.object({
  participant_id: z.string().uuid('Participante inválido'),
  cpf: z.string().refine(isValidCpf, 'CPF inválido'),
  confirm: z.literal(true),
})

export const acessoSchema = z.object({ email: z.string().trim().email('E-mail inválido') })
export const verificarSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  code: z.string().trim().regex(/^\d{6}$/, 'Código de 6 dígitos'),
})
