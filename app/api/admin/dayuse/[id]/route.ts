import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/insider'
import { ASAAS_API_URL, asaasHeaders } from '@/lib/dayuse/asaas'
import { DAYUSE_STATUS, DAYUSE_FORMAS } from '@/lib/dayuse/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const id = params.id
  const body = await request.json().catch(() => ({}) as Record<string, unknown>)
  const update: Record<string, unknown> = {}

  if (typeof body.nome === 'string' && body.nome.trim()) update.nome = body.nome.trim()
  if (typeof body.email === 'string' && body.email.trim()) update.email = body.email.trim()
  if (typeof body.cpf === 'string') update.cpf = String(body.cpf).replace(/\D/g, '')
  if (typeof body.telefone === 'string') update.telefone = String(body.telefone).replace(/\D/g, '')

  if (typeof body.forma_pagamento === 'string') {
    if (!DAYUSE_FORMAS.includes(body.forma_pagamento as never))
      return NextResponse.json({ error: 'Forma de pagamento inválida' }, { status: 400 })
    update.forma_pagamento = body.forma_pagamento
  }

  if (body.valor !== undefined) {
    const valor = Number(body.valor)
    if (!Number.isFinite(valor) || valor < 0)
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    update.valor = valor
  }

  if (typeof body.status_pagamento === 'string') {
    if (!DAYUSE_STATUS.includes(body.status_pagamento as never))
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    update.status_pagamento = body.status_pagamento
  }

  // Toggle da pulseira só é permitido para pedidos Pagos.
  if (typeof body.pulseira_entregue === 'boolean') {
    if (body.pulseira_entregue) {
      const targetStatus =
        typeof update.status_pagamento === 'string' ? (update.status_pagamento as string) : null
      const { data: cur } = await supabase
        .from('dayuse_orders')
        .select('status_pagamento')
        .eq('id', id)
        .maybeSingle()
      const status = targetStatus ?? cur?.status_pagamento
      if (status !== 'Pago')
        return NextResponse.json(
          { error: 'Só é possível validar a pulseira de pedidos Pagos.' },
          { status: 409 },
        )
      update.pulseira_entregue = true
      update.pulseira_entregue_em = new Date().toISOString()
    } else {
      update.pulseira_entregue = false
      update.pulseira_entregue_em = null
    }
  }

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 })

  const { data, error } = await supabase
    .from('dayuse_orders')
    .update(update)
    .eq('id', id)
    .select('*')
  if (error) {
    console.error('[admin-dayuse] update error:', error)
    return NextResponse.json({ error: 'Falha ao atualizar o pedido' }, { status: 500 })
  }
  if (!data?.length) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

  return NextResponse.json({ ok: true, order: data[0] })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const id = params.id

  const { data: order } = await supabase
    .from('dayuse_orders')
    .select('asaas_payment_id, asaas_customer_id')
    .eq('id', id)
    .maybeSingle()

  if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

  // Remove a cobrança e o cliente no Asaas (best-effort — não bloqueia a exclusão
  // local se o recurso já não existir ou a API falhar).
  const asaasDelete = async (path: string) => {
    try {
      await fetch(`${ASAAS_API_URL}${path}`, {
        method: 'DELETE',
        headers: asaasHeaders(),
        cache: 'no-store',
      })
    } catch (e) {
      console.error('[admin-dayuse] asaas delete error:', path, e)
    }
  }
  if (order.asaas_payment_id) await asaasDelete(`/payments/${order.asaas_payment_id}`)
  if (order.asaas_customer_id) await asaasDelete(`/customers/${order.asaas_customer_id}`)

  const { data, error } = await supabase
    .from('dayuse_orders')
    .delete()
    .eq('id', id)
    .select('id')
  if (error) {
    console.error('[admin-dayuse] delete error:', error)
    return NextResponse.json({ error: 'Falha ao excluir o pedido' }, { status: 500 })
  }
  if (!data?.length) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
