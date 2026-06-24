import 'server-only'
import { contestDb } from './db'
import type { ContestSettings } from './types'

export async function getContestSettings(): Promise<ContestSettings | null> {
  try {
    const { data } = await contestDb().from('contest_settings').select('*').eq('id', 1).maybeSingle()
    return (data as ContestSettings) ?? null
  } catch {
    return null
  }
}

// Janela de inscrição aberta? (flag + datas opcionais)
export function inscricaoAberta(s: ContestSettings | null): boolean {
  if (!s || !s.is_active || !s.is_registration_open) return false
  const now = Date.now()
  if (s.registration_starts_at && now < Date.parse(s.registration_starts_at)) return false
  if (s.registration_ends_at && now > Date.parse(s.registration_ends_at)) return false
  return true
}

export function votacaoAberta(s: ContestSettings | null): boolean {
  if (!s || !s.is_active || !s.is_voting_open) return false
  const now = Date.now()
  if (s.voting_starts_at && now < Date.parse(s.voting_starts_at)) return false
  if (s.voting_ends_at && now > Date.parse(s.voting_ends_at)) return false
  return true
}
