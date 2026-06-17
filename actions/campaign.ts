'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { isAuthenticated } from '@/lib/auth'
import { updateScheduleStep } from '@/lib/campaign/campaign-store'
import { dispatchStep } from '@/lib/campaign/dispatch'
import { sendCountdownTest } from '@/lib/emails/send-countdown'
import { COUNTDOWN_STEPS } from '@/lib/campaign/vip-countdown-steps'

type Result<T = void> = { success: true; data: T } | { success: false; error: string }

const STEP_KEYS = COUNTDOWN_STEPS.map((s) => s.step) as [string, ...string[]]
const stepSchema = z.enum(STEP_KEYS)
// datetime-local: YYYY-MM-DDTHH:mm (horário de Brasília)
const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Data/hora inválida')

async function ensureAdmin(): Promise<Result> {
  if (await isAuthenticated()) return { success: true, data: undefined }
  return { success: false, error: 'Sessão expirada. Faça login novamente.' }
}

/** Edita data/hora (BRT) e ativação de um passo. */
export async function updateCampaignSchedule(
  step: string,
  dateLocalBrt: string,
  enabled: boolean
): Promise<Result> {
  const auth = await ensureAdmin()
  if (!auth.success) return auth

  const s = stepSchema.safeParse(step)
  if (!s.success) return { success: false, error: 'Passo inválido.' }
  const d = localDateSchema.safeParse(dateLocalBrt)
  if (!d.success) return { success: false, error: d.error.issues[0]?.message ?? 'Data/hora inválida' }

  // BRT (UTC-3, sem horário de verão em 2026) -> UTC
  const utc = new Date(`${dateLocalBrt}:00-03:00`)
  if (Number.isNaN(utc.getTime())) return { success: false, error: 'Data/hora inválida.' }

  await updateScheduleStep(s.data as never, { sendAt: utc.toISOString(), enabled })
  revalidatePath('/admin/leads')
  return { success: true, data: undefined }
}

/** Envia um e-mail de teste de um passo para um endereço. */
export async function sendCampaignTest(step: string, email: string): Promise<Result> {
  const auth = await ensureAdmin()
  if (!auth.success) return auth

  const s = stepSchema.safeParse(step)
  if (!s.success) return { success: false, error: 'Passo inválido.' }
  const e = z.string().email('E-mail inválido').safeParse(email)
  if (!e.success) return { success: false, error: 'Informe um e-mail válido.' }

  try {
    await sendCountdownTest(s.data as never, e.data)
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Falha ao enviar teste.' }
  }
}

/** Dispara um passo agora (manual), respeitando dedup. */
export async function dispatchCampaignNow(step: string): Promise<Result<{ sent: number; failed: number }>> {
  const auth = await ensureAdmin()
  if (!auth.success) return auth

  const s = stepSchema.safeParse(step)
  if (!s.success) return { success: false, error: 'Passo inválido.' }

  try {
    const outcome = await dispatchStep(s.data as never)
    revalidatePath('/admin/leads')
    return { success: true, data: { sent: outcome.sent, failed: outcome.failed } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Falha ao disparar.' }
  }
}
