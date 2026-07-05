import { Resend } from 'resend'
import { renderEventoEmail } from '@/lib/emails/evento-template'
import { SITE_URL, type EventoBase } from './reguas'

export interface Recipient {
  /** Chave de dedup (e-mail lowercase). */
  key: string
  nome: string
  email: string
}

export interface SendResult {
  sent: { key: string; email: string; resendId?: string }[]
  failed: { key: string; email: string; error: string }[]
}

function unsubUrl(base: EventoBase, key: string): string {
  return `${SITE_URL}/unsubscribe?u=${encodeURIComponent(key)}&b=evt:${base}`
}

function buildPayload(base: EventoBase, step: string, r: Recipient, from: string) {
  const unsubscribeUrl = unsubUrl(base, r.key)
  const { subject, html } = renderEventoEmail({ nome: r.nome, base, step, unsubscribeUrl })
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
export async function sendEventoBatch(base: EventoBase, step: string, recipients: Recipient[]): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.VIP_EMAIL_FROM
  if (!apiKey || !from) throw new Error('RESEND_API_KEY ou VIP_EMAIL_FROM não configurados.')

  const resend = new Resend(apiKey)
  const sent: SendResult['sent'] = []
  const failed: SendResult['failed'] = []
  const CHUNK = 100

  for (let i = 0; i < recipients.length; i += CHUNK) {
    const chunk = recipients.slice(i, i + CHUNK)
    const payload = chunk.map((r) => buildPayload(base, step, r, from))

    try {
      const { data, error } = await resend.batch.send(payload)
      if (error) {
        chunk.forEach((r) => failed.push({ key: r.key, email: r.email, error: error.message }))
      } else {
        const raw = (data as unknown as { data?: { id: string }[] })?.data
        const ids: { id: string }[] = Array.isArray(raw) ? raw : Array.isArray(data) ? (data as { id: string }[]) : []
        chunk.forEach((r, idx) => sent.push({ key: r.key, email: r.email, resendId: ids[idx]?.id }))
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      chunk.forEach((r) => failed.push({ key: r.key, email: r.email, error: msg }))
    }

    if (i + CHUNK < recipients.length) {
      await new Promise((res) => setTimeout(res, 600))
    }
  }

  return { sent, failed }
}

/** Envio único (modo teste no admin). */
export async function sendEventoTest(base: EventoBase, step: string, email: string, nome = 'Teste Somma'): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.VIP_EMAIL_FROM
  if (!apiKey || !from) throw new Error('RESEND_API_KEY ou VIP_EMAIL_FROM não configurados.')

  const resend = new Resend(apiKey)
  const r: Recipient = { key: email.toLowerCase(), nome, email }
  const { error } = await resend.emails.send(buildPayload(base, step, r, from))
  if (error) throw new Error(error.message)
}
