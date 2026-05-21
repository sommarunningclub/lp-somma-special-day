interface VipTicketEmailData {
  nome: string
  email: string
  codigoUnico: string
}

const COLORS = {
  black: '#0a0a0a',
  cream: '#FDF6EC',
  orange: '#FF4800',
  blue: '#005EFF',
  yellow: '#FDB716',
}

export function renderVipTicketEmail({ nome, email, codigoUnico }: VipTicketEmailData): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Seu cupom VIP — Somma Special Day</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.blue};font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.blue};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <!-- Cabeçalho -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <h1 style="margin:0;color:${COLORS.cream};font-size:24px;letter-spacing:2px;text-transform:uppercase;">
                Você está na Lista VIP! 🎉
              </h1>
              <p style="margin:8px 0 0;color:#ffffffcc;font-size:14px;line-height:1.5;">
                Guarde este e-mail. Seu cupom é o seu acesso antecipado ao Somma Special Day.
              </p>
            </td>
          </tr>

          <!-- Ticket -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.cream};border-radius:20px;overflow:hidden;">
                <tr>
                  <td style="padding:32px 28px 24px;">
                    <!-- Tag VIP -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:18px;font-weight:bold;letter-spacing:2px;color:${COLORS.black};text-transform:uppercase;">
                          Somma Special Day
                        </td>
                        <td align="right">
                          <span style="display:inline-block;background-color:${COLORS.orange};color:#ffffff;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;padding:6px 12px;border-radius:4px;">
                            VIP Pass
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Passageiro -->
                    <div style="margin-top:24px;padding-bottom:18px;border-bottom:2px solid #0a0a0a0d;">
                      <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#0a0a0a80;">Passageiro VIP</p>
                      <p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:${COLORS.black};">${escapeHtml(nome)}</p>
                      <p style="margin:2px 0 0;font-size:13px;color:#0a0a0a99;">${escapeHtml(email)}</p>
                    </div>

                    <!-- Cupom -->
                    <div style="margin-top:24px;">
                      <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#0a0a0a80;">Cupom da pré-venda</p>
                      <p style="margin:4px 0 0;font-size:40px;font-weight:bold;letter-spacing:4px;color:${COLORS.orange};line-height:1;">${escapeHtml(codigoUnico)}</p>
                      <p style="margin:8px 0 0;font-size:13px;color:#0a0a0a99;line-height:1.5;">
                        Use este código no app TF Sports para liberar seu benefício VIP.
                      </p>
                    </div>

                    <!-- Data e Local -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                      <tr>
                        <td width="50%" valign="top">
                          <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#0a0a0a80;">Data e Hora</p>
                          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${COLORS.black};">18/07/2026 - 06:00</p>
                        </td>
                        <td width="50%" valign="top">
                          <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#0a0a0a80;">Local</p>
                          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${COLORS.black};">COPMDF</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Picote -->
                <tr>
                  <td style="padding:0 28px;">
                    <div style="border-top:2px dashed #0a0a0a26;"></div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 28px 28px;">
                    <p style="margin:0;font-size:16px;font-weight:bold;color:${COLORS.black};">Código gerado!</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#0a0a0a99;">Acesso antecipado e cupom VIP garantidos.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Aviso -->
          <tr>
            <td style="padding-top:24px;">
              <div style="border:3px solid ${COLORS.yellow};border-radius:14px;background-color:#0a0a0a40;padding:16px 20px;">
                <p style="margin:0;font-size:16px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${COLORS.yellow};">
                  📸 Salve este cupom!
                </p>
                <p style="margin:6px 0 0;font-size:13px;color:#ffffffe6;line-height:1.5;">
                  Este é o seu comprovante de vaga VIP. Você vai precisar do código no dia do evento.
                </p>
              </div>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#ffffff99;line-height:1.6;">
                Somma Running Club · Brasília · DF<br />
                Você recebeu este e-mail porque entrou na Lista VIP do Somma Special Day.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
