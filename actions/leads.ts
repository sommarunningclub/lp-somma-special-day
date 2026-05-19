'use server'

import { createServerClient } from '@/lib/supabase/server'
import { leadSchema } from '@/lib/validations/lead'

type ActionResult =
  | { success: true }
  | { success: false; error: string; fields?: Record<string, string[]> }

export async function submitLead(formData: unknown): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(formData)

  if (!parsed.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos.',
      fields: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { nome, email, cpf, telefone } = parsed.data

  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('vip_leads')
      .insert({ nome, email, cpf, telefone })

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Voce ja esta na lista VIP!' }
      }
      return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
  }
}
