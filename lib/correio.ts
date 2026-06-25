import 'server-only'
import { timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export const FOTO_BUCKET = 'correio'
export const FOTO_MAX_BYTES = 3 * 1024 * 1024 // 3 MB
export const FOTO_SIGNED_TTL = 60 * 60 * 2 // 2 h

export const ADMIN_COOKIE = 'correio_admin'

// Comparação de string em tempo constante (evita timing attack no token).
export function tokensIguais(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

// Moderação autorizada via cookie httpOnly (preferido) ou header x-correio-token.
// Não aceita token em query string (evita vazamento por Referer/histórico/logs).
export function isCorreioAdmin(request: NextRequest): boolean {
  const token = process.env.CORREIO_ADMIN_TOKEN
  if (!token) return false
  const header = request.headers.get('x-correio-token')
  const cookie = request.cookies.get(ADMIN_COOKIE)?.value
  return tokensIguais(header, token) || tokensIguais(cookie, token)
}

export type ContatoRow = { contato: string | null; instagram: string | null }
export type ContatoInfo = { rotulo: string; display: string; href: string | null }

// Resolve o contato do remetente (WhatsApp -> wa.me, @ -> instagram). null = anônimo.
export function resolverContato(row: ContatoRow): ContatoInfo | null {
  const bruto = (row.contato ?? '').trim()
  if (bruto) {
    const digitos = bruto.replace(/\D/g, '')
    // Celular BR: 10-11 dígitos (sem DDI) -> prefixa 55. 12-13 já com DDI.
    if (digitos.length >= 10 && digitos.length <= 13) {
      const comDDI = digitos.length <= 11 ? `55${digitos}` : digitos
      return { rotulo: 'Conversar no WhatsApp', display: bruto, href: `https://wa.me/${comDDI}` }
    }
    const ig = bruto.replace(/^@+/, '')
    if (/^[a-zA-Z0-9._]{1,40}$/.test(ig)) return { rotulo: 'Chamar no Instagram', display: `@${ig}`, href: `https://instagram.com/${ig}` }
    return { rotulo: 'Contato', display: bruto, href: null }
  }
  const ig = (row.instagram ?? '').replace(/^@+/, '')
  if (/^[a-zA-Z0-9._]{1,40}$/.test(ig)) return { rotulo: 'Chamar no Instagram', display: `@${ig}`, href: `https://instagram.com/${ig}` }
  return null
}

// Caminho do objeto no Storage. Aceita tanto o path puro quanto URL legada.
export function toStoragePath(v: string | null | undefined): string | null {
  if (!v) return null
  if (v.startsWith('http')) {
    const i = v.indexOf('/correio/')
    return i === -1 ? null : v.slice(i + '/correio/'.length)
  }
  return v
}

// Confere os "magic bytes" pra garantir que o conteúdo é mesmo a imagem declarada.
function bytesConferem(mime: string, buf: Buffer): boolean {
  if (buf.length < 12) return false
  if (mime === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  if (mime === 'image/png') return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  if (mime === 'image/webp') return buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP'
  return false
}

// Sobe a foto (dataURL) no bucket PRIVADO `correio` e devolve o PATH (não a URL).
// A URL assinada é gerada na leitura. Retorna null se não houver foto.
export async function uploadFoto(
  supabase: SupabaseClient,
  dataUrl: string | null | undefined,
  pasta: 'de' | 'para',
): Promise<string | null> {
  if (!dataUrl || typeof dataUrl !== 'string') return null
  const match = /^data:(image\/(jpeg|png|webp));base64,(.+)$/i.exec(dataUrl)
  if (!match) throw new Error('Formato de imagem inválido.')
  const mime = match[1].toLowerCase()
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'
  const buffer = Buffer.from(match[3], 'base64')
  if (buffer.byteLength > FOTO_MAX_BYTES) throw new Error('Imagem muito grande (máx 3MB).')
  if (!bytesConferem(mime, buffer)) throw new Error('Arquivo de imagem inválido.')

  const path = `${pasta}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(FOTO_BUCKET).upload(path, buffer, { contentType: mime, upsert: false })
  if (error) throw new Error(`Falha no upload da imagem: ${error.message}`)
  return path
}

// Gera URL assinada para um path do bucket (ou null se path vazio).
export async function urlAssinada(supabase: SupabaseClient, path: string | null): Promise<string | null> {
  if (!path) return null
  const { data } = await supabase.storage.from(FOTO_BUCKET).createSignedUrl(path, FOTO_SIGNED_TTL)
  return data?.signedUrl ?? null
}
