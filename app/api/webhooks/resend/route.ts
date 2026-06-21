import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Ranking de status: só "sobe", nunca regride (clicado > aberto > entregue > enviado).
const STATUS_RANK: Record<string, number> = {
  sent: 1,
  delivered: 2,
  opened: 3,
  clicked: 4,
}

type ResendEvent = {
  type?: string
  created_at?: string
  data?: {
    email_id?: string
    to?: string[] | string
    subject?: string
    click?: { link?: string; timestamp?: string }
  }
}

/**
 * Verifica a assinatura Svix usada pelo Resend.
 * Se RESEND_WEBHOOK_SECRET não estiver configurado, aceita (modo permissivo) e avisa no log.
 */
function verifySignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[resend-webhook] RESEND_WEBHOOK_SECRET não configurado — pulando verificação de assinatura.')
    return true
  }

  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')
  if (!svixId || !svixTimestamp || !svixSignature) return false

  try {
    const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
    const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`
    const expected = createHmac('sha256', secretBytes).update(signedContent).digest('base64')

    // O header pode ter várias assinaturas separadas por espaço: "v1,<sig> v1,<sig2>"
    return svixSignature.split(' ').some((part) => {
      const sig = part.includes(',') ? part.split(',')[1] : part
      try {
        const a = Buffer.from(sig)
        const b = Buffer.from(expected)
        return a.length === b.length && timingSafeEqual(a, b)
      } catch {
        return false
      }
    })
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  if (!verifySignature(req, rawBody)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  let event: ResendEvent
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const type = (event.type ?? '').replace('email.', '') // sent, delivered, opened, clicked, bounced...
  const emailId = event.data?.email_id ?? null
  const toRaw = event.data?.to
  const email = (Array.isArray(toRaw) ? toRaw[0] : toRaw)?.toLowerCase() ?? null
  const link = event.data?.click?.link ?? null
  const at = event.created_at ?? new Date().toISOString()

  try {
    const supabase = createServerClient()

    // Localiza o lead pelo id do Resend ou pelo e-mail.
    let lead: { id: string; email_status: string | null; email_open_count: number; email_click_count: number } | null = null

    if (emailId) {
      const { data } = await supabase
        .from('lista_vip')
        .select('id, email_status, email_open_count, email_click_count')
        .eq('resend_email_id', emailId)
        .limit(1)
        .maybeSingle()
      lead = data
    }
    if (!lead && email) {
      const { data } = await supabase
        .from('lista_vip')
        .select('id, email_status, email_open_count, email_click_count')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      lead = data
    }

    // Grava o evento bruto (mesmo sem lead casado).
    await supabase.from('email_events').insert({
      lead_id: lead?.id ?? null,
      email,
      resend_email_id: emailId,
      type,
      link,
    })

    if (lead) {
      const update: Record<string, unknown> = {}

      if (type === 'delivered') update.email_delivered_at = at
      if (type === 'opened') {
        update.email_opened_at = at
        update.email_open_count = (lead.email_open_count ?? 0) + 1
      }
      if (type === 'clicked') {
        update.email_clicked_at = at
        update.email_click_count = (lead.email_click_count ?? 0) + 1
      }
      if (type === 'sent') update.email_sent_at = at
      if (type === 'bounced' || type === 'complained' || type === 'failed') {
        update.email_bounced_at = at
        update.email_status = type
      }

      // Atualiza o status só se for "maior" que o atual.
      const currentRank = STATUS_RANK[lead.email_status ?? ''] ?? 0
      const newRank = STATUS_RANK[type] ?? 0
      if (newRank > currentRank) update.email_status = type

      if (Object.keys(update).length > 0) {
        await supabase.from('lista_vip').update(update).eq('id', lead.id)
      }
    }

    // ===== NUTRIÇÃO (independente da lista_vip) =====
    // Procura o lead em nutricao_leads pelo resend_email_id (último enviado)
    // ou via nutricao_sends (qualquer envio anterior).
    let nLead: { id: string; email_status: string | null; email_open_count: number; email_click_count: number; jump_to_final: boolean } | null = null

    if (emailId) {
      const { data } = await supabase
        .from('nutricao_leads')
        .select('id, email_status, email_open_count, email_click_count, jump_to_final')
        .eq('resend_email_id', emailId)
        .limit(1)
        .maybeSingle()
      nLead = data
    }
    if (!nLead && emailId) {
      const { data: sendRow } = await supabase
        .from('nutricao_sends')
        .select('lead_id')
        .eq('resend_email_id', emailId)
        .limit(1)
        .maybeSingle()
      if (sendRow?.lead_id) {
        const { data } = await supabase
          .from('nutricao_leads')
          .select('id, email_status, email_open_count, email_click_count, jump_to_final')
          .eq('id', sendRow.lead_id)
          .maybeSingle()
        nLead = data
      }
    }
    if (!nLead && email) {
      const { data } = await supabase
        .from('nutricao_leads')
        .select('id, email_status, email_open_count, email_click_count, jump_to_final')
        .eq('email', email)
        .limit(1)
        .maybeSingle()
      nLead = data
    }

    if (nLead) {
      const update: Record<string, unknown> = {}
      if (type === 'opened') {
        update.last_opened_at = at
        update.email_open_count = (nLead.email_open_count ?? 0) + 1
      }
      if (type === 'clicked') {
        update.last_clicked_at = at
        update.email_click_count = (nLead.email_click_count ?? 0) + 1
        // Branching: qualquer clique no CTA dispara o pulo pra oferta final.
        if (!nLead.jump_to_final) update.jump_to_final = true
      }
      const currentRank = STATUS_RANK[nLead.email_status ?? ''] ?? 0
      const newRank = STATUS_RANK[type] ?? 0
      if (newRank > currentRank) update.email_status = type

      if (Object.keys(update).length > 0) {
        await supabase.from('nutricao_leads').update(update).eq('id', nLead.id)
      }
    }
  } catch (error) {
    console.error('[resend-webhook] erro ao processar evento:', error)
    // Retorna 200 mesmo assim para o Resend não ficar reenviando indefinidamente.
  }

  return NextResponse.json({ ok: true })
}
