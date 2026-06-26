import 'server-only'
import { createHash, randomBytes } from 'crypto'

// Token bruto (vai só na URL do participante). Guardamos apenas o hash.
export function generateTrackingToken(): string {
  return randomBytes(24).toString('base64url')
}

export function hashTrackingToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
