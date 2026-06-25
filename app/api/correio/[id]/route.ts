import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { FOTO_BUCKET, isCorreioAdmin, toStoragePath, uploadFoto, urlAssinada } from '@/lib/correio'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const SUPA_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPA_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
})

// PATCH aceita:
//   { oculto: boolean }                    — ocultar/reexibir
//   { de_foto?: dataURL | null,            — adicionar/trocar (dataURL) ou remover (null)
//     para_foto?: dataURL | null }
// Quando troca/remove foto, apaga a antiga do bucket.
// Retorna sempre URLs assinadas atualizadas pras duas fotos.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isCorreioAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const update: Record<string, unknown> = {}
  if (typeof body.oculto === 'boolean') update.oculto = body.oculto

  // Snapshot dos paths atuais (pra deletar fotos antigas quando trocar/remover)
  const fotosTocam = 'de_foto' in body || 'para_foto' in body
  let oldDePath: string | null = null
  let oldParaPath: string | null = null
  if (fotosTocam) {
    const { data: row } = await supabase
      .from('correio_elegante')
      .select('de_foto_url, para_foto_url')
      .eq('id', id)
      .maybeSingle()
    oldDePath = toStoragePath(row?.de_foto_url ?? null)
    oldParaPath = toStoragePath(row?.para_foto_url ?? null)
  }

  // Upload das novas fotos (se vieram como dataURL)
  try {
    if ('de_foto' in body) {
      update.de_foto_url = body.de_foto === null ? null : await uploadFoto(supabase, body.de_foto, 'de')
    }
    if ('para_foto' in body) {
      update.para_foto_url = body.para_foto === null ? null : await uploadFoto(supabase, body.para_foto, 'para')
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro ao enviar a imagem.' }, { status: 400 })
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('correio_elegante')
    .update(update)
    .eq('id', id)
    .select('id, oculto, de_foto_url, para_foto_url')
    .maybeSingle()

  if (error) {
    console.error('[correio] erro PATCH:', error.message)
    return NextResponse.json({ error: 'Não foi possível atualizar.' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'Recado não encontrado' }, { status: 404 })

  // Limpa fotos antigas substituídas/removidas
  if (fotosTocam) {
    const newDePath = toStoragePath(data.de_foto_url ?? null)
    const newParaPath = toStoragePath(data.para_foto_url ?? null)
    const remover: string[] = []
    if ('de_foto' in body && oldDePath && oldDePath !== newDePath) remover.push(oldDePath)
    if ('para_foto' in body && oldParaPath && oldParaPath !== newParaPath) remover.push(oldParaPath)
    if (remover.length) await supabase.storage.from(FOTO_BUCKET).remove(remover).catch(() => {})
  }

  // URLs assinadas atualizadas
  const [deUrl, paraUrl] = await Promise.all([
    urlAssinada(supabase, toStoragePath(data.de_foto_url ?? null)),
    urlAssinada(supabase, toStoragePath(data.para_foto_url ?? null)),
  ])

  return NextResponse.json({
    success: true,
    id,
    oculto: data.oculto ?? false,
    de_foto_url: deUrl,
    para_foto_url: paraUrl,
  })
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
