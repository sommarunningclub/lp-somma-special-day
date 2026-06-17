/**
 * Estado da campanha de escassez VIP persistido na tabela `app_settings`
 * (key/value, service_role). Evita DDL/migration manual.
 *
 * Chaves usadas:
 *   vip_campaign_schedule        -> ScheduleEntry[] (agendamento editável)
 *   vip_campaign_runs            -> Record<step, RunInfo> (relatório de disparo)
 *   vip_campaign_send:<step>     -> SentRecord (dedup por destinatário + ids p/ métricas)
 *   vip_unsubscribed             -> string[] (lead_ids descadastrados)
 */

import { createServerClient } from '@/lib/supabase/server'
import { COUNTDOWN_STEPS, type CountdownStepKey } from './vip-countdown-steps'

export interface ScheduleEntry {
  step: CountdownStepKey
  /** ISO 8601 UTC. */
  sendAt: string
  enabled: boolean
}

export type RunStatus = 'pendente' | 'enviando' | 'enviado' | 'erro'

export interface RunInfo {
  status: RunStatus
  dispatchedAt?: string
  eligible?: number
  sent?: number
  failed?: number
  error?: string
}

export interface SentRecord {
  /** lead_ids que já receberam este passo (dedup). */
  leadIds: string[]
  /** lead_id -> resend_email_id (para cruzar aberturas/cliques no relatório). */
  emails: Record<string, string>
}

const K_SCHEDULE = 'vip_campaign_schedule'
const K_RUNS = 'vip_campaign_runs'
const K_UNSUB = 'vip_unsubscribed'
const kSend = (step: string) => `vip_campaign_send:${step}`

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

/** Agendamento: usa o salvo, completando com os defaults (garante os 6 passos). */
export async function getSchedule(): Promise<ScheduleEntry[]> {
  const defaults: ScheduleEntry[] = COUNTDOWN_STEPS.map((s) => ({ step: s.step, sendAt: s.sendAt, enabled: true }))
  const stored = await readJson<ScheduleEntry[] | null>(K_SCHEDULE, null)
  if (!stored || !Array.isArray(stored)) return defaults
  return defaults.map((d) => {
    const found = stored.find((s) => s.step === d.step)
    return found ? { step: d.step, sendAt: found.sendAt ?? d.sendAt, enabled: found.enabled ?? true } : d
  })
}

export async function saveSchedule(entries: ScheduleEntry[]): Promise<void> {
  await writeJson(K_SCHEDULE, entries)
}

export async function updateScheduleStep(
  step: CountdownStepKey,
  patch: { sendAt?: string; enabled?: boolean }
): Promise<ScheduleEntry[]> {
  const schedule = await getSchedule()
  const next = schedule.map((s) =>
    s.step === step ? { ...s, ...(patch.sendAt ? { sendAt: patch.sendAt } : {}), ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}) } : s
  )
  await saveSchedule(next)
  return next
}

export async function getRuns(): Promise<Record<string, RunInfo>> {
  return readJson<Record<string, RunInfo>>(K_RUNS, {})
}

export async function setRun(step: CountdownStepKey, info: RunInfo): Promise<void> {
  const runs = await getRuns()
  runs[step] = info
  await writeJson(K_RUNS, runs)
}

export async function getUnsubscribed(): Promise<string[]> {
  return readJson<string[]>(K_UNSUB, [])
}

export async function addUnsubscribed(leadId: string): Promise<void> {
  const list = await getUnsubscribed()
  if (!list.includes(leadId)) {
    list.push(leadId)
    await writeJson(K_UNSUB, list)
  }
}

export async function getSentRecord(step: CountdownStepKey): Promise<SentRecord> {
  return readJson<SentRecord>(kSend(step), { leadIds: [], emails: {} })
}

export async function addSentRecord(
  step: CountdownStepKey,
  newSends: { leadId: string; resendId?: string }[]
): Promise<SentRecord> {
  const rec = await getSentRecord(step)
  const idSet = new Set(rec.leadIds)
  for (const s of newSends) {
    if (!idSet.has(s.leadId)) {
      rec.leadIds.push(s.leadId)
      idSet.add(s.leadId)
    }
    if (s.resendId) rec.emails[s.leadId] = s.resendId
  }
  await writeJson(kSend(step), rec)
  return rec
}
