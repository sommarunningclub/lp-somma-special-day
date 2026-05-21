import { destroyAdminSession, isAdmin } from '@/lib/insider'

export async function isAuthenticated(): Promise<boolean> {
  return isAdmin()
}

// Mantidas por compatibilidade com código legado de admin por senha.
export async function createSession(): Promise<void> {
  return
}

// Mantidas por compatibilidade com código legado de admin por senha.
export async function destroySession(): Promise<void> {
  await destroyAdminSession()
}

// Mantida por compatibilidade com código legado de admin por senha.
export function checkPassword(senha: string): boolean {
  return Boolean(process.env.ADMIN_SECRET_KEY && senha === process.env.ADMIN_SECRET_KEY)
}
