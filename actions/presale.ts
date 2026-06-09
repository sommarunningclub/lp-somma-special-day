'use server'

import { isAuthenticated } from '@/lib/auth'
import { setPresaleLimit } from '@/lib/presale'

type Result = { success: true } | { success: false; error: string }

export async function updatePresaleLimit(limit: number): Promise<Result> {
  if (!(await isAuthenticated())) {
    return { success: false, error: 'Não autorizado.' }
  }

  if (!Number.isFinite(limit) || limit < 0 || limit > 100000) {
    return { success: false, error: 'Informe um número válido de vagas.' }
  }

  const ok = await setPresaleLimit(Math.floor(limit))
  return ok ? { success: true } : { success: false, error: 'Não foi possível salvar. Tente novamente.' }
}
