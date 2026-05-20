import { cookies } from 'next/headers'

const COOKIE_NAME = 'somma_admin_session'

// Valor gravado no cookie quando autenticado. Derivado da chave secreta para
// não guardar a chave em texto puro no navegador.
function sessionToken(): string {
  const key = process.env.ADMIN_SECRET_KEY ?? ''
  // token simples e estável; o segredo nunca vai para o cliente
  return Buffer.from(`somma:${key}`).toString('base64url')
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value === sessionToken()
}

export async function createSession(): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export function checkPassword(senha: string): boolean {
  return senha === process.env.ADMIN_SECRET_KEY
}

export { COOKIE_NAME }
