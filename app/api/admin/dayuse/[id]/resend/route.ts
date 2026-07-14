import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/insider'
import { ASAAS_API_URL, asaasHeaders } from '@/lib/dayuse/asaas'
import { sendDayUseConfirmation } from '@/lib/emails/send-dayuse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data: order, error } = await supabase
    .from('dayuse_orders')
    .select('nome, email, valor, forma_pagamento, status_pagamento, asaas_payment_id')
    .eq('id', params.id)
    .maybeSingle()

  if (error || !order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  if (order.status_pagamento !== 'Pago')
    return NextResponse.json(
      { error: 'Só é possível reenviar o comprovante de pedidos Pagos.' },
      { status: 409 },
    )

  // Busca o comprovante no Asaas (não persistido no nosso banco).
  let receiptUrl: string | null = null
  let dataPagamento: string | null = null
  if (order.asaas_payment_id) {
    try {
      const res = await fetch(`${ASAAS_API_URL}/payments/${order.asaas_payment_id}`, {
        method: 'GET',
        headers: asaasHeaders(),
        cache: 'no-store',
      })
      const pay = await res.json()
      if (res.ok) {
        receiptUrl = pay.transactionReceiptUrl || pay.invoiceUrl || null
        dataPagamento = pay.paymentDate || pay.clientPaymentDate || pay.confirmedDate || null
      }
    } catch (e) {
      console.error('[admin-dayuse] asaas fetch error:', e)
    }
  }

  const emailId = await sendDayUseConfirmation({
    nome: order.nome,
    email: order.email,
    valor: Number(order.valor),
    forma: order.forma_pagamento,
    dataPagamento,
    transactionId: order.asaas_payment_id || params.id,
    receiptUrl,
  })

  if (!emailId)
    return NextResponse.json({ error: 'Falha ao enviar o e-mail. Tente novamente.' }, { status: 502 })

  return NextResponse.json({ ok: true, emailId })
}
