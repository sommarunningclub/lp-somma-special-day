import { Resend } from 'resend'
import { renderDayUseConfirmationEmail } from './dayuse-template'

interface SendArgs {
  nome: string
  email: string
  valor: number
  forma: string
  dataPagamento?: string | null
  transactionId: string
  receiptUrl?: string | null
}

/**
 * Envia o e-mail de confirmação da compra do Day Use (comprovante + infos do
 * evento). Nunca lança: retorna o id do Resend ou null em caso de falha, para
 * não derrubar o fluxo de pagamento.
 */
export async function sendDayUseConfirmation(args: SendArgs): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.VIP_EMAIL_FROM
  if (!apiKey || !from) {
    console.error('[dayuse-email] RESEND_API_KEY ou VIP_EMAIL_FROM não configurados.')
    return null
  }

  try {
    const resend = new Resend(apiKey)
    const { subject, html } = renderDayUseConfirmationEmail(args)
    const { data, error } = await resend.emails.send({ from, to: args.email, subject, html })
    if (error) {
      console.error('[dayuse-email] falha ao enviar:', error.message)
      return null
    }
    return data?.id ?? null
  } catch (e) {
    console.error('[dayuse-email] exceção ao enviar:', e)
    return null
  }
}
