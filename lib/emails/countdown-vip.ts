import { PRESALE } from '@/lib/presale-constants'
import { getCountdownStep, type CountdownStepKey } from '@/lib/campaign/vip-countdown-steps'

interface CountdownEmailData {
  nome: string
  step: CountdownStepKey
  /** Link de descadastro (one-click). */
  unsubscribeUrl: string
}

const COLORS = {
  black: '#0a0a0a',
  cream: '#FDF6EC',
  orange: '#FF4800',
  blue: '#005EFF',
  yellow: '#FDB716',
  green: '#1faa59',
  red: '#E11900',
}

const LOGO_URL = 'https://1-ano-sommaday.vercel.app/logo-special-day.png'

function bannerColor(theme: 'normal' | 'alerta' | 'final'): string {
  if (theme === 'final') return COLORS.red
  if (theme === 'alerta') return COLORS.orange
  return COLORS.black
}

export function renderCountdownEmail({ nome, step, unsubscribeUrl }: CountdownEmailData): {
  subject: string
  html: string
} {
  const cfg = getCountdownStep(step)
  if (!cfg) throw new Error(`Passo de campanha desconhecido: ${step}`)

  const primeiroNome = escapeHtml((nome || '').split(' ')[0] || 'corredor')
  const banner = bannerColor(cfg.theme)

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(cfg.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.black};font-family:Arial,Helvetica,sans-serif;">
  <!-- preheader oculto -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Não perca: ${escapeHtml(cfg.countdown)} — cupom ${escapeHtml(PRESALE.cupom)} garante ${escapeHtml(PRESALE.precoPor)}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.black};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <img src="${LOGO_URL}" alt="Somma Special Day" width="180" style="display:block;width:180px;max-width:60%;height:auto;" />
            </td>
          </tr>

          <!-- Faixa de contagem regressiva -->
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${banner};border-radius:999px;padding:8px 18px;">
                    <span style="color:#ffffff;font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(cfg.kicker)} · ${escapeHtml(cfg.countdown)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cabeçalho -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <h1 style="margin:0;color:${COLORS.cream};font-size:26px;line-height:1.2;letter-spacing:1px;text-transform:uppercase;">
                ${escapeHtml(cfg.headline)}
              </h1>
              <p style="margin:12px 0 0;color:#ffffffcc;font-size:14px;line-height:1.6;">
                Olá, ${primeiroNome}! ${escapeHtml(cfg.message)}
              </p>
            </td>
          </tr>

          <!-- Cupom + preço + CTA -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.cream};border-radius:20px;overflow:hidden;">
                <tr>
                  <td style="padding:28px;">
                    <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${COLORS.orange};">Seu cupom de pré-venda — ${escapeHtml(PRESALE.loteLabel)}</p>

                    <!-- Cupom -->
                    <div style="margin-top:16px;border:2px dashed ${COLORS.orange};border-radius:14px;padding:18px;text-align:center;">
                      <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#0a0a0a80;">Cupom da pré-venda</p>
                      <p style="margin:6px 0 0;font-size:40px;font-weight:bold;letter-spacing:5px;color:${COLORS.orange};line-height:1;">${escapeHtml(PRESALE.cupom)}</p>
                    </div>

                    <!-- Preço de / por -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
                      <tr>
                        <td align="center" style="padding:14px;background-color:#0a0a0a08;border-radius:12px;">
                          <span style="font-size:13px;color:#0a0a0a80;text-decoration:line-through;">De ${escapeHtml(PRESALE.precoDe)}</span>
                          <span style="display:inline-block;margin:0 6px;color:#0a0a0a40;">&rarr;</span>
                          <span style="font-size:22px;font-weight:bold;color:${COLORS.green};">Por ${escapeHtml(PRESALE.precoPor)}</span>
                          <p style="margin:6px 0 0;font-size:12px;font-weight:bold;color:${COLORS.green};">Você economiza ${escapeHtml(PRESALE.economia)} (${escapeHtml(PRESALE.descontoPct)} de desconto)</p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
                      <tr>
                        <td align="center">
                          <a href="${PRESALE.eventoUrl}" style="display:block;background-color:${COLORS.orange};color:#ffffff;text-decoration:none;text-align:center;font-size:16px;font-weight:bold;padding:16px;border-radius:12px;">
                            ${escapeHtml(cfg.cta)}
                          </a>
                          <p style="margin:8px 0 0;font-size:11px;color:#0a0a0a80;">Aplique o cupom <strong>${escapeHtml(PRESALE.cupom)}</strong> na hora de pagar no app TF Sports.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Data e local -->
          <tr>
            <td style="padding-top:20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a40;border-radius:14px;">
                <tr>
                  <td width="50%" valign="top" style="padding:16px 20px;">
                    <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${COLORS.yellow};">Data e Hora</p>
                    <p style="margin:4px 0 0;font-size:15px;font-weight:bold;color:${COLORS.cream};">18/07/2026 · 06:00</p>
                  </td>
                  <td width="50%" valign="top" style="padding:16px 20px;">
                    <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${COLORS.yellow};">Local</p>
                    <p style="margin:4px 0 0;font-size:15px;font-weight:bold;color:${COLORS.cream};">COPMDF · Brasília</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rodapé + descadastro -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#ffffff99;line-height:1.6;">
                Somma Running Club · Brasília · DF<br />
                Você recebeu este e-mail porque garantiu o cupom de pré-venda do Somma Special Day.
              </p>
              <p style="margin:10px 0 0;font-size:12px;color:#ffffff99;">
                <a href="${unsubscribeUrl}" style="color:#ffffffcc;text-decoration:underline;">Não quero mais receber estes e-mails</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject: cfg.subject, html }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
