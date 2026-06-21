/**
 * Núcleo da automação de nutrição.
 *
 * Lógica:
 *  1. Para cada lead ativo (não unsubscribed, não completed):
 *     a. Se `jump_to_final` = true e `oferta_final` ainda não foi enviado,
 *        envia agora e marca o lead como completed.
 *     b. Senão, calcula qual passo é "devido" (offsetHours desde created_at)
 *        e envia o próximo passo pendente. Marca completed se enviou o último.
 *  2. Dedup: tabela nutricao_sends (UNIQUE lead_id + step).
 */

import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase/server'
import { renderNutricaoEmail } from '@/lib/emails/nutricao-template'
import {
  NUTRICAO_STEPS,
  getFinalStep,
  type NutricaoStepKey,
} from './nutricao-steps'
import { resolveStep, resolveAllSteps } from './nutricao-store'

export const SITE_URL = 'https://specialday.sommaclub.com.br'

interface LeadRow {
  id: string
  nome: string
  email: string
  created_at: string
  jump_to_final: boolean
  completed_at: string | null
  unsubscribed_at: string | null
  email_status: string | null
}

const BLOCKED_STATUSES = new Set(['bounced', 'complained', 'failed'])

function unsubUrl(leadId: string): string {
  return `${SITE_URL}/unsubscribe?u=${encodeURIComponent(leadId)}&list=nutricao`
}

async function getActiveLeads(): Promise<LeadRow[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('nutricao_leads')
    .select('id, nome, email, created_at, jump_to_final, completed_at, unsubscribed_at, email_status')
    .is('completed_at', null)
    .is('unsubscribed_at', null)
  return (data ?? []).filter(
    (l: LeadRow) => !BLOCKED_STATUSES.has(l.email_status ?? '') && !!l.email,
  ) as LeadRow[]
}

async function getSentSteps(leadId: string): Promise<Set<NutricaoStepKey>> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('nutricao_sends')
    .select('step')
    .eq('lead_id', leadId)
  return new Set((data ?? []).map((r: { step: string }) => r.step as NutricaoStepKey))
}

function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000
}

/** Determina qual passo deve ser enviado AGORA, ou null se nenhum. */
function pickStep(
  lead: LeadRow,
  already: Set<NutricaoStepKey>,
  enabledSet: Set<NutricaoStepKey>,
): NutricaoStepKey | null {
  // Branching: clicou no CTA → vai direto pro final.
  if (lead.jump_to_final && !already.has('d6_oferta_final') && enabledSet.has('d6_oferta_final')) {
    return 'd6_oferta_final'
  }

  const elapsed = hoursSince(lead.created_at)
  // Pega o passo mais avançado cujo offset já passou, está habilitado e ainda não foi enviado.
  let candidate: NutricaoStepKey | null = null
  for (const s of NUTRICAO_STEPS) {
    if (elapsed >= s.offsetHours && !already.has(s.step) && enabledSet.has(s.step)) {
      candidate = s.step
    }
  }
  return candidate
}

interface SendOutcome {
  leadId: string
  email: string
  step: NutricaoStepKey
  resendId?: string
  error?: string
}

async function sendOne(
  resend: Resend,
  from: string,
  lead: LeadRow,
  step: NutricaoStepKey,
): Promise<SendOutcome> {
  const stepConfig = await resolveStep(step)
  if (!stepConfig) return { leadId: lead.id, email: lead.email, step, error: 'Passo desconhecido' }
  const { subject, html } = renderNutricaoEmail({
    nome: lead.nome,
    stepConfig,
    unsubscribeUrl: unsubUrl(lead.id),
  })
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: lead.email,
      subject,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubUrl(lead.id)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
    if (error) return { leadId: lead.id, email: lead.email, step, error: error.message }
    return { leadId: lead.id, email: lead.email, step, resendId: data?.id }
  } catch (e) {
    return { leadId: lead.id, email: lead.email, step, error: e instanceof Error ? e.message : String(e) }
  }
}

async function recordSend(outcome: SendOutcome): Promise<void> {
  const supabase = createServerClient()
  // dedup: lead_id + step UNIQUE; ignora erro de duplicata.
  await supabase.from('nutricao_sends').insert({
    lead_id: outcome.leadId,
    step: outcome.step,
    resend_email_id: outcome.resendId ?? null,
  })
  // Atualiza lead: marca completed se foi o último passo; cola o resend_email_id no lead pra tracking rápido
  const patch: Record<string, unknown> = {
    resend_email_id: outcome.resendId ?? null,
    email_status: 'sent',
  }
  if (outcome.step === getFinalStep().step) {
    patch.completed_at = new Date().toISOString()
  }
  await supabase.from('nutricao_leads').update(patch).eq('id', outcome.leadId)
}

export interface RunSummary {
  scanned: number
  sent: number
  failed: number
  details: { email: string; step: NutricaoStepKey; ok: boolean; error?: string }[]
}

/** Roda uma rodada completa: percorre leads ativos e envia o próximo passo devido. */
export async function runNutricaoDispatch(): Promise<RunSummary> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.VIP_EMAIL_FROM
  if (!apiKey || !from) throw new Error('RESEND_API_KEY ou VIP_EMAIL_FROM não configurados.')
  const resend = new Resend(apiKey)

  const [leads, resolvedSteps] = await Promise.all([getActiveLeads(), resolveAllSteps()])
  const enabledSet = new Set(resolvedSteps.filter((s) => s.enabled).map((s) => s.step))
  const summary: RunSummary = { scanned: leads.length, sent: 0, failed: 0, details: [] }

  for (const lead of leads) {
    const already = await getSentSteps(lead.id)
    const step = pickStep(lead, already, enabledSet)
    if (!step) continue

    const outcome = await sendOne(resend, from, lead, step)
    if (outcome.error) {
      summary.failed += 1
      summary.details.push({ email: lead.email, step, ok: false, error: outcome.error })
      continue
    }
    await recordSend(outcome)
    summary.sent += 1
    summary.details.push({ email: lead.email, step, ok: true })

    // Pequeno throttle pra não estourar rate-limit do Resend (10 req/s no plano grátis).
    await new Promise((res) => setTimeout(res, 120))
  }

  return summary
}

/** Envia D0 imediato pra um lead recém-criado (chamado pela server action). */
export async function sendImmediateWelcome(leadId: string): Promise<SendOutcome | null> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.VIP_EMAIL_FROM
  if (!apiKey || !from) {
    console.error('[nutricao] RESEND_API_KEY/VIP_EMAIL_FROM não configurados.')
    return null
  }

  const supabase = createServerClient()
  const { data } = await supabase
    .from('nutricao_leads')
    .select('id, nome, email, created_at, jump_to_final, completed_at, unsubscribed_at, email_status')
    .eq('id', leadId)
    .maybeSingle()
  if (!data) return null
  const lead = data as LeadRow

  const already = await getSentSteps(lead.id)
  if (already.has('d0_boas_vindas')) return null

  const resend = new Resend(apiKey)
  const outcome = await sendOne(resend, from, lead, 'd0_boas_vindas')
  if (outcome.error) {
    console.error('[nutricao] D0 falhou:', outcome.error)
    return outcome
  }
  await recordSend(outcome)
  return outcome
}
