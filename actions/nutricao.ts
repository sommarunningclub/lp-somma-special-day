'use server'

import { createServerClient } from '@/lib/supabase/server'
import { nutricaoSchema, type NutricaoInput } from '@/lib/validations/nutricao'
import { sendImmediateWelcome } from '@/lib/nutricao/dispatch'

type ActionResult =
  | { success: true }
  | { success: false; error: string; fields?: Record<string, string[]> }

function normalize({ nome, email, telefone }: NutricaoInput) {
  return {
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: telefone?.trim() || null,
  }
}

export async function enrollNutricao(formData: unknown): Promise<ActionResult> {
  const parsed = nutricaoSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos.',
      fields: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const lead = normalize(parsed.data)
  const supabase = createServerClient()

  // upsert por e-mail: se já existe, reativa (caso tenha unsubscribed antes).
  const { data: existing } = await supabase
    .from('nutricao_leads')
    .select('id, unsubscribed_at, completed_at')
    .eq('email', lead.email)
    .maybeSingle()

  let leadId: string

  if (existing) {
    leadId = existing.id as string
    // se já está ativo e em fluxo, não faz nada (idempotente)
    if (!existing.unsubscribed_at && !existing.completed_at) {
      return { success: true }
    }
    // reativa: limpa unsubscribed/completed para entrar de novo no fluxo
    const { error: updErr } = await supabase
      .from('nutricao_leads')
      .update({
        nome: lead.nome,
        telefone: lead.telefone,
        unsubscribed_at: null,
        completed_at: null,
        jump_to_final: false,
        created_at: new Date().toISOString(),
      })
      .eq('id', leadId)
    if (updErr) {
      console.error('[nutricao] update existing falhou:', updErr.message)
      return { success: false, error: 'Não foi possível concluir o cadastro. Tente novamente.' }
    }
  } else {
    const { data: inserted, error: insErr } = await supabase
      .from('nutricao_leads')
      .insert(lead)
      .select('id')
      .single()
    if (insErr || !inserted) {
      console.error('[nutricao] insert falhou:', insErr?.message)
      return { success: false, error: 'Não foi possível concluir o cadastro. Tente novamente.' }
    }
    leadId = inserted.id as string
  }

  // Dispara o e-mail de boas-vindas imediatamente (D0). Erros aqui não impedem o cadastro.
  await sendImmediateWelcome(leadId).catch((e) => {
    console.error('[nutricao] sendImmediateWelcome falhou:', e instanceof Error ? e.message : e)
  })

  return { success: true }
}
