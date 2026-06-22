import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const KEY = 'concurso_votos'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
  }
)

async function getVotos(): Promise<number> {
  const { data } = await supabase.from('app_settings').select('value').eq('key', KEY).maybeSingle()
  const n = Number.parseInt((data?.value as string) ?? '0', 10)
  return Number.isFinite(n) ? n : 0
}

export async function GET() {
  try {
    return NextResponse.json({ votos: await getVotos() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ votos: 0 })
  }
}

export async function POST() {
  try {
    const atual = await getVotos()
    const novo = atual + 1
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: KEY, value: String(novo), updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) {
      console.error('[concurso-votos] erro:', error.message)
      return NextResponse.json({ votos: atual, error: 'Não foi possível registrar.' }, { status: 500 })
    }
    return NextResponse.json({ votos: novo }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
