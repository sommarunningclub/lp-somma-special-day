/**
 * Server-side fetcher para o painel admin de nutrição.
 * Junta steps resolvidos + métricas (envios/aberturas/cliques) + base de leads.
 */

import { createServerClient } from '@/lib/supabase/server'
import { resolveAllSteps } from './nutricao-store'
import type { NutricaoStep, NutricaoStepKey } from './nutricao-steps'

export interface StepWithMetrics extends NutricaoStep {
  enabled: boolean
  enviados: number
  aberturas: number
  cliques: number
}

export interface LeadView {
  id: string
  nome: string
  email: string
  telefone: string | null
  created_at: string
  jump_to_final: boolean
  completed_at: string | null
  unsubscribed_at: string | null
  email_status: string | null
  email_open_count: number
  email_click_count: number
  last_opened_at: string | null
  last_clicked_at: string | null
  last_step: NutricaoStepKey | null
  last_step_at: string | null
}

export interface NutricaoAdminView {
  steps: StepWithMetrics[]
  totals: {
    total: number
    ativos: number
    completos: number
    unsub: number
  }
  leads: LeadView[]
}

export async function getNutricaoAdminView(): Promise<NutricaoAdminView> {
  const supabase = createServerClient()

  const [stepsResolved, leadsRes, sendsRes, eventsRes] = await Promise.all([
    resolveAllSteps(),
    supabase
      .from('nutricao_leads')
      .select('id, nome, email, telefone, created_at, jump_to_final, completed_at, unsubscribed_at, email_status, email_open_count, email_click_count, last_opened_at, last_clicked_at')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('nutricao_sends')
      .select('lead_id, step, sent_at, resend_email_id'),
    supabase
      .from('email_events')
      .select('resend_email_id, type, email')
      .in('type', ['opened', 'clicked']),
  ])

  const leadsRaw = (leadsRes.data ?? []) as Array<Record<string, unknown>>
  const sends = (sendsRes.data ?? []) as Array<{ lead_id: string; step: NutricaoStepKey; sent_at: string; resend_email_id: string | null }>
  const events = (eventsRes.data ?? []) as Array<{ resend_email_id: string | null; type: string; email: string | null }>

  // Conta envios/aberturas/cliques por step
  const counts: Record<string, { enviados: number; aberturas: number; cliques: number }> = {}
  for (const s of stepsResolved) {
    counts[s.step] = { enviados: 0, aberturas: 0, cliques: 0 }
  }

  // Mapa resend_email_id → step (vem de nutricao_sends)
  const idToStep = new Map<string, NutricaoStepKey>()
  for (const row of sends) {
    counts[row.step].enviados += 1
    if (row.resend_email_id) idToStep.set(row.resend_email_id, row.step)
  }

  // Conta eventos por step (via mapa de id)
  for (const ev of events) {
    if (!ev.resend_email_id) continue
    const step = idToStep.get(ev.resend_email_id)
    if (!step) continue
    if (ev.type === 'opened') counts[step].aberturas += 1
    if (ev.type === 'clicked') counts[step].cliques += 1
  }

  const steps: StepWithMetrics[] = stepsResolved.map((s) => ({
    ...s,
    enviados: counts[s.step].enviados,
    aberturas: counts[s.step].aberturas,
    cliques: counts[s.step].cliques,
  }))

  // Último step enviado por lead
  const lastByLead = new Map<string, { step: NutricaoStepKey; sent_at: string }>()
  for (const row of sends) {
    const cur = lastByLead.get(row.lead_id)
    if (!cur || new Date(row.sent_at).getTime() > new Date(cur.sent_at).getTime()) {
      lastByLead.set(row.lead_id, { step: row.step, sent_at: row.sent_at })
    }
  }

  const leads: LeadView[] = leadsRaw.map((l) => {
    const last = lastByLead.get(l.id as string) ?? null
    return {
      id: l.id as string,
      nome: l.nome as string,
      email: l.email as string,
      telefone: (l.telefone as string | null) ?? null,
      created_at: l.created_at as string,
      jump_to_final: Boolean(l.jump_to_final),
      completed_at: (l.completed_at as string | null) ?? null,
      unsubscribed_at: (l.unsubscribed_at as string | null) ?? null,
      email_status: (l.email_status as string | null) ?? null,
      email_open_count: Number(l.email_open_count ?? 0),
      email_click_count: Number(l.email_click_count ?? 0),
      last_opened_at: (l.last_opened_at as string | null) ?? null,
      last_clicked_at: (l.last_clicked_at as string | null) ?? null,
      last_step: last?.step ?? null,
      last_step_at: last?.sent_at ?? null,
    }
  })

  const totals = {
    total: leads.length,
    ativos: leads.filter((l) => !l.completed_at && !l.unsubscribed_at).length,
    completos: leads.filter((l) => l.completed_at).length,
    unsub: leads.filter((l) => l.unsubscribed_at).length,
  }

  return { steps, totals, leads }
}
