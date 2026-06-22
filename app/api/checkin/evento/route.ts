import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Retorna o estado atual do evento (para o widget de check-in saber se está aberto).
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })
  }

  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('eventos')
      .select('id, titulo, data_evento, horario_inicio, local, tipo, checkin_status, pelotoes')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
    }

    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar evento.' }, { status: 500 })
  }
}
