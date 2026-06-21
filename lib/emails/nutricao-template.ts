import { getNutricaoStep, type NutricaoStepKey } from '@/lib/nutricao/nutricao-steps'
import { PRESALE } from '@/lib/presale-constants'

interface NutricaoEmailData {
  nome: string
  step: NutricaoStepKey
  unsubscribeUrl: string
}

const COLORS = {
  black: '#0a0a0a',
  cream: '#F9F0DC',
  orange: '#FF4800',
  blue: '#005EFF',
  yellow: '#FDB716',
  pink: '#FD6FDB',
}

const LOGO_URL = 'https://1-ano-sommaday.vercel.app/logo-special-day.png'
const SITE_URL = 'https://specialday.sommaclub.com.br'

function bannerColor(theme: 'normal' | 'alerta' | 'final'): string {
  if (theme === 'final') return COLORS.orange
  if (theme === 'alerta') return COLORS.yellow
  return COLORS.blue
}

function bannerText(theme: 'normal' | 'alerta' | 'final'): string {
  if (theme === 'alerta') return COLORS.black
  return '#ffffff'
}

export function renderNutricaoEmail({ nome, step, unsubscribeUrl }: NutricaoEmailData): {
  subject: string
  html: string
} {
  const cfg = getNutricaoStep(step)
  if (!cfg) throw new Error(`Passo de nutrição desconhecido: ${step}`)

  const primeiroNome = escapeHtml((nome || '').split(' ')[0] || 'corredor')
  const banner = bannerColor(cfg.theme)
  const bannerTxt = bannerText(cfg.theme)
  // CTA aponta para a home com âncora da seção de inscrição (TFSports)
  const ctaUrl = step === 'd6_oferta_final' ? PRESALE.eventoUrl : `${SITE_URL}/#tfsports`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(cfg.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.cream};font-family:Arial,Helvetica,sans-serif;color:${COLORS.black};">
  <!-- preheader oculto -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(cfg.selo)} · Somma Special Day · 18.07 no COPMDF.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.cream};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:18px;">
              <img src="${LOGO_URL}" alt="Somma Special Day" width="180" style="display:block;width:180px;max-width:60%;height:auto;" />
            </td>
          </tr>

          <!-- Selo do passo -->
          <tr>
            <td align="center" style="padding-bottom:18px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${banner};border-radius:999px;padding:8px 18px;">
                    <span style="color:${bannerTxt};font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(cfg.selo)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cabeçalho -->
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <h1 style="margin:0;color:${COLORS.black};font-size:26px;line-height:1.15;letter-spacing:0.5px;text-transform:uppercase;font-weight:900;">
                ${escapeHtml(cfg.headline)}
              </h1>
            </td>
          </tr>

          <!-- Card branco com mensagem + CTA -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:4px solid ${COLORS.black};border-radius:18px;margin-top:18px;">
                <tr>
                  <td style="padding:28px;">
                    <p style="margin:0;color:${COLORS.black};font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">
                      Olá, ${primeiroNome}
                    </p>
                    <p style="margin:10px 0 0;color:#0a0a0aDD;font-size:15px;line-height:1.65;">
                      ${escapeHtml(cfg.message)}
                    </p>

                    <!-- CTA -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;">
                      <tr>
                        <td align="center">
                          <a href="${ctaUrl}" style="display:block;background-color:${COLORS.orange};color:#ffffff;text-decoration:none;text-align:center;font-size:16px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding:18px;border-radius:12px;border:3px solid ${COLORS.black};">
                            ${escapeHtml(cfg.cta)}
                          </a>
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
            <td style="padding-top:18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.black};border-radius:14px;">
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
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#0a0a0a80;line-height:1.6;">
                Somma Running Club · Brasília · DF<br />
                Você está recebendo este e-mail porque entrou na nossa lista de novidades do Somma Special Day.
              </p>
              <p style="margin:10px 0 0;font-size:12px;color:#0a0a0a80;">
                <a href="${unsubscribeUrl}" style="color:#0a0a0a80;text-decoration:underline;">Não quero mais receber estes e-mails</a>
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
