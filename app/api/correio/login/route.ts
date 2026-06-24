import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, tokensIguais } from '@/lib/correio'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/correio/login?k=TOKEN — valida o token uma vez e grava cookie httpOnly.
// Depois disso a moderação funciona pelo cookie (o token não fica no HTML/cliente).
export async function GET(request: NextRequest) {
  const k = request.nextUrl.searchParams.get('k')
  const token = process.env.CORREIO_ADMIN_TOKEN
  const destino = new URL('/esquenta-junino/correio', request.nextUrl.origin)
  const res = NextResponse.redirect(destino)

  if (token && tokensIguais(k, token)) {
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12h
    })
  }
  return res
}
