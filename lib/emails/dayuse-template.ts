/**
 * E-mail de confirmação da compra do ingresso Day Use do Special Day.
 * Traz um comprovante montado por nós (nome, valor, forma, data, ID) + link do
 * comprovante oficial do Asaas, e as informações do evento.
 */

const COLORS = {
  black: '#0a0a0a',
  cream: '#F9F0DC',
  orange: '#FF4800',
  yellow: '#FDB716',
  blue: '#005EFF',
}

// Dados fixos do evento (sábado 18/07/2026, 07h — Parque da Cidade, Brasília-DF).
const EVENTO = {
  data: '18 de julho de 2026 · sábado',
  hora: 'a partir das 07h',
  local: 'Parque da Cidade — Plano Piloto, Brasília-DF',
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function fmtBRL(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

/** Converte "2026-07-14" (ou ISO) para "14/07/2026"; devolve o original se não casar. */
function fmtData(raw?: string | null): string {
  if (!raw) return '—'
  const m = String(raw).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(raw)
}

interface DayUseEmailArgs {
  nome: string
  valor: number
  forma: string
  dataPagamento?: string | null
  transactionId: string
  receiptUrl?: string | null
}

export function renderDayUseConfirmationEmail(args: DayUseEmailArgs): { subject: string; html: string } {
  const { nome, valor, forma, dataPagamento, transactionId, receiptUrl } = args
  const primeiroNome = esc(nome.trim().split(/\s+/)[0] || nome)
  const muted = '#0a0a0a99'

  const linhaComprovante = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #0a0a0a14;font-size:13px;color:${muted};">${esc(label)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #0a0a0a14;font-size:13px;font-weight:bold;color:${COLORS.black};text-align:right;">${esc(value)}</td>
    </tr>`

  const botaoComprovante = receiptUrl
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="padding:4px;">
          <a href="${esc(receiptUrl)}" style="display:block;background-color:${COLORS.black};color:#ffffff;text-decoration:none;text-align:center;font-size:13px;font-weight:bold;letter-spacing:1px;padding:14px;border-radius:10px;">Ver comprovante oficial (Asaas)</a>
        </td>
      </tr>
    </table>`
    : ''

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:${COLORS.cream};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.cream};padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background-color:${COLORS.orange};border:4px solid ${COLORS.black};border-radius:18px;padding:28px 24px;text-align:center;">
              <p style="margin:0;font-size:12px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:${COLORS.cream};">Special Day · Ingresso Day Use</p>
              <p style="margin:10px 0 0;font-size:30px;line-height:1.1;font-weight:800;color:${COLORS.cream};">Pagamento confirmado! ✅</p>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:${COLORS.cream};">
                ${primeiroNome}, deu tudo certo — seu Day Use está garantido. Te esperamos no after!
              </p>
            </td>
          </tr>

          <!-- COMPROVANTE -->
          <tr>
            <td style="padding-top:18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:4px solid ${COLORS.black};border-radius:18px;overflow:hidden;">
                <tr>
                  <td style="background-color:${COLORS.black};padding:14px 22px;">
                    <span style="color:${COLORS.yellow};font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">🧾 Comprovante de pagamento</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:22px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${linhaComprovante('Comprador', nome)}
                      ${linhaComprovante('Produto', 'Ingresso Day Use — Special Day')}
                      ${linhaComprovante('Valor pago', fmtBRL(valor))}
                      ${linhaComprovante('Forma de pagamento', forma)}
                      ${linhaComprovante('Data do pagamento', fmtData(dataPagamento))}
                      ${linhaComprovante('ID da transação', transactionId)}
                    </table>
                    ${botaoComprovante}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- INFOS DO EVENTO -->
          <tr>
            <td style="padding-top:18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:4px solid ${COLORS.blue};border-radius:18px;overflow:hidden;">
                <tr>
                  <td style="background-color:${COLORS.blue};padding:14px 22px;">
                    <span style="color:${COLORS.cream};font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">📍 Informações do evento</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:22px;">
                    <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:${COLORS.black};">🗓 ${esc(EVENTO.data)}</p>
                    <p style="margin:0 0 4px;font-size:14px;color:${muted};">⏰ ${esc(EVENTO.hora)}</p>
                    <p style="margin:0 0 16px;font-size:14px;color:${muted};">📌 ${esc(EVENTO.local)}</p>

                    <p style="margin:0 0 6px;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${COLORS.orange};">O que seu Day Use dá acesso</p>
                    <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:${COLORS.black};">
                      Acesso a <strong>todo o after</strong>: show ao vivo da <strong>Resenha do Sabino</strong>, DJ, <strong>gincana</strong>, <strong>sorteios</strong>, bar e as ativações dos parceiros.
                    </p>

                    <div style="border:3px solid ${COLORS.yellow};background-color:${COLORS.yellow}1A;border-radius:14px;padding:14px 16px;">
                      <p style="margin:0;font-size:13px;line-height:1.6;color:${COLORS.black};">
                        ⚠️ <strong>Importante:</strong> o Day Use <strong>não inclui o kit</strong> nem <strong>a corrida</strong>. E o sorteio do <strong>Adidas Evo SL</strong> é exclusivo de quem comprou o kit — você concorre a todos os outros.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:22px 12px;text-align:center;">
              <p style="margin:0;font-size:12px;color:${muted};">Somma Running Club · Special Day 2026</p>
              <p style="margin:6px 0 0;font-size:11px;color:${muted};">Dúvidas? Responda este e-mail ou fale com a gente em contato@sommaclub.com.br</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return {
    subject: '✅ Day Use confirmado — Special Day 18/07',
    html,
  }
}
