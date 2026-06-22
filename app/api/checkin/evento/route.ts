import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const runtime = 'nodejs'

// Client com fetch no-store: o status do evento muda na gestão e precisa ser sempre fresco.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
  }
)

// Retorna o estado atual do evento (para o widget de check-in saber se está aberto).
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id obrigatório' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('id, titulo, data_evento, horario_inicio, local, tipo, checkin_status, pelotoes')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
    }

    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store, max-age=0' } })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar evento.' }, { status: 500 })
  }
}
