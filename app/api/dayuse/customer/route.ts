import { NextRequest, NextResponse } from 'next/server'
import { ASAAS_API_URL, asaasHeaders } from '@/lib/dayuse/asaas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { name, email, cpfCnpj, phone } = await request.json()
    if (!name || !email || !cpfCnpj) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    const res = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: asaasHeaders(),
      body: JSON.stringify({
        name,
        email,
        cpfCnpj: String(cpfCnpj).replace(/\D/g, ''),
        phone: phone ? String(phone).replace(/\D/g, '') : undefined,
        // Desativa todas as notificações do Asaas (e-mail/SMS de cobrança, recibo,
        // etc.) — o único e-mail enviado é o nosso comprovante (Resend).
        notificationDisabled: true,
      }),
      cache: 'no-store',
    })
    const data = await res.json()

    if (!res.ok) {
      console.error('[DayUse][Asaas] customer error:', data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || 'Erro ao criar cliente' },
        { status: res.status },
      )
    }

    return NextResponse.json({ id: data.id })
  } catch (e) {
    console.error('[DayUse][Asaas] customer exception:', e)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
