/**
 * Estado das réguas do evento, persistido em `app_settings` (key/value, service_role).
 * Espelha o padrão de lib/campaign/campaign-store.ts, mas por base.
 *
 * Chaves:
 *   evt_schedule:<base>       -> ScheduleEntry[]
 *   evt_runs:<base>           -> Record<step, RunInfo>
 *   evt_send:<base>:<step>    -> SentRecord (dedup por e-mail + resend ids)
 *   evt_unsub:<base>          -> string[] (e-mails descadastrados, lowercase)
 */

import { createServerClient } from '@/lib/supabase/server'
import { stepsForBase, type EventoBase } from './reguas'

export type RunStatus = 'pendente' | 'enviando' | 'enviado' | 'erro'

export interface ScheduleEntry {
  step: string
  /** ISO 8601 UTC. */
  sendAt: string
  enabled: boolean
}

export interface RunInfo {
  status: RunStatus
  dispatchedAt?: string
  eligible?: number
  sent?: number
  failed?: number
  error?: string
}

export interface SentRecord {
  /** Chaves de destinatário (e-mail lowercase) que já receberam o passo. */
  keys: string[]
  /** chave -> resend_email_id (para cruzar aberturas/cliques). */
  emails: Record<string, string>
}

const kSchedule = (base: string) => `evt_schedule:${base}`
const kRuns = (base: string) => `evt_runs:${base}`
const kSend = (base: string, step: string) => `evt_send:${base}:${step}`
const kUnsub = (base: string) => `evt_unsub:${base}`

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const supabase = createServerClient()
  const { data } = await supabase.from('app_settings').select('value').eq('key', key).maybeSingle()
  if (!data?.value) return fallback
  try {
    return JSON.parse(data.value as string) as T
  } catch {
    return fallback
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  const supabase = createServerClient()
  await supabase
    .from('app_settings')
    .upsert({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() }, { onConflict: 'key' })
}

/**
 * Agendamento: usa o salvo, completando com os defaults da config.
 * IMPORTANTE: por padrão os passos nascem DESATIVADOS (enabled=false) para nada
 * disparar antes de a copy ser aprovada. Passos com `defaultEnabled: true`
 * (ex.: régua Day Use) nascem LIGADOS e disparam sozinhos no horário.
 */
export async function getSchedule(base: EventoBase): Promise<ScheduleEntry[]> {
  const defaults: ScheduleEntry[] = stepsForBase(base).map((s) => ({
    step: s.step,
    sendAt: s.sendAt,
    enabled: s.defaultEnabled ?? false,
  }))
  const stored = await readJson<ScheduleEntry[] | null>(kSchedule(base), null)
  if (!stored || !Array.isArray(stored)) return defaults
  return defaults.map((d) => {
    const found = stored.find((s) => s.step === d.step)
    return found ? { step: d.step, sendAt: found.sendAt ?? d.sendAt, enabled: found.enabled ?? d.enabled } : d
  })
}

export async function saveSchedule(base: EventoBase, entries: ScheduleEntry[]): Promise<void> {
  await writeJson(kSchedule(base), entries)
}

export async function updateScheduleStep(
  base: EventoBase,
  step: string,
  patch: { sendAt?: string; enabled?: boolean }
): Promise<void> {
  const schedule = await getSchedule(base)
  const next = schedule.map((s) =>
    s.step === step
      ? {
          ...s,
          ...(patch.sendAt ? { sendAt: patch.sendAt } : {}),
          ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}),
        }
      : s
  )
  await saveSchedule(base, next)
}

export async function getRuns(base: EventoBase): Promise<Record<string, RunInfo>> {
  return readJson<Record<string, RunInfo>>(kRuns(base), {})
}

export async function setRun(base: EventoBase, step: string, info: RunInfo): Promise<void> {
  const runs = await getRuns(base)
  runs[step] = info
  await writeJson(kRuns(base), runs)
}

export async function getUnsubscribed(base: EventoBase): Promise<string[]> {
  return readJson<string[]>(kUnsub(base), [])
}

export async function addUnsubscribed(base: EventoBase, email: string): Promise<void> {
  const key = email.trim().toLowerCase()
  if (!key) return
  const list = await getUnsubscribed(base)
  if (!list.includes(key)) {
    list.push(key)
    await writeJson(kUnsub(base), list)
  }
}

export async function getSentRecord(base: EventoBase, step: string): Promise<SentRecord> {
  return readJson<SentRecord>(kSend(base, step), { keys: [], emails: {} })
}

export async function addSentRecord(
  base: EventoBase,
  step: string,
  newSends: { key: string; resendId?: string }[]
): Promise<SentRecord> {
  const rec = await getSentRecord(base, step)
  const set = new Set(rec.keys)
  for (const s of newSends) {
    if (!set.has(s.key)) {
      rec.keys.push(s.key)
      set.add(s.key)
    }
    if (s.resendId) rec.emails[s.key] = s.resendId
  }
  await writeJson(kSend(base, step), rec)
  return rec
}
