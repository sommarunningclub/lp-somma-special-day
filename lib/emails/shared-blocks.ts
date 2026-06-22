/**
 * Blocos HTML reutilizáveis entre todos os templates de e-mail.
 * Garante mensagem padronizada (download do app, busca, cupom, Porto Seguro).
 */

import { PRESALE } from '@/lib/presale-constants'
import { webcalUrl, googleUrl, outlookUrl } from '@/lib/agenda-subscribe'

interface Palette {
  black: string
  cream: string
  orange: string
  yellow: string
  /** Cor do background do e-mail — usada para escolher contraste interno. */
  bg: 'light' | 'dark'
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Bloco "Como funciona o resgate" — explica passo a passo o processo de
 * baixar app → buscar evento → aplicar cupom. Reforça vantagem Porto Seguro.
 *
 * @param cupom Código a destacar (ex.: SOMMAVIP). Se omitido, fala genericamente.
 * @param colors Paleta do template para harmonizar com o tema (light/dark bg).
 */
export function howItWorksBlock(cupom: string | undefined, colors: Palette): string {
  const code = cupom ? cupom.toUpperCase() : null
  const isDark = colors.bg === 'dark'
  const cardBg = '#ffffff'
  const text = colors.black
  const muted = '#0a0a0a99'
  const step3Title = code
    ? `Aplique o cupom <span style="font-weight:bold;color:${colors.orange};letter-spacing:2px;">${esc(code)}</span> na finalização`
    : 'Aplique seu cupom de desconto na finalização'

  return `
    <!-- COMO FUNCIONA -->
    <tr>
      <td style="padding-top:18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${cardBg};border:4px solid ${colors.black};border-radius:18px;overflow:hidden;">
          <tr>
            <td style="background-color:${colors.black};padding:14px 22px;">
              <span style="color:${colors.yellow};font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">
                ⚡ Como resgatar sua vaga
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="top" width="44">
                    <div style="width:34px;height:34px;border-radius:50%;background-color:${colors.orange};color:#ffffff;text-align:center;line-height:34px;font-size:15px;font-weight:bold;">1</div>
                  </td>
                  <td valign="top" style="padding-left:14px;padding-bottom:14px;">
                    <p style="margin:0;font-size:15px;font-weight:bold;color:${text};">Baixe o app TF Sports</p>
                    <p style="margin:3px 0 0;font-size:13px;line-height:1.5;color:${muted};">Disponível para iPhone (App Store) e Android (Google Play). É gratuito.</p>
                  </td>
                </tr>
                <tr>
                  <td valign="top" width="44">
                    <div style="width:34px;height:34px;border-radius:50%;background-color:${colors.orange};color:#ffffff;text-align:center;line-height:34px;font-size:15px;font-weight:bold;">2</div>
                  </td>
                  <td valign="top" style="padding-left:14px;padding-bottom:14px;">
                    <p style="margin:0;font-size:15px;font-weight:bold;color:${text};">Procure por "Somma Special Day"</p>
                    <p style="margin:3px 0 0;font-size:13px;line-height:1.5;color:${muted};">Dentro do app, busque pelo evento e abra a página oficial.</p>
                  </td>
                </tr>
                <tr>
                  <td valign="top" width="44">
                    <div style="width:34px;height:34px;border-radius:50%;background-color:${colors.orange};color:#ffffff;text-align:center;line-height:34px;font-size:15px;font-weight:bold;">3</div>
                  </td>
                  <td valign="top" style="padding-left:14px;padding-bottom:14px;">
                    <p style="margin:0;font-size:15px;font-weight:bold;color:${text};">${step3Title}</p>
                    <p style="margin:3px 0 0;font-size:13px;line-height:1.5;color:${muted};">Na hora de pagar, cole o código no campo "Aplicar cupom" e o desconto entra automaticamente.</p>
                  </td>
                </tr>
              </table>

              <!-- Destaque Porto Seguro -->
              <div style="margin-top:8px;border:3px solid ${colors.yellow};background-color:${colors.yellow}1A;border-radius:14px;padding:16px 18px;">
                <p style="margin:0;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${colors.black};">
                  💳 Bônus Porto Seguro
                </p>
                <p style="margin:6px 0 0;font-size:13px;line-height:1.5;color:${text};">
                  Quem é cliente Porto Seguro tem <strong>desconto extra</strong> pagando com o cartão da Porto na finalização. Use o cartão Porto Seguro e os descontos acumulam.
                </p>
              </div>

              <!-- Botões das lojas -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
                <tr>
                  <td style="padding:4px;">
                    <a href="${PRESALE.appStoreUrl}" style="display:block;background-color:${colors.black};color:#ffffff;text-decoration:none;text-align:center;font-size:13px;font-weight:bold;padding:12px;border-radius:10px;">Baixar (iPhone)</a>
                  </td>
                  <td style="padding:4px;">
                    <a href="${PRESALE.playStoreUrl}" style="display:block;background-color:${colors.black};color:#ffffff;text-decoration:none;text-align:center;font-size:13px;font-weight:bold;padding:12px;border-radius:10px;">Baixar (Android)</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

/**
 * Bloco "Adicione à sua agenda" — destaca o Special Day + curadoria Somma
 * (todos os eventos do ano + corridas do DF) com 4 botões diretos por
 * plataforma (Apple, Google, Android, Outlook). Não envia pra landing
 * externa — assina direto.
 *
 * @param _ref Mantido para compatibilidade, mas não é mais usado.
 * @param colors Paleta do template para harmonizar com o tema.
 */
export function addToCalendarBlock(
  _ref: 'email-nutricao' | 'email-countdown' | 'email-ticket',
  colors: Palette,
): string {
  const cardBg = '#ffffff'
  const muted = '#0a0a0a99'

  const btnStyle = (bg: string, fg: string) =>
    `display:block;background-color:${bg};color:${fg};text-decoration:none;text-align:center;font-size:13px;font-weight:bold;letter-spacing:1px;padding:14px 10px;border-radius:10px;border:2px solid ${bg};`

  return `
    <!-- ADICIONE NA SUA AGENDA -->
    <tr>
      <td style="padding-top:18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${cardBg};border:4px solid ${colors.yellow};border-radius:18px;overflow:hidden;">
          <tr>
            <td style="background-color:${colors.yellow};padding:14px 22px;">
              <span style="color:${colors.black};font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">
                🗓 Bônus · Adicione na sua agenda
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:22px;">
              <p style="margin:0;font-size:17px;font-weight:bold;color:${colors.black};line-height:1.3;">
                Nunca mais perca um evento Somma.
              </p>
              <p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:${muted};">
                Assine a Agenda Somma Club uma única vez e seu calendário recebe automaticamente:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
                <tr>
                  <td valign="top" width="32" style="padding:6px 0;">
                    <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;font-size:13px;">⭐</span>
                  </td>
                  <td valign="top" style="padding:6px 0;">
                    <p style="margin:0;font-size:13px;line-height:1.5;color:${colors.black};">
                      <strong style="color:${colors.orange};">Somma Special Day</strong> · 18 de julho · COPMDF
                    </p>
                  </td>
                </tr>
                <tr>
                  <td valign="top" width="32" style="padding:6px 0;">
                    <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;font-size:13px;">📅</span>
                  </td>
                  <td valign="top" style="padding:6px 0;">
                    <p style="margin:0;font-size:13px;line-height:1.5;color:${colors.black};">
                      Todos os <strong>eventos Somma Club</strong> do ano inteiro
                    </p>
                  </td>
                </tr>
                <tr>
                  <td valign="top" width="32" style="padding:6px 0;">
                    <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;font-size:13px;">🏁</span>
                  </td>
                  <td valign="top" style="padding:6px 0;">
                    <p style="margin:0;font-size:13px;line-height:1.5;color:${colors.black};">
                      Curadoria das <strong>principais corridas do DF</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:18px 0 8px;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${colors.black};">
                Escolha sua plataforma:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px;">
                    <a href="${webcalUrl}" style="${btnStyle(colors.black, '#ffffff')}">iPhone / Mac</a>
                  </td>
                  <td style="padding:4px;">
                    <a href="${googleUrl}" style="${btnStyle('#1a73e8', '#ffffff')}">Google Calendar</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px;">
                    <a href="${googleUrl}" style="${btnStyle('#16a34a', '#ffffff')}">Android</a>
                  </td>
                  <td style="padding:4px;">
                    <a href="${outlookUrl}" style="${btnStyle('#0078D4', '#ffffff')}">Outlook</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}
