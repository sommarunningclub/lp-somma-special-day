'use server'

import { revalidatePath } from 'next/cache'
import { isAuthenticated } from '@/lib/auth'
import { setPresaleLimit, setPresaleOpen } from '@/lib/presale'

type Result = { success: true } | { success: false; error: string }

export async function updatePresaleLimit(limit: number): Promise<Result> {
  if (!(await isAuthenticated())) {
    return { success: false, error: 'Não autorizado.' }
  }

  if (!Number.isFinite(limit) || limit < 0 || limit > 100000) {
    return { success: false, error: 'Informe um número válido de vagas.' }
  }

  const ok = await setPresaleLimit(Math.floor(limit))
  if (ok) revalidatePath('/listavip')
  return ok ? { success: true } : { success: false, error: 'Não foi possível salvar. Tente novamente.' }
}

/** Abre ou fecha o formulário público da lista VIP (interruptor manual). */
export async function updatePresaleOpen(open: boolean): Promise<Result> {
  if (!(await isAuthenticated())) {
    return { success: false, error: 'Não autorizado.' }
  }

  const ok = await setPresaleOpen(open)
  if (ok) {
    revalidatePath('/listavip')
    revalidatePath('/admin/leads')
  }
  return ok ? { success: true } : { success: false, error: 'Não foi possível salvar. Tente novamente.' }
}
