import { z } from 'zod'
import { isValidCpf } from './cpf'

// Inscrição mínima: só nome + CPF. Look e fotos vão em /minha-inscricao.
export const registroSchema = z.object({
  full_name: z.string().trim().min(3, 'Informe seu nome completo').max(120),
  cpf: z.string().refine(isValidCpf, 'CPF inválido'),
})
export type RegistroInput = z.infer<typeof registroSchema>

// Edição na área privada — só o nome do look (demais dados foram removidos).
export const edicaoSchema = z.object({
  look_title: z.string().trim().min(2, 'Dá um nome pro look').max(80),
})
export type EdicaoInput = z.infer<typeof edicaoSchema>

export const voteSchema = z.object({
  participant_id: z.string().uuid('Participante inválido'),
  cpf: z.string().refine(isValidCpf, 'CPF inválido'),
  confirm: z.literal(true),
})

// Acesso por CPF (login direto sem OTP).
export const acessoSchema = z.object({ cpf: z.string().refine(isValidCpf, 'CPF inválido') })
