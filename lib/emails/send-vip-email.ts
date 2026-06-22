import { Resend } from 'resend'
import { renderVipTicketEmail } from './vip-ticket'
import { EMAIL_COUPON } from './email-coupon'

interface SendVipEmailArgs {
  nome: string
  email: string
  cupom?: string
}

export async function sendVipTicketEmail({ nome, email, cupom = EMAIL_COUPON.cupom }: SendVipEmailArgs): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.VIP_EMAIL_FROM

  if (!apiKey || !from) {
    console.error('[vip-email] RESEND_API_KEY ou VIP_EMAIL_FROM não configurados.')
    return null
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject: `Não perca: cupom ${cupom} ativo · Somma Special Day 18.07`,
    html: renderVipTicketEmail({ nome, email, cupom }),
  })

  if (error) {
    console.error('[vip-email] Falha ao enviar e-mail:', error)
    return null
  }

  return data?.id ?? null
}
