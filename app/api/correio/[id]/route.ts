import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPA_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
})

// Moderação protegida por token (env CORREIO_ADMIN_TOKEN), via header ou ?k=.
function autorizado(request: NextRequest): boolean {
  const token = process.env.CORREIO_ADMIN_TOKEN
  if (!token) return false
  const fromHeader = request.headers.get('x-correio-token')
  const fromQuery = request.nextUrl.searchParams.get('k')
  return fromHeader === token || fromQuery === token
}

// Caminho do objeto no Storage a partir da URL pública.
function storagePath(publicUrl: string | null): string | null {
  if (!publicUrl) return null
  const i = publicUrl.indexOf('/correio/')
  return i === -1 ? null : publicUrl.slice(i + '/correio/'.length)
}

// PATCH: ocultar/reexibir um recado ({ oculto: boolean }).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!autorizado(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const oculto = !!body.oculto

  const { data, error } = await supabase
    .from('correio_elegante')
    .update({ oculto })
    .eq('id', id)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ error: 'Recado não encontrado' }, { status: 404 })
  return NextResponse.json({ success: true, id, oculto })
}

// DELETE: remove o recado e as fotos no Storage.
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!autorizado(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params

  // Busca as fotos pra limpar o Storage.
  const { data: row } = await supabase
    .from('correio_elegante')
    .select('de_foto_url, para_foto_url')
    .eq('id', id)
    .maybeSingle()

  const paths = [storagePath(row?.de_foto_url), storagePath(row?.para_foto_url)].filter(Boolean) as string[]
  if (paths.length) {
    await supabase.storage.from('correio').remove(paths).catch(() => {})
  }

  const { data, error } = await supabase
    .from('correio_elegante')
    .delete()
    .eq('id', id)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) return NextResponse.json({ error: 'Recado não encontrado' }, { status: 404 })
  return NextResponse.json({ success: true, id })
}
