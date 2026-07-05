/**
 * Template dos e-mails das réguas do evento (Somma Special Day).
 * HTML table-based e inline styles para render seguro em Gmail/Outlook/Apple Mail.
 * Identidade do site: logo oficial, hero azul, card brutalista, botão de WhatsApp.
 */

import { getEventoStep, accentForBase } from '@/lib/evento/reguas'

interface EventoEmailData {
  nome: string
  base: string
  step: string
  unsubscribeUrl: string
}

const COLORS = {
  black: '#0a0a0a',
  cream: '#F9F0DC',
  orange: '#FF4800',
  blue: '#005EFF',
  yellow: '#FDB716',
  green: '#1faa59',
  wa: '#25D366',
  waDark: '#075E54',
}

const LOGO_URL = 'https://1-ano-sommaday.vercel.app/logo-special-day.png'
const WHATSAPP = '5561995372477'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Texto de contraste (preto/branco) para uma cor de fundo hex. */
function contrastOn(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? COLORS.black : '#ffffff'
}

/** Corpo: linhas "• " viram <li>; o resto vira parágrafos. */
function renderBody(lines: string[], nome: string, accent: string): string {
  const primeiro = escapeHtml((nome || '').split(' ')[0] || 'corredor')
  const html: string[] = []
  let i = 0
  while (i < lines.length) {
    const raw = lines[i].replace(/\{\{nome\}\}/g, primeiro)
    if (raw.startsWith('• ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('• ')) {
        items.push(lines[i].slice(2).replace(/\{\{nome\}\}/g, primeiro))
        i++
      }
      html.push(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:2px 0 12px;">${items
          .map(
            (it) =>
              `<tr><td valign="top" style="padding:3px 8px 3px 0;color:${accent};font-size:15px;line-height:1.5;">&bull;</td><td style="padding:3px 0;color:#201d17;font-size:15px;line-height:1.5;">${escapeHtml(
                it
              )}</td></tr>`
          )
          .join('')}</table>`
      )
    } else {
      html.push(`<p style="margin:0 0 12px;color:#201d17;font-size:15px;line-height:1.65;">${escapeHtml(raw)}</p>`)
      i++
    }
  }
  return html.join('')
}

function priceBlock(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 14px;">
    <tr><td align="center" style="background-color:#ffffff;border:3px solid ${COLORS.black};border-radius:14px;padding:16px;">
      <span style="display:inline-block;background:${COLORS.black};color:${COLORS.cream};font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;border-radius:999px;padding:4px 12px;">1º lote</span>
      <span style="font-size:14px;color:#9a9284;text-decoration:line-through;margin:0 8px;">R$ 150,00</span>
      <span style="font-size:24px;font-weight:900;color:${COLORS.orange};">R$ 127,50</span>
      <p style="margin:8px 0 0;font-size:12px;color:#5b5344;">com o cupom <strong style="background:${COLORS.yellow};color:${COLORS.black};padding:1px 6px;border-radius:5px;">SOMMA15</strong> no app TF Sports</p>
    </td></tr>
  </table>`
}

/** Bloco de destaque da atração especial (pagode). Aparece em todos os e-mails. */
function atracaoBlock(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 14px;">
    <tr><td style="background-color:${COLORS.blue};border:3px solid ${COLORS.black};border-radius:14px;padding:16px 18px;">
      <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${COLORS.yellow};">🎤 Atração especial</p>
      <p style="margin:6px 0 0;font-size:18px;font-weight:900;color:#ffffff;line-height:1.15;">Pagode com a Resenha do Sabino</p>
      <p style="margin:6px 0 0;font-size:13px;color:#ffffffcc;">É pra sambar e pra cantar! O pagode que tá bombando em Brasília vai animar o nosso aniversário. 🥁</p>
      <a href="https://www.instagram.com/aresenhadosabino/" style="display:inline-block;margin-top:10px;font-size:12px;font-weight:bold;color:${COLORS.yellow};text-decoration:underline;">Conhecer no Instagram →</a>
    </td></tr>
  </table>`
}

function whatsappButton(waText: string): string {
  const href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}`
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
    <tr><td align="center" style="background-color:${COLORS.wa};border:3px solid ${COLORS.black};border-radius:12px;">
      <a href="${href}" style="display:block;padding:14px;color:#073b2e;text-decoration:none;font-size:15px;font-weight:bold;">💬 Falar no WhatsApp</a>
    </td></tr>
  </table>
  <p style="margin:8px 0 0;text-align:center;font-size:12px;color:#5b5344;">Tira sua dúvida na hora: +55 61 99537-2477</p>`
}

export function renderEventoEmail({ nome, base, step, unsubscribeUrl }: EventoEmailData): {
  subject: string
  html: string
} {
  const cfg = getEventoStep(base, step)
  if (!cfg) throw new Error(`Passo de régua desconhecido: ${base}/${step}`)

  const accent = accentForBase(cfg.base)
  const seloTxt = contrastOn(accent)

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(cfg.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.cream};font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(cfg.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.cream};padding:28px 14px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#FCF6E9;border:3px solid ${COLORS.black};border-radius:20px;overflow:hidden;">

        <!-- Hero azul com logo -->
        <tr><td align="center" style="background-color:${COLORS.blue};padding:26px 20px 22px;">
          <img src="${LOGO_URL}" alt="Somma Special Day" width="180" style="display:block;width:180px;max-width:60%;height:auto;" />
          <div style="margin-top:14px;">
            <span style="display:inline-block;background-color:${accent};color:${seloTxt};border:2px solid ${COLORS.black};border-radius:999px;padding:5px 14px;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(
    cfg.selo
  )}</span>
          </div>
        </td></tr>

        <!-- Faixa preta com headline -->
        <tr><td align="center" style="background-color:${COLORS.black};padding:16px 20px;">
          <h1 style="margin:0;color:${COLORS.cream};font-size:26px;line-height:1.05;letter-spacing:0.5px;text-transform:uppercase;font-weight:900;">${escapeHtml(
    cfg.headline
  )}</h1>
        </td></tr>

        <!-- Corpo -->
        <tr><td style="padding:24px 26px 8px;">
          ${renderBody(cfg.body, nome, accent)}
          ${atracaoBlock()}
          ${cfg.showPrice ? priceBlock() : ''}

          <!-- CTA -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
            <tr><td align="center" style="background-color:${COLORS.orange};border:3px solid ${COLORS.black};border-radius:12px;">
              <a href="${cfg.ctaUrl}" style="display:block;padding:16px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(
    cfg.cta
  )}</a>
            </td></tr>
          </table>

          ${whatsappButton(cfg.waText)}

          <!-- Data e local -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 4px;background-color:${COLORS.black};border-radius:14px;">
            <tr>
              <td width="50%" valign="top" style="padding:16px 20px;">
                <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${COLORS.yellow};">Data e hora</p>
                <p style="margin:4px 0 0;font-size:15px;font-weight:bold;color:${COLORS.cream};">18/07/2026 · 06h</p>
              </td>
              <td width="50%" valign="top" style="padding:16px 20px;">
                <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${COLORS.yellow};">Local</p>
                <p style="margin:4px 0 0;font-size:15px;font-weight:bold;color:${COLORS.cream};">COPMDF · Brasília</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Rodapé -->
        <tr><td align="center" style="padding:18px 20px 24px;">
          <p style="margin:0;font-size:12px;color:#0a0a0a80;line-height:1.6;">Somma Running Club · Brasília/DF</p>
          <p style="margin:8px 0 0;font-size:12px;color:#0a0a0a80;">
            <a href="${unsubscribeUrl}" style="color:#0a0a0a80;text-decoration:underline;">Não quero mais receber estes e-mails</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject: cfg.subject, html }
}
