'use server'

import { createServerClient } from '@/lib/supabase/server'
import { cortesiaSchema, CORTESIA_LIMITE, type CortesiaInput } from '@/lib/validations/cortesia'

type ActionResult =
  | { success: true }
  | { success: false; error: string; fields?: Record<string, string[]> }

function normalize({ nome, email, telefone, dataNascimento, genero, cpf }: CortesiaInput) {
  return {
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: telefone.trim(),
    data_nascimento: dataNascimento.trim(),
    genero,
    cpf: cpf.trim(),
  }
}

export async function submitCortesia(formData: unknown): Promise<ActionResult> {
  const parsed = cortesiaSchema.safeParse(formData)

  if (!parsed.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos.',
      fields: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const supabase = createServerClient()

    // Limite de cortesias: bloqueia quando atingir o teto. Checagem server-side
    // para nao depender do estado da pagina (evita burlar via requisicao direta).
    const { count, error: countError } = await supabase
      .from('cortesia')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
    }
    if ((count ?? 0) >= CORTESIA_LIMITE) {
      return { success: false, error: 'As cortesias esgotaram. Não há mais vagas disponíveis.' }
    }

    const lead = normalize(parsed.data)

    const { error } = await supabase.from('cortesia').insert(lead)

    if (error) {
      // CPF duplicado (unique constraint) — pessoa ja garantiu a cortesia.
      if (error.code === '23505') {
        return { success: false, error: 'Este CPF já está cadastrado para a cortesia.' }
      }
      return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
  }
}
