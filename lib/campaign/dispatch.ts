/**
 * Núcleo de disparo da campanha de escassez VIP.
 * Usado tanto pela rota cron quanto pelas server actions do admin.
 */

import { createServerClient } from '@/lib/supabase/server'
import { sendCountdownBatch, type Recipient } from '@/lib/emails/send-countdown'
import { getCountdownStep, type CountdownStepKey } from './vip-countdown-steps'
import { addSentRecord, getSentRecord, getUnsubscribed, setRun } from './campaign-store'

const STATUS_BLOQUEADO = new Set(['bounced', 'complained', 'failed'])

interface LeadRow {
  id: string
  nome: string
  email: string
  email_status: string | null
  status_cupom: string | null
}

async function fetchLeads(): Promise<LeadRow[]> {
  const supabase = createServerClient()
  const { data } = await supabase.from('lista_vip').select('id, nome, email, email_status, status_cupom')
  return (data ?? []) as LeadRow[]
}

function isEligible(lead: LeadRow): boolean {
  const cupomOk = lead.status_cupom === 'ativo' || lead.status_cupom === null
  const statusOk = !STATUS_BLOQUEADO.has(lead.email_status ?? '')
  return cupomOk && statusOk && !!lead.email
}

/** Quantos contatos estão elegíveis para receber (ignora dedup do passo). */
export async function countEligible(): Promise<number> {
  const leads = await fetchLeads()
  const unsub = new Set(await getUnsubscribed())
  return leads.filter((l) => isEligible(l) && !unsub.has(l.id)).length
}

/** Destinatários pendentes de um passo (elegíveis − já enviados − descadastrados). */
export async function getPendingRecipients(step: CountdownStepKey): Promise<Recipient[]> {
  const [leads, unsub, sentRec] = await Promise.all([fetchLeads(), getUnsubscribed(), getSentRecord(step)])
  const unsubSet = new Set(unsub)
  const sentSet = new Set(sentRec.leadIds)
  return leads
    .filter((l) => isEligible(l) && !unsubSet.has(l.id) && !sentSet.has(l.id))
    .map((l) => ({ id: l.id, nome: l.nome, email: l.email }))
}

export interface DispatchOutcome {
  step: CountdownStepKey
  eligible: number
  sent: number
  failed: number
  skipped?: boolean
  message?: string
}

/**
 * Dispara um passo: seleciona pendentes, envia em lote, registra dedup e atualiza o relatório.
 */
export async function dispatchStep(step: CountdownStepKey): Promise<DispatchOutcome> {
  const cfg = getCountdownStep(step)
  if (!cfg) throw new Error(`Passo desconhecido: ${step}`)

  const recipients = await getPendingRecipients(step)
  if (recipients.length === 0) {
    const prev = await getSentRecord(step)
    await setRun(step, {
      status: 'enviado',
      dispatchedAt: new Date().toISOString(),
      eligible: prev.leadIds.length,
      sent: prev.leadIds.length,
      failed: 0,
    })
    return { step, eligible: prev.leadIds.length, sent: prev.leadIds.length, failed: 0, skipped: true, message: 'Nenhum destinatário pendente.' }
  }

  await setRun(step, { status: 'enviando', dispatchedAt: new Date().toISOString(), eligible: recipients.length })

  const result = await sendCountdownBatch(step, recipients)
  await addSentRecord(step, result.sent)

  const totalSent = (await getSentRecord(step)).leadIds.length
  await setRun(step, {
    status: result.failed.length > 0 && result.sent.length === 0 ? 'erro' : 'enviado',
    dispatchedAt: new Date().toISOString(),
    eligible: recipients.length,
    sent: result.sent.length,
    failed: result.failed.length,
    error: result.failed[0]?.error,
  })

  return { step, eligible: recipients.length, sent: result.sent.length, failed: result.failed.length, message: `Total acumulado enviado: ${totalSent}` }
}

export interface StepMetrics {
  step: CountdownStepKey
  enviados: number
  aberturas: number
  cliques: number
}

/** Métricas por passo: enviados (dedup) + aberturas/cliques cruzando email_events pelos resend ids. */
export async function getStepMetrics(step: CountdownStepKey, dispatchedAt?: string): Promise<StepMetrics> {
  const rec = await getSentRecord(step)
  const enviados = rec.leadIds.length
  const idSet = new Set(Object.values(rec.emails))

  if (idSet.size === 0) return { step, enviados, aberturas: 0, cliques: 0 }

  const supabase = createServerClient()
  let query = supabase
    .from('email_events')
    .select('resend_email_id, type')
    .in('type', ['opened', 'clicked'])
  if (dispatchedAt) query = query.gte('created_at', dispatchedAt)
  const { data } = await query

  const opened = new Set<string>()
  const clicked = new Set<string>()
  for (const ev of (data ?? []) as { resend_email_id: string | null; type: string }[]) {
    if (!ev.resend_email_id || !idSet.has(ev.resend_email_id)) continue
    if (ev.type === 'opened') opened.add(ev.resend_email_id)
    if (ev.type === 'clicked') clicked.add(ev.resend_email_id)
  }
  return { step, enviados, aberturas: opened.size, cliques: clicked.size }
}
