import { z } from 'zod'

export const nutricaoSchema = z.object({
  nome: z.string().min(2, 'Nos diz seu nome'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().optional().or(z.literal('')),
})

export type NutricaoInput = z.infer<typeof nutricaoSchema>
