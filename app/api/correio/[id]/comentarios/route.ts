import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isCorreioAdmin } from '@/lib/correio'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const SUPA_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const TEXTO_MAX = 280
const NOME_MAX = 60
const IG_MAX = 60
const FP_MAX = 80

const supabase = createClient(SUPA_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
})

const limpaArroba = (v: string) => v.replace(/^@+/, '').trim()

interface ComentarioRow {
  id: string
  autor_nome: string
  autor_instagram: string | null
  texto: string
  oculto: boolean
  created_at: string
}

// GET /api/correio/[id]/comentarios — lista publica (oculta com flag pra admin)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = isCorreioAdmin(request)

  const { data, error } = await supabase
    .from('correio_comentarios')
    .select('id, autor_nome, autor_instagram, texto, oculto, created_at')
    .eq('correio_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[comentarios] erro GET:', error.message)
    return NextResponse.json({ comentarios: [] })
  }

  const rows = (data ?? []) as ComentarioRow[]
  const filtrados = admin ? rows : rows.filter((c) => !c.oculto)
  return NextResponse.json({ comentarios: filtrados })
}

// POST /api/correio/[id]/comentarios { autor_nome, autor_instagram?, texto, fingerprint }
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const autor_nome = String(body.autor_nome ?? '').trim().slice(0, NOME_MAX)
  const autor_instagram = limpaArroba(String(body.autor_instagram ?? '')).slice(0, IG_MAX)
  const texto = String(body.texto ?? '').trim().slice(0, TEXTO_MAX)
  const fingerprint = String(body.fingerprint ?? '').slice(0, FP_MAX)

  if (!autor_nome && !autor_instagram) {
    return NextResponse.json({ error: 'Diz teu nome ou @ pra comentar.' }, { status: 400 })
  }
  if (!texto) {
    return NextResponse.json({ error: 'Escreve o comentario.' }, { status: 400 })
  }
  if (!fingerprint) {
    return NextResponse.json({ error: 'fingerprint obrigatorio.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('correio_comentarios')
    .insert({
      correio_id: id,
      autor_nome: autor_nome || `@${autor_instagram}`,
      autor_instagram: autor_instagram || null,
      texto,
      fingerprint,
    })
    .select('id, autor_nome, autor_instagram, texto, oculto, created_at')
    .single()

  if (error || !data) {
    console.error('[comentarios] insert:', error?.message)
    return NextResponse.json({ error: 'Nao foi possivel comentar agora.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, comentario: data }, { status: 201 })
}
