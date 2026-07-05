'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { isAuthenticated } from '@/lib/auth'
import { updateScheduleStep } from '@/lib/evento/store'
import { dispatchStep } from '@/lib/evento/dispatch'
import { sendEventoTest } from '@/lib/evento/send'
import { getEventoStep, REGUAS_META, type EventoBase } from '@/lib/evento/reguas'

type Result<T = void> = { success: true; data: T } | { success: false; error: string }

const baseSchema = z.enum(REGUAS_META.map((m) => m.base) as [string, ...string[]])
const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Data/hora inválida')

async function ensureAdmin(): Promise<Result> {
  if (await isAuthenticated()) return { success: true, data: undefined }
  return { success: false, error: 'Sessão expirada. Faça login novamente.' }
}

function validStep(base: string, step: string): boolean {
  return !!getEventoStep(base, step)
}

export async function updateReguaSchedule(
  base: string,
  step: string,
  dateLocalBrt: string,
  enabled: boolean
): Promise<Result> {
  const auth = await ensureAdmin()
  if (!auth.success) return auth

  const b = baseSchema.safeParse(base)
  if (!b.success || !validStep(base, step)) return { success: false, error: 'Base ou passo inválido.' }
  const d = localDateSchema.safeParse(dateLocalBrt)
  if (!d.success) return { success: false, error: d.error.issues[0]?.message ?? 'Data/hora inválida' }

  const utc = new Date(`${dateLocalBrt}:00-03:00`)
  if (Number.isNaN(utc.getTime())) return { success: false, error: 'Data/hora inválida.' }

  await updateScheduleStep(b.data as EventoBase, step, { sendAt: utc.toISOString(), enabled })
  revalidatePath('/admin/leads')
  return { success: true, data: undefined }
}

export async function sendReguaTest(base: string, step: string, email: string): Promise<Result> {
  const auth = await ensureAdmin()
  if (!auth.success) return auth

  const b = baseSchema.safeParse(base)
  if (!b.success || !validStep(base, step)) return { success: false, error: 'Base ou passo inválido.' }
  const e = z.string().email('E-mail inválido').safeParse(email)
  if (!e.success) return { success: false, error: 'Informe um e-mail válido.' }

  try {
    await sendEventoTest(b.data as EventoBase, step, e.data)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Falha ao enviar teste.' }
  }
}

export async function dispatchReguaNow(base: string, step: string): Promise<Result<{ sent: number; failed: number }>> {
  const auth = await ensureAdmin()
  if (!auth.success) return auth

  const b = baseSchema.safeParse(base)
  if (!b.success || !validStep(base, step)) return { success: false, error: 'Base ou passo inválido.' }

  try {
    const outcome = await dispatchStep(b.data as EventoBase, step)
    revalidatePath('/admin/leads')
    return { success: true, data: { sent: outcome.sent, failed: outcome.failed } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Falha ao disparar.' }
  }
}
