import { NextRequest, NextResponse } from 'next/server'
import { addUnsubscribed } from '@/lib/campaign/campaign-store'
import { addUnsubscribed as addEventoUnsub } from '@/lib/evento/store'
import { REGUAS_META, type EventoBase } from '@/lib/evento/reguas'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const EVENTO_BASES = new Set<string>(REGUAS_META.map((m) => m.base))

async function unsubscribe(u: string | null, b: string | null): Promise<boolean> {
  if (!u || u === 'teste') return false
  try {
    // Réguas do evento: b = "evt:<base>", u = e-mail.
    if (b && b.startsWith('evt:')) {
      const base = b.slice(4)
      if (EVENTO_BASES.has(base)) {
        await addEventoUnsub(base as EventoBase, u)
        return true
      }
      return false
    }
    // Campanha VIP (padrão): u = lead_id.
    await addUnsubscribed(u)
    return true
  } catch (e) {
    console.error('[unsubscribe] erro:', e)
    return false
  }
}

// One-click (List-Unsubscribe-Post): clientes de e-mail fazem POST.
export async function POST(req: NextRequest) {
  await unsubscribe(req.nextUrl.searchParams.get('u'), req.nextUrl.searchParams.get('b'))
  return NextResponse.json({ ok: true })
}

// Navegador: mostra confirmação.
export async function GET(req: NextRequest) {
  const ok = await unsubscribe(req.nextUrl.searchParams.get('u'), req.nextUrl.searchParams.get('b'))
  const titulo = ok ? 'Tudo certo!' : 'Não foi possível concluir'
  const msg = ok
    ? 'Você não vai mais receber os e-mails da pré-venda do Somma Special Day. Se mudar de ideia, é só se cadastrar de novo na lista VIP.'
    : 'Não conseguimos processar o descadastro. Tente novamente pelo link do e-mail ou fale com a gente.'

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Descadastro — Somma Special Day</title></head>
<body style="margin:0;background:#005EFF;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#FDF6EC;border-radius:20px;">
        <tr><td style="padding:36px 28px;text-align:center;">
          <h1 style="margin:0;color:#FF4800;font-size:24px;text-transform:uppercase;letter-spacing:1px;">${titulo}</h1>
          <p style="margin:16px 0 0;color:#0a0a0a;font-size:15px;line-height:1.6;">${msg}</p>
        </td></tr>
      </table>
      <p style="margin:18px 0 0;color:#ffffff99;font-size:12px;">Somma Running Club · Brasília · DF</p>
    </td></tr>
  </table>
</body></html>`

  return new NextResponse(html, {
    status: ok ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
