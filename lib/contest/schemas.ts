import { z } from 'zod'
import { isValidCpf } from './cpf'

const opt = (max: number) => z.string().trim().max(max).optional().or(z.literal(''))

// Inscrição curta (form publico) - somente identificacao + termos.
// Look (titulo, fotos, etc) é completado depois em /minha-inscricao.
export const registroSchema = z.object({
  full_name: z.string().trim().min(3, 'Informe seu nome completo').max(120),
  email: z.string().trim().email('E-mail inválido').max(160),
  cpf: z.string().refine(isValidCpf, 'CPF inválido'),
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

// Acesso por CPF (login direto sem OTP).
export const acessoSchema = z.object({ cpf: z.string().refine(isValidCpf, 'CPF inválido') })
