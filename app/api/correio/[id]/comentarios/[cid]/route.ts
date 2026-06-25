import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isCorreioAdmin } from '@/lib/correio'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const SUPA_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPA_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
})

// PATCH: ocultar/reexibir um comentario (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cid: string }> },
) {
  if (!isCorreioAdmin(request)) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  const { id, cid } = await params
  const body = await request.json().catch(() => ({}))
  const oculto = !!body.oculto

  const { data, error } = await supabase
    .from('correio_comentarios')
    .update({ oculto })
    .eq('id', cid)
    .eq('correio_id', id)
    .select('id')

  if (error) return NextResponse.json({ error: 'Nao foi possivel atualizar.' }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ error: 'Nao encontrado' }, { status: 404 })
  return NextResponse.json({ success: true, id: cid, oculto })
}

// DELETE: remove comentario (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cid: string }> },
) {
  if (!isCorreioAdmin(request)) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  const { id, cid } = await params

  const { data, error } = await supabase
    .from('correio_comentarios')
    .delete()
    .eq('id', cid)
    .eq('correio_id', id)
    .select('id')

  if (error) return NextResponse.json({ error: 'Nao foi possivel excluir.' }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ error: 'Nao encontrado' }, { status: 404 })
  return NextResponse.json({ success: true, id: cid })
}
