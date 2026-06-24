import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolverContato } from '@/lib/correio'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const SUPA_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPA_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
})

// GET: revela o contato do remetente de UM recado, sob demanda (no clique de
// "Revelar contato"). Mantém o telefone fora do payload público do mural — assim
// não dá pra raspar todos os contatos vendo o fonte; exige interação por card.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase
    .from('correio_elegante')
    .select('contato, instagram, oculto')
    .eq('id', id)
    .maybeSingle()

  if (error || !data || data.oculto) {
    return NextResponse.json({ contato: null }, { status: error ? 500 : 404 })
  }
  return NextResponse.json({ contato: resolverContato(data) })
}
