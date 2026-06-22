import { ESQUENTA } from '@/lib/esquenta-constants'

const COLORS = {
  black: '#0a0a0a',
  cream: '#FDF6EC',
  orange: '#FF4800',
  blue: '#005EFF',
  yellow: '#FDB716',
  green: '#1faa59',
}

const LOGO_URL = 'https://1-ano-sommaday.vercel.app/logo-special-day.png'
const LP_URL = 'https://specialday.sommaclub.com.br/'

interface CheckinEmailData {
  nome: string
  distancia?: string | null
}

export function renderCheckinEsquentaEmail({ nome, distancia }: CheckinEmailData): {
  subject: string
  html: string
} {
  const primeiroNome = escapeHtml((nome || '').split(' ')[0] || 'corredor')
  const subject = 'Check-in confirmado — Esquenta Somma Special Day 💌'

  const info = (label: string, value: string) => `
    <td width="50%" valign="top" style="padding:14px 18px;">
      <p style="margin:0;font-size:10px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${COLORS.orange};">${escapeHtml(label)}</p>
      <p style="margin:4px 0 0;font-size:15px;font-weight:bold;color:${COLORS.black};">${escapeHtml(value)}</p>
    </td>`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.blue};font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Seu check-in no Esquenta está garantido! Veja os detalhes e garanta seu ingresso do Somma Special Day com desconto.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.blue};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <img src="${LOGO_URL}" alt="Somma Special Day" width="170" style="display:block;width:170px;max-width:58%;height:auto;" />
            </td>
          </tr>

          <!-- Selo -->
          <tr>
            <td align="center" style="padding-bottom:14px;">
              <span style="display:inline-block;background-color:${COLORS.green};color:#ffffff;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding:8px 18px;border-radius:999px;">Check-in confirmado</span>
            </td>
          </tr>

          <!-- Cabeçalho -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <h1 style="margin:0;color:${COLORS.cream};font-size:28px;line-height:1.15;letter-spacing:1px;text-transform:uppercase;">
                Tá garantido, ${primeiroNome}!
              </h1>
              <p style="margin:12px 0 0;color:#ffffffcc;font-size:14px;line-height:1.6;">
                Seu check-in no <strong>Esquenta Somma Special Day</strong> está confirmado. Bora correr, comer, celebrar e entrar no clima de arraiá com a comunidade. 🧡
              </p>
            </td>
          </tr>

          <!-- Card de detalhes do Esquenta -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.cream};border-radius:20px;overflow:hidden;">
                <tr>
                  <td style="padding:24px 24px 8px;">
                    <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${COLORS.orange};">O seu corre</p>
                    <p style="margin:6px 0 0;font-size:20px;font-weight:bold;color:${COLORS.black};">Esquenta · Edição Junina</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 6px 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        ${info('Data', ESQUENTA.data)}
                        ${info('Local', ESQUENTA.local)}
                      </tr>
                      <tr>
                        ${info('Concentração', ESQUENTA.concentracao)}
                        ${distancia ? info('Distância', distancia) : info('Início do corre', ESQUENTA.inicioCorre)}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bloco do Somma Special Day + CTA desconto -->
          <tr>
            <td style="padding-top:20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:20px;overflow:hidden;">
                <tr>
                  <td style="padding:26px;">
                    <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${COLORS.yellow};">E tem mais…</p>
                    <p style="margin:8px 0 0;font-size:20px;font-weight:bold;line-height:1.25;color:${COLORS.cream};">O Somma Special Day vem aí — garanta seu ingresso com desconto.</p>
                    <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#ffffffb3;">
                      O grande evento de 1 ano do Somma está chegando. Quem é da comunidade garante o melhor preço. Clica no botão e garanta sua vaga.
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
                      <tr>
                        <td align="center">
                          <a href="${LP_URL}" style="display:block;background-color:${COLORS.orange};color:#ffffff;text-decoration:none;text-align:center;font-size:16px;font-weight:bold;padding:16px;border-radius:12px;">
                            Garantir meu ingresso com desconto
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td align="center" style="padding-top:26px;">
              <p style="margin:0;font-size:12px;color:#ffffff99;line-height:1.6;">
                Somma Running Club · Brasília · DF<br />
                Você recebeu este e-mail porque fez check-in no Esquenta Somma Special Day.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
