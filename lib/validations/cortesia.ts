import { z } from 'zod'

// Numero maximo de cortesias. Ao atingir esse total o formulario e bloqueado
// (na pagina e na server action). Fonte unica da verdade — nao duplicar o numero.
export const CORTESIA_LIMITE = 53

// Data de nascimento no formato DD/MM/AAAA (ano com 4 digitos), conforme pedido.
const DATA_NASCIMENTO_REGEX = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/

export const cortesiaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.email('E-mail inválido'),
  telefone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido. Use (00) 00000-0000'),
  dataNascimento: z
    .string()
    .regex(DATA_NASCIMENTO_REGEX, 'Data inválida. Use o formato DD/MM/AAAA'),
  genero: z.enum(['Masculino', 'Feminino'], { error: 'Selecione o gênero' }),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido. Use o formato 000.000.000-00'),
})

export type CortesiaInput = z.infer<typeof cortesiaSchema>
