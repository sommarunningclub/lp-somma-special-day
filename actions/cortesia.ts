'use server'

import { revalidatePath } from 'next/cache'
import { isAuthenticated } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { cortesiaSchema, CORTESIA_LIMITE, type CortesiaInput } from '@/lib/validations/cortesia'
import { isCortesiaBloqueada, setCortesiaBloqueada } from '@/lib/cortesia/settings'

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
    // Bloqueio manual (kill-switch acionado pelo admin). Checado no servidor
    // para nao depender do estado da pagina.
    if (await isCortesiaBloqueada()) {
      return { success: false, error: 'As inscrições de cortesia estão encerradas no momento.' }
    }

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

type ToggleResult =
  | { success: true; bloqueada: boolean }
  | { success: false; error: string }

/**
 * Liga/desliga o bloqueio manual do formulario de cortesia (kill-switch do
 * admin). Somente admin autenticado. Revalida a pagina publica e o painel.
 */
export async function toggleCortesiaBloqueada(bloquear: boolean): Promise<ToggleResult> {
  if (!(await isAuthenticated())) {
    return { success: false, error: 'Sessão expirada. Faça login novamente.' }
  }

  try {
    await setCortesiaBloqueada(bloquear)
    revalidatePath('/cortesia')
    revalidatePath('/cortesia/admin')
    return { success: true, bloqueada: bloquear }
  } catch {
    return { success: false, error: 'Não foi possível atualizar. Tente novamente.' }
  }
}

type PagoResult =
  | { success: true; pago: boolean }
  | { success: false; error: string }

/**
 * Marca/desmarca uma cortesia como paga (controle manual do admin). Registra a
 * data em pago_em. Somente admin autenticado. Revalida o painel.
 */
export async function setCortesiaPago(id: string, pago: boolean): Promise<PagoResult> {
  if (!(await isAuthenticated())) {
    return { success: false, error: 'Sessão expirada. Faça login novamente.' }
  }
  if (!id) return { success: false, error: 'Registro inválido.' }

  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('cortesia')
      .update({ pago, pago_em: pago ? new Date().toISOString() : null })
      .eq('id', id)

    if (error) {
      return { success: false, error: 'Não foi possível salvar. Tente novamente.' }
    }
    revalidatePath('/cortesia/admin')
    return { success: true, pago }
  } catch {
    return { success: false, error: 'Não foi possível salvar. Tente novamente.' }
  }
}
