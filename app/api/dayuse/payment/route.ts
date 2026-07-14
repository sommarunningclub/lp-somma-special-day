import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ASAAS_API_URL, asaasHeaders, asaasError, DAYUSE_PRICE } from '@/lib/dayuse/asaas'
import { sendDayUseConfirmation } from '@/lib/emails/send-dayuse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || '0.0.0.0'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, method, customer, card } = body as {
      customerId?: string
      method?: 'card' | 'pix'
      customer?: {
        name: string; email: string; cpfCnpj: string; phone?: string
        postalCode?: string; addressNumber?: string
      }
      card?: { holderName: string; number: string; expiryMonth: string; expiryYear: string; ccv: string }
    }

    if (!customerId || !method || !customer) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    const forma = method === 'pix' ? 'PIX' : 'Cartão de Crédito'
    const today = new Date().toISOString().split('T')[0]

    // Grava o pedido como Pendente antes de cobrar (rastreabilidade mesmo se a cobrança falhar).
    const { data: order, error: orderError } = await supabase
      .from('dayuse_orders')
      .insert({
        nome: customer.name,
        email: customer.email,
        cpf: String(customer.cpfCnpj).replace(/\D/g, ''),
        telefone: String(customer.phone || '').replace(/\D/g, ''),
        valor: DAYUSE_PRICE,
        forma_pagamento: forma,
        asaas_customer_id: customerId,
        status_pagamento: 'Pendente',
      })
      .select('id')
      .single()

    if (orderError || !order?.id) {
      console.error('[DayUse][Asaas] order insert error:', orderError)
      return NextResponse.json(
        { error: 'Não foi possível registrar seu pedido. Tente novamente.' },
        { status: 500 },
      )
    }

    const orderId = order?.id as string | undefined

    let payload: Record<string, unknown>
    if (method === 'pix') {
      payload = {
        customer: customerId,
        billingType: 'PIX',
        value: DAYUSE_PRICE,
        dueDate: today,
        description: 'Special Day - Ingresso Day Use',
      }
    } else {
      if (!card) {
        return NextResponse.json({ error: 'Dados do cartão faltando' }, { status: 400 })
      }
      payload = {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: DAYUSE_PRICE,
        dueDate: today,
        description: 'Special Day - Ingresso Day Use',
        creditCard: {
          holderName: card.holderName,
          number: String(card.number).replace(/\s/g, ''),
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          ccv: card.ccv,
        },
        creditCardHolderInfo: {
          name: customer.name,
          email: customer.email,
          cpfCnpj: String(customer.cpfCnpj).replace(/\D/g, ''),
          postalCode: String(customer.postalCode || '').replace(/\D/g, ''),
          addressNumber: customer.addressNumber,
          phone: String(customer.phone || '').replace(/\D/g, ''),
        },
        remoteIp: clientIp(request),
      }
    }

    const res = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: asaasHeaders(),
      body: JSON.stringify(payload),
      cache: 'no-store',
    })
    const data = await res.json()

    if (!res.ok) {
      console.error('[DayUse][Asaas] payment error:', data)
      if (orderId) {
        await supabase
          .from('dayuse_orders')
          .update({
            status_pagamento: 'Cancelado',
            ...(data?.id ? { asaas_payment_id: data.id } : {}),
          })
          .eq('id', orderId)
      }
      return NextResponse.json({ error: asaasError(data) }, { status: res.status })
    }

    const paid = data.status === 'CONFIRMED' || data.status === 'RECEIVED'
    if (orderId) {
      await supabase
        .from('dayuse_orders')
        .update({ asaas_payment_id: data.id, status_pagamento: paid ? 'Pago' : 'Pendente' })
        .eq('id', orderId)
    }

    // Cartão aprovado na hora: confirma por e-mail já (PIX é confirmado no polling).
    if (paid) {
      await sendDayUseConfirmation({
        nome: customer.name,
        email: customer.email,
        valor: DAYUSE_PRICE,
        forma,
        dataPagamento: data.paymentDate || data.confirmedDate || today,
        transactionId: data.id,
        receiptUrl: data.transactionReceiptUrl || data.invoiceUrl,
      })
    }

    return NextResponse.json({ paymentId: data.id, status: data.status, paid })
  } catch (e) {
    console.error('[DayUse][Asaas] payment exception:', e)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
