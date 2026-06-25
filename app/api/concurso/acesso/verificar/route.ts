import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Rota descontinuada — o acesso agora é direto por CPF em /api/concurso/acesso.
export async function POST() {
  return NextResponse.json(
    { error: 'Acesso agora é por CPF. Use /api/concurso/acesso.', code: 'gone' },
    { status: 410 },
  )
}
