import { Resend } from 'resend'
import { renderCountdownEmail } from './countdown-vip'
import type { CountdownStepKey } from '@/lib/campaign/vip-countdown-steps'

/** Domínio público usado nos links (descadastro). */
export const SITE_URL = 'https://specialday.sommaclub.com.br'

export interface Recipient {
  id: string
  nome: string
  email: string
}

export interface SendResult {
  sent: { leadId: string; email: string; resendId?: string }[]
  failed: { leadId: string; email: string; error: string }[]
}

function unsubUrl(leadId: string): string {
  return `${SITE_URL}/unsubscribe?u=${encodeURIComponent(leadId)}`
}

function buildPayload(step: CountdownStepKey, r: Recipient, from: string) {
  const unsubscribeUrl = unsubUrl(r.id)
  const { subject, html } = renderCountdownEmail({ nome: r.nome, step, unsubscribeUrl })
  return {
    from,
    to: r.email,
    subject,
    html,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  }
}

/** Envia um passo em lotes de 100 (limite do batch do Resend), com throttle. */
export async function sendCountdownBatch(step: CountdownStepKey, recipients: Recipient[]): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.VIP_EMAIL_FROM
  if (!apiKey || !from) throw new Error('RESEND_API_KEY ou VIP_EMAIL_FROM não configurados.')

  const resend = new Resend(apiKey)
  const sent: SendResult['sent'] = []
  const failed: SendResult['failed'] = []
  const CHUNK = 100

  for (let i = 0; i < recipients.length; i += CHUNK) {
    const chunk = recipients.slice(i, i + CHUNK)
    const payload = chunk.map((r) => buildPayload(step, r, from))

    try {
      const { data, error } = await resend.batch.send(payload)
      if (error) {
        chunk.forEach((r) => failed.push({ leadId: r.id, email: r.email, error: error.message }))
      } else {
        // O batch retorna os ids na mesma ordem do payload.
        const raw = (data as unknown as { data?: { id: string }[] })?.data
        const ids: { id: string }[] = Array.isArray(raw) ? raw : Array.isArray(data) ? (data as { id: string }[]) : []
        chunk.forEach((r, idx) => sent.push({ leadId: r.id, email: r.email, resendId: ids[idx]?.id }))
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      chunk.forEach((r) => failed.push({ leadId: r.id, email: r.email, error: msg }))
    }

    if (i + CHUNK < recipients.length) {
      await new Promise((res) => setTimeout(res, 600))
    }
  }

  return { sent, failed }
}

/** Envio único (modo teste no admin). */
export async function sendCountdownTest(step: CountdownStepKey, email: string, nome = 'Teste Somma'): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.VIP_EMAIL_FROM
  if (!apiKey || !from) throw new Error('RESEND_API_KEY ou VIP_EMAIL_FROM não configurados.')

  const resend = new Resend(apiKey)
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?u=teste`
  const { subject, html } = renderCountdownEmail({ nome, step, unsubscribeUrl })
  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject: `[TESTE] ${subject}`,
    html,
    headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
  })
  if (error) throw new Error(error.message)
  return data?.id ?? null
}
