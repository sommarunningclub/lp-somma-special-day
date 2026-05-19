'use server'

import { createServerClient } from '@/lib/supabase/server'
import { listaVipSchema } from '@/lib/validations/lista-vip'

type ActionResult =
  | { success: true }
  | { success: false; error: string; fields?: Record<string, string[]> }

export async function submitListaVip(formData: unknown): Promise<ActionResult> {
  const parsed = listaVipSchema.safeParse(formData)

  if (!parsed.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos.',
      fields: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { nome, email, cpf, telefone, sexo } = parsed.data

  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('lista_vip')
      .insert({ nome, email, cpf, telefone, sexo })

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Você já está na lista VIP!' }
      }
      return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
  }
}
