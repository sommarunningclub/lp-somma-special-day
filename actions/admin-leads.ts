'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { isAuthenticated } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { listaVipSchema, type ListaVipInput } from '@/lib/validations/lista-vip'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fields?: Record<string, string[]> }

const idSchema = z.string().uuid('Lead inválido')

function normalize(input: ListaVipInput) {
  return {
    nome: input.nome.trim(),
    email: input.email.trim().toLowerCase(),
    cpf: input.cpf.trim(),
    telefone: input.telefone.trim(),
    sexo: input.sexo,
  }
}

async function ensureAdmin(): Promise<ActionResult> {
  if (await isAuthenticated()) {
    return { success: true, data: undefined }
  }

  return { success: false, error: 'Sessão expirada. Faça login novamente.' }
}

export async function criarLeadListaVip(input: ListaVipInput): Promise<ActionResult> {
  const auth = await ensureAdmin()
  if (!auth.success) return auth

  const parsed = listaVipSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos.',
      fields: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = createServerClient()
  const { error } = await supabase
    .from('lista_vip')
    .insert(normalize(parsed.data))

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Já existe um lead com este e-mail ou CPF.' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/leads')
  return { success: true, data: undefined }
}

export async function atualizarLeadListaVip(id: string, input: ListaVipInput): Promise<ActionResult> {
  const auth = await ensureAdmin()
  if (!auth.success) return auth

  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) {
    return { success: false, error: parsedId.error.issues[0]?.message ?? 'Lead inválido' }
  }

  const parsed = listaVipSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos.',
      fields: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const supabase = createServerClient()
  const { error } = await supabase
    .from('lista_vip')
    .update(normalize(parsed.data))
    .eq('id', parsedId.data)

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Já existe outro lead com este e-mail ou CPF.' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/leads')
  return { success: true, data: undefined }
}
