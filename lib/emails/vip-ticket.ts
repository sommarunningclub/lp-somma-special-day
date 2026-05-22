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

// URL pública absoluta — clientes de e-mail não carregam caminhos relativos nem SVG.
// PNG com fundo transparente servido pelo nosso domínio (o PNG do Shopify vinha com fundo branco).
const LOGO_URL = 'https://1-ano-sommaday.vercel.app/logo-special-day.png'
const APP_STORE_URL = 'https://apps.apple.com/br/app/tfsports/id1251078517'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=br.com.tfsports.customer&hl=pt_BR'

const PASSOS = [
  {
    n: '1',
    titulo: 'Baixe o app TFSports',
    texto: 'Disponível para iPhone (App Store) e Android (Google Play). É gratuito.',
  },
  {
    n: '2',
    titulo: 'Crie sua conta ou faça login',
    texto: 'Abra o app, toque em Entrar e, se ainda não tiver cadastro, selecione "Não tenho conta".',
  },
  {
    n: '3',
    titulo: 'Encontre o Somma Special Day',
    texto: 'Acesse a aba TFSports dentro do app e procure pelo nosso evento.',
  },
  {
    n: '4',
    titulo: 'Escolha sua inscrição',
    texto: 'Selecione a modalidade (4 km ou 8 km), o kit e o tamanho da camiseta.',
  },
  {
    n: '5',
    titulo: 'Aplique o seu cupom VIP',
    texto: 'Na confirmação, toque em "Inserir cupom" e use o código que está logo abaixo neste e-mail.',
  },
  {
    n: '6',
    titulo: 'Finalize o pagamento',
    texto: 'Pague com Pix ou cartão. Com o Cartão Porto Bank, você pode ter ainda mais desconto.',
  },
]

export function renderVipTicketEmail({ nome, email, codigoUnico }: VipTicketEmailData): string {
  const passosHtml = PASSOS.map(
    (p) => `
      <tr>
        <td valign="top" style="padding:0 0 16px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td valign="top" width="40">
                <div style="width:30px;height:30px;border-radius:8px;background-color:${COLORS.orange};color:#ffffff;font-size:15px;font-weight:bold;text-align:center;line-height:30px;">${p.n}</div>
              </td>
              <td valign="top" style="padding-left:12px;">
                <p style="margin:0;font-size:15px;font-weight:bold;color:${COLORS.black};">${p.titulo}</p>
                <p style="margin:3px 0 0;font-size:13px;line-height:1.5;color:#0a0a0a99;">${p.texto}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
  ).join('')

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
          <!-- Logo do evento -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <img src="${LOGO_URL}" alt="Somma Special Day" width="180" style="display:block;width:180px;max-width:60%;height:auto;" />
            </td>
          </tr>

          <!-- Cabeçalho -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <h1 style="margin:0;color:${COLORS.cream};font-size:24px;letter-spacing:2px;text-transform:uppercase;">
                Você está na Lista VIP! 🎉
              </h1>
              <p style="margin:8px 0 0;color:#ffffffcc;font-size:14px;line-height:1.5;">
                Olá, ${escapeHtml(nome.split(' ')[0])}! Seu acesso antecipado ao Somma Special Day está garantido. Veja abaixo como usá-lo.
              </p>
            </td>
          </tr>

          <!-- O que é o cupom -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.cream};border-radius:20px;overflow:hidden;">
                <tr>
                  <td style="padding:28px;">
                    <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${COLORS.orange};">O que é isso?</p>
                    <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:${COLORS.black};">
                      O código abaixo é o seu <strong>cupom VIP de pré-venda</strong>. Ele garante seu acesso antecipado
                      e o benefício exclusivo de quem entrou na lista. A inscrição do evento acontece
                      <strong>exclusivamente dentro do app da Track&amp;Field (TFSports)</strong> e é lá que você
                      vai usar este cupom para comprar sua vaga antes de todo mundo.
                    </p>

                    <!-- Cupom em destaque -->
                    <div style="margin-top:20px;border:2px dashed ${COLORS.orange};border-radius:14px;padding:18px;text-align:center;">
                      <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#0a0a0a80;">Seu cupom de pré-venda</p>
                      <p style="margin:6px 0 0;font-size:38px;font-weight:bold;letter-spacing:4px;color:${COLORS.orange};line-height:1;">${escapeHtml(codigoUnico)}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Passo a passo -->
          <tr>
            <td style="padding-top:20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.cream};border-radius:20px;overflow:hidden;">
                <tr>
                  <td style="padding:28px;">
                    <p style="margin:0 0 18px;font-size:18px;font-weight:bold;color:${COLORS.black};">
                      Como comprar sua inscrição
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${passosHtml}
                    </table>

                    <!-- Botões das lojas -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                      <tr>
                        <td style="padding:4px;">
                          <a href="${APP_STORE_URL}" style="display:block;background-color:${COLORS.black};color:#ffffff;text-decoration:none;text-align:center;font-size:14px;font-weight:bold;padding:12px;border-radius:10px;">App Store</a>
                        </td>
                        <td style="padding:4px;">
                          <a href="${PLAY_STORE_URL}" style="display:block;background-color:${COLORS.orange};color:#ffffff;text-decoration:none;text-align:center;font-size:14px;font-weight:bold;padding:12px;border-radius:10px;">Google Play</a>
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

          <!-- Aviso -->
          <tr>
            <td style="padding-top:20px;">
              <div style="border:3px solid ${COLORS.yellow};border-radius:14px;background-color:#0a0a0a40;padding:16px 20px;">
                <p style="margin:0;font-size:15px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${COLORS.yellow};">
                  📸 Guarde este e-mail!
                </p>
                <p style="margin:6px 0 0;font-size:13px;color:#ffffffe6;line-height:1.5;">
                  Este é o seu comprovante de vaga VIP. Você vai precisar do cupom <strong>${escapeHtml(codigoUnico)}</strong> na hora de comprar a inscrição no app.
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
