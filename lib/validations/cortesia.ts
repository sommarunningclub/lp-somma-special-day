import { z } from 'zod'

// Data de nascimento no formato DD/MM/AA (ano com 2 digitos), conforme pedido.
const DATA_NASCIMENTO_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/

export const cortesiaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.email('E-mail inválido'),
  telefone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido. Use (00) 00000-0000'),
  dataNascimento: z
    .string()
    .regex(DATA_NASCIMENTO_REGEX, 'Data inválida. Use o formato DD/MM/AA'),
  genero: z.enum(['Masculino', 'Feminino'], { error: 'Selecione o gênero' }),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido. Use o formato 000.000.000-00'),
})

export type CortesiaInput = z.infer<typeof cortesiaSchema>
