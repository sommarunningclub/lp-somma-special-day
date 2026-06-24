import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isCorreioAdmin, toStoragePath } from '@/lib/correio'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const SUPA_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPA_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
})

// PATCH: ocultar/reexibir um recado ({ oculto: boolean }).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isCorreioAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const oculto = !!body.oculto

  const { data, error } = await supabase.from('correio_elegante').update({ oculto }).eq('id', id).select('id')

  if (error) {
    console.error('[correio] erro PATCH:', error.message)
    return NextResponse.json({ error: 'Não foi possível atualizar.' }, { status: 500 })
  }
  if (!data || data.length === 0) return NextResponse.json({ error: 'Recado não encontrado' }, { status: 404 })
  return NextResponse.json({ success: true, id, oculto })
}

// DELETE: remove o recado e as fotos no Storage.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isCorreioAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params

  const { data: row } = await supabase
    .from('correio_elegante')
    .select('de_foto_url, para_foto_url')
    .eq('id', id)
    .maybeSingle()

  const paths = [toStoragePath(row?.de_foto_url), toStoragePath(row?.para_foto_url)].filter(Boolean) as string[]
  if (paths.length) {
    await supabase.storage.from('correio').remove(paths).catch(() => {})
  }

  const { data, error } = await supabase.from('correio_elegante').delete().eq('id', id).select('id')

  if (error) {
    console.error('[correio] erro DELETE:', error.message)
    return NextResponse.json({ error: 'Não foi possível excluir.' }, { status: 500 })
  }
  if (!data || data.length === 0) return NextResponse.json({ error: 'Recado não encontrado' }, { status: 404 })
  return NextResponse.json({ success: true, id })
}
