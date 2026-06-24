import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const SUPA_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const MENSAGEM_MAX = 500
const NOME_MAX = 80

const supabase = createClient(SUPA_URL, SERVICE_KEY, {
  auth: { persistSession: false },
  global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
})

const limpaArroba = (v: string) => v.replace(/^@+/, '').trim()

// Confere os "magic bytes" pra garantir que o conteúdo é mesmo a imagem declarada.
function bytesConferem(mime: string, buf: Buffer): boolean {
  if (buf.length < 12) return false
  if (mime === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  if (mime === 'image/png') return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  if (mime === 'image/webp') return buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP'
  return false
}

// Sobe a foto (dataURL) no bucket PRIVADO `correio` e devolve o PATH (não a URL).
// A URL assinada é gerada na leitura (mural). Retorna null se não houver foto.
async function uploadFoto(dataUrl: string | null | undefined, pasta: 'de' | 'para'): Promise<string | null> {
  if (!dataUrl || typeof dataUrl !== 'string') return null
  const match = /^data:(image\/(jpeg|png|webp));base64,(.+)$/i.exec(dataUrl)
  if (!match) throw new Error('Formato de imagem inválido.')
  const mime = match[1].toLowerCase()
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'
  const buffer = Buffer.from(match[3], 'base64')
  if (buffer.byteLength > 3 * 1024 * 1024) throw new Error('Imagem muito grande (máx 3MB).')
  if (!bytesConferem(mime, buffer)) throw new Error('Arquivo de imagem inválido.')

  const path = `${pasta}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('correio').upload(path, buffer, { contentType: mime, upsert: false })
  if (error) throw new Error(`Falha no upload da imagem: ${error.message}`)
  return path
}

// Salva uma mensagem do Correio Elegante (DE → PARA) na tabela `correio_elegante`.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const de = body.de ?? {}
    const para = body.para ?? {}

    const mensagem = String(body.mensagem ?? '').trim().slice(0, MENSAGEM_MAX)
    const origem = body.origem === 'evento' ? 'evento' : 'site'

    const paraNome = String(para.nome ?? '').trim().slice(0, NOME_MAX)
    const paraInstagram = limpaArroba(String(para.instagram ?? '')).slice(0, NOME_MAX)

    const deNome = String(de.nome ?? '').trim().slice(0, NOME_MAX)
    const deInstagram = limpaArroba(String(de.instagram ?? '')).slice(0, NOME_MAX)
    const deContato = String(de.contato ?? '').trim().slice(0, NOME_MAX)

    if (!mensagem) {
      return NextResponse.json({ error: 'Escreve a mensagem.' }, { status: 400 })
    }
    // Precisa de um destinatário: nome, @ ou foto (dataURL válido).
    const temFotoPara = typeof para.foto === 'string' && para.foto.startsWith('data:image/')
    if (!paraNome && !paraInstagram && !temFotoPara) {
      return NextResponse.json({ error: 'Diz pra quem é: nome, @ do Instagram ou foto.' }, { status: 400 })
    }

    let deFotoPath: string | null = null
    let paraFotoPath: string | null = null
    try {
      deFotoPath = await uploadFoto(de.foto, 'de')
      paraFotoPath = await uploadFoto(para.foto, 'para')
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro ao enviar a imagem.' }, { status: 400 })
    }

    const { error } = await supabase.from('correio_elegante').insert([
      {
        nome: deNome || null,
        instagram: deInstagram || null,
        contato: deContato || null,
        de_foto_url: deFotoPath,
        para_nome: paraNome || null,
        para_instagram: paraInstagram || null,
        para_foto_url: paraFotoPath,
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
