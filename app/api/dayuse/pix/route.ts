import { NextRequest, NextResponse } from 'next/server'
import { ASAAS_API_URL, asaasHeaders } from '@/lib/dayuse/asaas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const paymentId = new URL(request.url).searchParams.get('paymentId')
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID é obrigatório' }, { status: 400 })
    }

    const res = await fetch(`${ASAAS_API_URL}/payments/${paymentId}/pixQrCode`, {
      method: 'GET',
      headers: asaasHeaders(),
    })
    const data = await res.json()

    if (!res.ok) {
      console.error('[DayUse][Asaas] pix error:', data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || 'Erro ao gerar QR Code' },
        { status: res.status },
      )
    }

    return NextResponse.json(data)
  } catch (e) {
    console.error('[DayUse][Asaas] pix exception:', e)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
