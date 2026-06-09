import { Resend } from 'resend'
import { renderVipTicketEmail } from './vip-ticket'
import { PRESALE } from '@/lib/presale-constants'

interface SendVipEmailArgs {
  nome: string
  email: string
  cupom?: string
}

export async function sendVipTicketEmail({ nome, email, cupom = PRESALE.cupom }: SendVipEmailArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.VIP_EMAIL_FROM

  if (!apiKey || !from) {
    console.error('[vip-email] RESEND_API_KEY ou VIP_EMAIL_FROM não configurados.')
    return
  }

  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `Seu cupom ${cupom} chegou — pré-venda Somma Special Day`,
    html: renderVipTicketEmail({ nome, email, cupom }),
  })

  if (error) {
    console.error('[vip-email] Falha ao enviar e-mail:', error)
  }
}
