import { NextResponse } from 'next/server'
import { renderVipTicketEmail } from '@/lib/emails/vip-ticket'

// Rota apenas para pré-visualizar o e-mail em desenvolvimento. NÃO envia nada (não gasta crédito Resend).
export const dynamic = 'force-dynamic'

export function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 })
  }

  const html = renderVipTicketEmail({
    nome: 'Alex Rodrigues',
    email: 'teste@sommaclub.com.br',
    cupom: 'SOMMAVIP',
  })

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
