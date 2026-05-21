'use server'

import { createServerClient } from '@/lib/supabase/server'
import { codeFromLeadId, createRandomVipCode } from '@/lib/lista-vip-code'
import { listaVipSchema, type ListaVipInput } from '@/lib/validations/lista-vip'
import { sendVipTicketEmail } from '@/lib/emails/send-vip-email'

type ActionResult =
  | { success: true; data: { codigoUnico: string } }
  | { success: false; error: string; fields?: Record<string, string[]> }

const MAX_CODE_ATTEMPTS = 8

function normalize({ nome, email, cpf, telefone, sexo }: ListaVipInput) {
  return {
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    cpf: cpf.trim(),
    telefone: telefone.trim(),
    sexo,
  }
}

export async function submitListaVip(formData: unknown): Promise<ActionResult> {
  const parsed = listaVipSchema.safeParse(formData)

  if (!parsed.success) {
    return {
      success: false,
      error: 'Dados inválidos. Verifique os campos.',
      fields: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  try {
    const supabase = createServerClient()
    const lead = normalize(parsed.data)

    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
      const codigoUnico = createRandomVipCode()
      const { data, error } = await supabase
        .from('lista_vip')
        .insert({ ...lead, codigo_unico: codigoUnico })
        .select('id, codigo_unico')
        .single()

      if (!error) {
        const finalCode = data.codigo_unico ?? codigoUnico
        await dispatchVipEmail(lead.nome, lead.email, finalCode)
        return { success: true, data: { codigoUnico: finalCode } }
      }

      if (error.code === '23505') {
        if (error.message.toLowerCase().includes('codigo')) continue
        return { success: false, error: 'Você já está na lista VIP!' }
      }

      if (error.code !== '42703' && error.code !== 'PGRST204') {
        return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
      }

      break
    }

    const { data, error } = await supabase
      .from('lista_vip')
      .insert(lead)
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Você já está na lista VIP!' }
      }
      return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
    }

    const fallbackCode = codeFromLeadId(data.id)
    await dispatchVipEmail(lead.nome, lead.email, fallbackCode)
    return { success: true, data: { codigoUnico: fallbackCode } }
  } catch {
    return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
  }
}

async function dispatchVipEmail(nome: string, email: string, codigoUnico: string): Promise<void> {
  try {
    await sendVipTicketEmail({ nome, email, codigoUnico })
  } catch (error) {
    console.error('[lista-vip] Erro ao disparar e-mail VIP:', error)
  }
}
