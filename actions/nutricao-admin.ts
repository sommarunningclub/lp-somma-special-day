'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Resend } from 'resend'
import { isAuthenticated } from '@/lib/auth'
import { renderNutricaoEmail } from '@/lib/emails/nutricao-template'
import { resolveStep, saveStepOverride, type StepOverride } from '@/lib/nutricao/nutricao-store'
import { NUTRICAO_STEPS, type NutricaoStepKey } from '@/lib/nutricao/nutricao-steps'

type Result<T = void> = { success: true; data: T } | { success: false; error: string }

const STEP_KEYS = NUTRICAO_STEPS.map((s) => s.step) as [string, ...string[]]
const stepSchema = z.enum(STEP_KEYS)

const overrideSchema = z.object({
  subject: z.string().min(2).max(200).optional(),
  kicker: z.string().max(80).optional(),
  headline: z.string().min(2).max(200).optional(),
  selo: z.string().max(80).optional(),
  message: z.string().min(10).max(3000).optional(),
  cta: z.string().min(2).max(80).optional(),
  theme: z.enum(['normal', 'alerta', 'final']).optional(),
  enabled: z.boolean().optional(),
})

async function ensureAdmin(): Promise<Result> {
  if (await isAuthenticated()) return { success: true, data: undefined }
  return { success: false, error: 'Sessão expirada. Faça login novamente.' }
}

/** Atualiza um passo (qualquer subset de campos). */
export async function updateNutricaoStep(step: string, patch: StepOverride): Promise<Result> {
  const auth = await ensureAdmin()
  if (!auth.success) return auth

  const s = stepSchema.safeParse(step)
  if (!s.success) return { success: false, error: 'Passo inválido.' }
  const p = overrideSchema.safeParse(patch)
  if (!p.success) return { success: false, error: p.error.issues[0]?.message ?? 'Dados inválidos' }

  try {
    await saveStepOverride(s.data as NutricaoStepKey, p.data)
    revalidatePath('/admin/leads')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Falha ao salvar.' }
  }
}

/** Envia e-mail de teste de um passo para um endereço. */
export async function sendNutricaoTest(step: string, email: string): Promise<Result> {
  const auth = await ensureAdmin()
  if (!auth.success) return auth

  const s = stepSchema.safeParse(step)
  if (!s.success) return { success: false, error: 'Passo inválido.' }
  const e = z.string().email('E-mail inválido').safeParse(email)
  if (!e.success) return { success: false, error: 'Informe um e-mail válido.' }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.VIP_EMAIL_FROM
  if (!apiKey || !from) return { success: false, error: 'RESEND_API_KEY ou VIP_EMAIL_FROM não configurados.' }

  try {
    const stepConfig = await resolveStep(s.data as NutricaoStepKey)
    if (!stepConfig) return { success: false, error: 'Passo não encontrado.' }
    const { subject, html } = renderNutricaoEmail({
      nome: 'Teste Somma',
      stepConfig,
      unsubscribeUrl: 'https://specialday.sommaclub.com.br/unsubscribe?u=teste',
    })
    const resend = new Resend(apiKey)
    const result = await resend.emails.send({
      from,
      to: e.data,
      subject: `[TESTE] ${subject}`,
      html,
    })
    if (result.error) return { success: false, error: result.error.message }
    return { success: true, data: undefined }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Falha ao enviar teste.' }
  }
}
