import { z } from 'zod'

export const listaVipSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.email('E-mail inválido'),
  telefone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido. Use (00) 00000-0000'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido. Use o formato 000.000.000-00'),
  sexo: z.enum(['M', 'F', 'Outro'], { error: 'Selecione o sexo' }),
})

export type ListaVipInput = z.infer<typeof listaVipSchema>
