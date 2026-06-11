'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { isAuthenticated } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { propostaSchema, type PropostaInput } from '@/lib/validations/proposta'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const idSchema = z.string().uuid('Proposta inválida')

async function ensureAdmin(): Promise<ActionResult> {
  if (await isAuthenticated()) {
    return { success: true, data: undefined }
  }

  return { success: false, error: 'Sessão expirada. Faça login novamente.' }
}

function normalize(input: PropostaInput) {
  return {
    cliente_nome: input.cliente_nome.trim(),
    cliente_empresa: input.cliente_empresa?.trim() || null,
    slug: input.slug.trim(),
    mensagem_abertura: input.mensagem_abertura?.trim() || null,
    validade: input.validade?.trim() || null,
    cota_recomendada: input.cota_recomendada ?? null,
    cotas_visiveis: input.cotas_visiveis,
    avulsas_visiveis: input.avulsas_visiveis,
    valores_personalizados: input.valores_personalizados ?? {},
    whatsapp_telefone: input.whatsapp_telefone?.trim() || null,
    contato_responsavel: input.contato_responsavel?.trim() || null,
    ocultar_avulsas: input.ocultar_avulsas ?? false,
    ocultar_comparativo: input.ocultar_comparativo ?? false,
  }
}

export async function criarProposta(input: PropostaInput): Promise<ActionResult<{ slug: string }>> {
  const auth = await ensureAdmin()
  if (!auth.success) return auth

  const parsed = propostaSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = createServerClient()
  const { error } = await supabase.from('propostas').insert(normalize(parsed.data))

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Já existe uma proposta com esse slug.' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath(`/proposta/${parsed.data.slug}`)
  return { success: true, data: { slug: parsed.data.slug } }
}

export async function atualizarProposta(id: string, input: PropostaInput): Promise<ActionResult> {
  const auth = await ensureAdmin()
  if (!auth.success) return auth

  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) {
    return { success: false, error: parsedId.error.issues[0]?.message ?? 'Proposta inválida' }
  }

  const parsed = propostaSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = createServerClient()
  const { error } = await supabase
    .from('propostas')
    .update({ ...normalize(parsed.data), updated_at: new Date().toISOString() })
    .eq('id', parsedId.data)

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Já existe outra proposta com esse slug.' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath(`/proposta/${parsed.data.slug}`)
  return { success: true, data: undefined }
}

export async function excluirProposta(id: string): Promise<ActionResult> {
  const auth = await ensureAdmin()
  if (!auth.success) return auth

  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) {
    return { success: false, error: parsedId.error.issues[0]?.message ?? 'Proposta inválida' }
  }

  const supabase = createServerClient()
  const { error } = await supabase.from('propostas').delete().eq('id', parsedId.data)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin')
  return { success: true, data: undefined }
}
