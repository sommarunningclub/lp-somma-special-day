import { NextRequest, NextResponse } from 'next/server'
import { submitListaVip } from '@/actions/lista-vip'

// Endpoint TEMPORÁRIO para testar o fluxo de cadastro de ponta a ponta.
// Protegido pela ADMIN_SECRET_KEY. Remover após o teste.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (!process.env.ADMIN_SECRET_KEY || key !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const result = await submitListaVip(body)
  return NextResponse.json(result)
}
