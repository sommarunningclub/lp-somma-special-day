import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const SUPA_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const FP_MAX = 80
// Aceita qualquer emoji: limita tamanho e exige pelo menos um pictograph.
// Suporta sequencias ZWJ (familia, profissoes), bandeiras, skin tones, etc.
const EMOJI_MAX_CODEPOINTS = 16
const EMOJI_RE = /\p{Extended_Pictographic}/u

function ehEmojiValido(s: string): boolean {
  if (!s) return false
  if (s.length > 64) return false
  const codepoints = Array.from(s)
  if (codepoints.length === 0 || codepoints.length > EMOJI_MAX_CODEPOINTS) return false
  if (!EMOJI_RE.test(s)) return false
  // Rejeita se tiver letra/digito ASCII (evita textos como "lol")
  if (/[a-zA-Z0-9]/.test(s)) return false
  return true
}

const supabase = createClient(SUPA_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
})

interface ReacaoRow {
  emoji: string
  fingerprint: string
}

async function agregar(correioId: string, fingerprint: string) {
  const { data, error } = await supabase
    .from('correio_reacoes')
    .select('emoji, fingerprint')
    .eq('correio_id', correioId)

  if (error) return { counts: {} as Record<string, number>, minhas: [] as string[] }

  const linhas = (data ?? []) as ReacaoRow[]
  const counts: Record<string, number> = {}
  const minhas: string[] = []
  for (const r of linhas) {
    counts[r.emoji] = (counts[r.emoji] ?? 0) + 1
    if (fingerprint && r.fingerprint === fingerprint) minhas.push(r.emoji)
  }
  return { counts, minhas }
}

// GET /api/correio/[id]/reacoes?fp=...
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const fp = (request.nextUrl.searchParams.get('fp') ?? '').slice(0, FP_MAX)
  const agg = await agregar(id, fp)
  return NextResponse.json(agg)
}

// POST /api/correio/[id]/reacoes  { emoji, fingerprint } — toggle
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const emoji = String(body.emoji ?? '')
  const fingerprint = String(body.fingerprint ?? '').slice(0, FP_MAX)

  if (!ehEmojiValido(emoji)) {
    return NextResponse.json({ error: 'So emoji.' }, { status: 400 })
  }
  if (!fingerprint) {
    return NextResponse.json({ error: 'fingerprint obrigatorio.' }, { status: 400 })
  }

  // Tenta deletar primeiro (toggle off). Se nada foi deletado, insere.
  const { data: removed } = await supabase
    .from('correio_reacoes')
    .delete()
    .match({ correio_id: id, emoji, fingerprint })
    .select('id')

  if (!removed || removed.length === 0) {
    const { error } = await supabase
      .from('correio_reacoes')
      .insert({ correio_id: id, emoji, fingerprint })
    if (error) {
      console.error('[reacoes] insert:', error.message)
      return NextResponse.json({ error: 'Nao foi possivel reagir agora.' }, { status: 500 })
    }
  }

  const agg = await agregar(id, fingerprint)
  return NextResponse.json({ success: true, ...agg })
}
