import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ASAAS_API_URL, asaasHeaders } from '@/lib/dayuse/asaas'
import { sendDayUseConfirmation } from '@/lib/emails/send-dayuse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

export async function GET(request: NextRequest) {
  try {
    const paymentId = new URL(request.url).searchParams.get('paymentId')
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID é obrigatório' }, { status: 400 })
    }

    // no-store: o Next.js cacheia fetch() por padrão. Sem isso o polling
    // devolveria o snapshot PENDING cacheado no 1º poll e nunca veria RECEIVED.
    const res = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: asaasHeaders(),
      cache: 'no-store',
    })
    const data = await res.json()

    if (!res.ok) {
      console.error('[DayUse][Asaas] status error:', data)
      return NextResponse.json(
        { error: data.errors?.[0]?.description || 'Erro ao buscar status' },
        { status: res.status },
      )
    }

    const paid = data.status === 'RECEIVED' || data.status === 'CONFIRMED'
    if (paid) {
      // Update condicional (neq 'Pago'): só a chamada que de fato transiciona
      // Pendente→Pago recebe a linha de volta — garante e-mail exatamente 1x
      // por pedido, mesmo com vários polls simultâneos.
      const { data: transitioned } = await supabase
        .from('dayuse_orders')
        .update({ status_pagamento: 'Pago' })
        .eq('asaas_payment_id', paymentId)
        .neq('status_pagamento', 'Pago')
        .select('nome, email, valor, forma_pagamento')

      const row = transitioned?.[0]
      if (row) {
        await sendDayUseConfirmation({
          nome: row.nome,
          email: row.email,
          valor: Number(row.valor),
          forma: row.forma_pagamento,
          dataPagamento: data.paymentDate || data.clientPaymentDate || data.confirmedDate,
          transactionId: data.id,
          receiptUrl: data.transactionReceiptUrl || data.invoiceUrl,
        })
      }
    }

    return NextResponse.json({ id: data.id, status: data.status, paid })
  } catch (e) {
    console.error('[DayUse][Asaas] status exception:', e)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
