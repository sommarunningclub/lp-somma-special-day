import { randomInt } from 'crypto'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const RANDOM_CODE_LENGTH = 6

export function codeFromLeadId(id: string) {
  const compactId = id.replace(/-/g, '').toUpperCase()
  return `VIP${compactId.slice(0, 6)}`
}

export function createRandomVipCode() {
  let suffix = ''

  for (let index = 0; index < RANDOM_CODE_LENGTH; index += 1) {
    suffix += ALPHABET[randomInt(ALPHABET.length)]
  }

  return `VIP${suffix}`
}
