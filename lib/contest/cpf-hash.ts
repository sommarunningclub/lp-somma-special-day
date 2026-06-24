import 'server-only'
import { createHmac } from 'crypto'
import { normalizeCpf } from './cpf'

// Identificador determinístico e seguro do CPF (nunca guardamos o CPF em texto).
export function hashCpf(cpf: string): string {
  const secret = process.env.VOTER_HASH_SECRET
  if (!secret) throw new Error('VOTER_HASH_SECRET ausente')
  return createHmac('sha256', secret).update(normalizeCpf(cpf)).digest('hex')
}

// Hash opaco genérico (ip, user-agent) — usa o mesmo segredo.
export function hashOpaque(value: string): string {
  const secret = process.env.VOTER_HASH_SECRET
  if (!secret) throw new Error('VOTER_HASH_SECRET ausente')
  return createHmac('sha256', secret).update(value).digest('hex')
}
