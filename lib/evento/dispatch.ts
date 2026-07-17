/**
 * Núcleo de disparo das réguas do evento. Usado pelo cron e pelas server actions.
 * Cada base tem tabela e colunas próprias; o dedup é sempre por e-mail (lowercase),
 * o que também resolve os check-ins repetidos da mesma pessoa.
 */

import { createServerClient } from '@/lib/supabase/server'
import { sendEventoBatch, type Recipient } from './send'
import { getEventoStep, type EventoBase } from './reguas'
import { addSentRecord, getSentRecord, getUnsubscribed, setRun } from './store'

const STATUS_BLOQUEADO = new Set(['bounced', 'complained', 'failed'])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface BaseConfig {
  table: string
  nameCol: string
  /** Colunas extra a selecionar (ex.: email_status). */
  extraCols?: string[]
  /** True para respeitar email_status/bounce (só a lista_vip tem). */
  useEmailStatus?: boolean
}

const SOURCE_CONFIG = {
  lista_vip: { table: 'lista_vip', nameCol: 'nome', extraCols: ['email_status'], useEmailStatus: true },
  checkins: { table: 'checkins', nameCol: 'nome_completo' },
  cadastro_site: { table: 'cadastro_site', nameCol: 'nome_completo' },
} satisfies Record<string, BaseConfig>

type SourceKey = keyof typeof SOURCE_CONFIG

/**
 * Quais tabelas-fonte compõem cada base. As três bases originais mapeiam 1:1
 * para sua tabela; `dayuse` é a UNIÃO das três, deduplicada por e-mail — assim
 * quem está em mais de uma lista recebe o Day Use uma vez só.
 */
const SOURCES_FOR_BASE: Record<EventoBase, SourceKey[]> = {
  lista_vip: ['lista_vip'],
  checkins: ['checkins'],
  cadastro_site: ['cadastro_site'],
  dayuse: ['lista_vip', 'checkins', 'cadastro_site'],
}

interface RawRow {
  nome: string
  email: string
  email_status?: string | null
}

/** Lê uma tabela-fonte inteira (paginada), já descartando e-mails bloqueados. */
async function fetchTable(cfg: BaseConfig): Promise<RawRow[]> {
  const supabase = createServerClient()
  const cols = ['email', `${cfg.nameCol}`, ...(cfg.extraCols ?? [])].join(', ')

  const rows: RawRow[] = []
  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(cfg.table).select(cols).range(from, from + PAGE - 1)
    if (error || !data || data.length === 0) break
    for (const r of data as unknown as Record<string, unknown>[]) {
      const status = (r.email_status as string | null) ?? null
      if (cfg.useEmailStatus && STATUS_BLOQUEADO.has(status ?? '')) continue
      rows.push({ nome: String(r[cfg.nameCol] ?? ''), email: String(r.email ?? ''), email_status: status })
    }
    if (data.length < PAGE) break
  }
  return rows
}

/** Busca todos os contatos da base já deduplicados por e-mail (lowercase). */
async function fetchRecipients(base: EventoBase): Promise<Recipient[]> {
  const rowsPerSource = await Promise.all(SOURCES_FOR_BASE[base].map((k) => fetchTable(SOURCE_CONFIG[k])))

  const byKey = new Map<string, Recipient>()
  for (const rows of rowsPerSource) {
    for (const r of rows) {
      const email = (r.email || '').trim()
      const key = email.toLowerCase()
      if (!EMAIL_RE.test(email)) continue
      if (!byKey.has(key)) byKey.set(key, { key, nome: r.nome, email })
    }
  }
  return Array.from(byKey.values())
}

/** Elegíveis da base (dedup por e-mail, menos descadastrados). */
export async function countEligible(base: EventoBase): Promise<number> {
  const [recipients, unsub] = await Promise.all([fetchRecipients(base), getUnsubscribed(base)])
  const unsubSet = new Set(unsub)
  return recipients.filter((r) => !unsubSet.has(r.key)).length
}

/** Pendentes de um passo (elegíveis − já enviados − descadastrados). */
export async function getPendingRecipients(base: EventoBase, step: string): Promise<Recipient[]> {
  const [recipients, unsub, sent] = await Promise.all([
    fetchRecipients(base),
    getUnsubscribed(base),
    getSentRecord(base, step),
  ])
  const unsubSet = new Set(unsub)
  const sentSet = new Set(sent.keys)
  return recipients.filter((r) => !unsubSet.has(r.key) && !sentSet.has(r.key))
}

export interface DispatchOutcome {
  base: EventoBase
  step: string
  eligible: number
  sent: number
  failed: number
  skipped?: boolean
  message?: string
}

export async function dispatchStep(base: EventoBase, step: string): Promise<DispatchOutcome> {
  const cfg = getEventoStep(base, step)
  if (!cfg) throw new Error(`Passo desconhecido: ${base}/${step}`)

  const recipients = await getPendingRecipients(base, step)
  if (recipients.length === 0) {
    const prev = await getSentRecord(base, step)
    await setRun(base, step, {
      status: 'enviado',
      dispatchedAt: new Date().toISOString(),
      eligible: prev.keys.length,
      sent: prev.keys.length,
      failed: 0,
    })
    return { base, step, eligible: prev.keys.length, sent: prev.keys.length, failed: 0, skipped: true, message: 'Nenhum destinatário pendente.' }
  }

  await setRun(base, step, { status: 'enviando', dispatchedAt: new Date().toISOString(), eligible: recipients.length })

  const result = await sendEventoBatch(base, step, recipients)
  await addSentRecord(base, step, result.sent)

  const total = (await getSentRecord(base, step)).keys.length
  await setRun(base, step, {
    status: result.failed.length > 0 && result.sent.length === 0 ? 'erro' : 'enviado',
    dispatchedAt: new Date().toISOString(),
    eligible: recipients.length,
    sent: result.sent.length,
    failed: result.failed.length,
    error: result.failed[0]?.error,
  })

  return { base, step, eligible: recipients.length, sent: result.sent.length, failed: result.failed.length, message: `Total acumulado: ${total}` }
}

export interface StepMetrics {
  enviados: number
  aberturas: number
  cliques: number
}

export async function getStepMetrics(base: EventoBase, step: string, dispatchedAt?: string): Promise<StepMetrics> {
  const rec = await getSentRecord(base, step)
  const enviados = rec.keys.length
  const idSet = new Set(Object.values(rec.emails))
  if (idSet.size === 0) return { enviados, aberturas: 0, cliques: 0 }

  const supabase = createServerClient()
  let query = supabase.from('email_events').select('resend_email_id, type').in('type', ['opened', 'clicked'])
  if (dispatchedAt) query = query.gte('created_at', dispatchedAt)
  const { data } = await query

  const opened = new Set<string>()
  const clicked = new Set<string>()
  for (const ev of (data ?? []) as { resend_email_id: string | null; type: string }[]) {
    if (!ev.resend_email_id || !idSet.has(ev.resend_email_id)) continue
    if (ev.type === 'opened') opened.add(ev.resend_email_id)
    if (ev.type === 'clicked') clicked.add(ev.resend_email_id)
  }
  return { enviados, aberturas: opened.size, cliques: clicked.size }
}
