import { Resend } from 'resend'
import { renderCheckinEsquentaEmail } from './checkin-esquenta'

interface SendArgs {
  nome: string
  email: string
  distancia?: string | null
}

/** Envia o e-mail de confirmação de check-in do Esquenta. Retorna o id do Resend ou null. */
export async function sendCheckinConfirmation({ nome, email, distancia }: SendArgs): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.VIP_EMAIL_FROM
  if (!apiKey || !from) {
    console.error('[checkin-email] RESEND_API_KEY ou VIP_EMAIL_FROM não configurados.')
    return null
  }

  const resend = new Resend(apiKey)
  const { subject, html } = renderCheckinEsquentaEmail({ nome, distancia })

  const { data, error } = await resend.emails.send({ from, to: email, subject, html })
  if (error) {
    console.error('[checkin-email] falha ao enviar:', error.message)
    return null
  }
  return data?.id ?? null
}
