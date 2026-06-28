import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// EVENTO ENCERRADO: bloqueia TODO o caminho /esquenta-junino (e o /esquenta
// legado) e serve a pagina "Evento encerrado", que redireciona pro Somma Club.
// Rewrite mantem a URL original na barra mas mostra o gate.
// Nao afeta /admin, /api nem o resto do site.
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/evento-encerrado'
  url.search = ''
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/esquenta-junino', '/esquenta-junino/:path*', '/esquenta', '/esquenta/:path*'],
}
