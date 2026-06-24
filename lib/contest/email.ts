import 'server-only'
import { Resend } from 'resend'

// Envia o código de acesso (OTP) da área do participante. Reaproveita o Resend do projeto.
export async function sendAccessCode(email: string, code: string, nome?: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.VIP_EMAIL_FROM
  if (!apiKey || !from) {
    console.error('[concurso-email] RESEND_API_KEY ou VIP_EMAIL_FROM ausentes')
    return false
  }
  const resend = new Resend(apiKey)
  const html = `
  <div style="background:#005EFF;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:480px;margin:0 auto;background:#F9F0DC;border:4px solid #0a0a0a;border-radius:20px;box-shadow:8px 8px 0 #FF4800;padding:28px;text-align:center">
      <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:#FF4800">Concurso Junino SOMMA</p>
      <h1 style="margin:6px 0 0;font-size:26px;color:#0a0a0a">Seu código de acesso</h1>
      <p style="margin:10px 0 18px;font-size:14px;color:#0a0a0a99">${nome ? `Oi, ${escapeHtml(nome)}! ` : ''}Use o código abaixo pra entrar na sua área e gerenciar sua inscrição.</p>
      <div style="font-size:38px;font-weight:bold;letter-spacing:10px;color:#0a0a0a;background:#fff;border:3px solid #0a0a0a;border-radius:14px;padding:14px 0">${code}</div>
      <p style="margin:16px 0 0;font-size:12px;color:#0a0a0a80">Válido por 15 minutos. Se não foi você, ignore este e-mail.</p>
    </div>
  </div>`
  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: `Seu código de acesso: ${code} · Concurso Junino SOMMA`,
    html,
  })
  if (error) {
    console.error('[concurso-email] falha:', error.message)
    return false
  }
  return true
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}
