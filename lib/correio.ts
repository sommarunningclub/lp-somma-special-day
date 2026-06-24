import 'server-only'
import { timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

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
