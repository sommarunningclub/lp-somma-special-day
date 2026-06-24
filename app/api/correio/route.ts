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

const limpaArroba = (v: string) => v.replace(/^@+/, '').trim()

// Faz upload de uma foto (dataURL) no bucket público `correio` e devolve a URL pública.
// Retorna null se não houver foto. Lança erro se a foto for inválida/grande demais.
async function uploadFoto(dataUrl: string | null | undefined, pasta: 'de' | 'para'): Promise<string | null> {
  if (!dataUrl || typeof dataUrl !== 'string') return null
  const match = /^data:(image\/(jpeg|png|webp));base64,(.+)$/i.exec(dataUrl)
  if (!match) throw new Error('Formato de imagem inválido.')
  const mime = match[1]
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'
  const buffer = Buffer.from(match[3], 'base64')
  if (buffer.byteLength > 3 * 1024 * 1024) throw new Error('Imagem muito grande (máx 3MB).')

  const path = `${pasta}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('correio').upload(path, buffer, {
    contentType: mime,
    upsert: false,
  })
  if (error) throw new Error(`Falha no upload da imagem: ${error.message}`)

  const { data } = supabase.storage.from('correio').getPublicUrl(path)
  return data.publicUrl
}

// Salva uma mensagem do Correio Elegante (DE → PARA) na tabela `correio_elegante`.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const de = body.de ?? {}
    const para = body.para ?? {}

    const mensagem = String(body.mensagem ?? '').trim()
    const origem = body.origem === 'evento' ? 'evento' : 'site'

    // PARA: nome
    const paraNome = String(para.nome ?? '').trim()
    const paraInstagram = limpaArroba(String(para.instagram ?? ''))

    // DE (opcional/anônimo)
    const deNome = String(de.nome ?? '').trim()
    const deInstagram = limpaArroba(String(de.instagram ?? ''))
    const deContato = String(de.contato ?? '').trim()

    if (!mensagem) {
      return NextResponse.json({ error: 'Escreve a mensagem.' }, { status: 400 })
    }
    // Precisa de um destinatário: nome, @ ou foto.
    if (!paraNome && !paraInstagram && !para.foto) {
      return NextResponse.json({ error: 'Diz pra quem é: nome, @ do Instagram ou foto.' }, { status: 400 })
    }

    let deFotoUrl: string | null = null
    let paraFotoUrl: string | null = null
    try {
      deFotoUrl = await uploadFoto(de.foto, 'de')
      paraFotoUrl = await uploadFoto(para.foto, 'para')
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro ao enviar a imagem.' }, { status: 400 })
    }

    const { error } = await supabase.from('correio_elegante').insert([
      {
        // DE (remetente) — reaproveita as colunas antigas
        nome: deNome || null,
        instagram: deInstagram || null,
        contato: deContato || null,
        de_foto_url: deFotoUrl,
        // PARA (destinatário)
        para_nome: paraNome || null,
        para_instagram: paraInstagram || null,
        para_foto_url: paraFotoUrl,
        // conteúdo
        mensagem,
        origem,
      },
    ])

    if (error) {
      console.error('[correio] erro ao inserir:', error.message)
      if (/relation .*correio_elegante.* does not exist/i.test(error.message)) {
        return NextResponse.json({ error: 'Correio ainda não está ativo. Tente mais tarde.' }, { status: 503 })
      }
      if (/column .* does not exist/i.test(error.message)) {
        return NextResponse.json({ error: 'Correio em atualização. Tente novamente em instantes.' }, { status: 503 })
      }
      return NextResponse.json({ error: 'Não foi possível enviar agora.' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
