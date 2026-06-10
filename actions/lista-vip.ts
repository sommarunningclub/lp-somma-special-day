'use server'

import { createServerClient } from '@/lib/supabase/server'
import { codeFromLeadId, createRandomVipCode } from '@/lib/lista-vip-code'
import { listaVipSchema, type ListaVipInput } from '@/lib/validations/lista-vip'
import { sendVipTicketEmail } from '@/lib/emails/send-vip-email'
import { getPresaleStatus } from '@/lib/presale'
import { PRESALE } from '@/lib/presale-constants'

type ActionResult =
  | { success: true; data: { codigoUnico: string } }
  | { success: false; error: string; closed?: boolean; fields?: Record<string, string[]> }

const MAX_CODE_ATTEMPTS = 8

const PRESALE_CLOSED_MESSAGE =
  'O cadastro da Lista VIP está encerrado no momento. Fique de olho nas nossas redes: em breve teremos novidades.'

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

  // Trava de vagas: ao atingir o limite real (com folga oculta), encerra a pré-venda.
  const status = await getPresaleStatus()
  if (status.closed) {
    return { success: false, error: PRESALE_CLOSED_MESSAGE, closed: true }
  }

  try {
    const supabase = createServerClient()
    const lead = normalize(parsed.data)

    // A coluna cupom só existe após a migration 005; cai para insert sem cupom se faltar.
    let incluirCupom = true

    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
      const codigoUnico = createRandomVipCode()
      const payload = incluirCupom
        ? { ...lead, codigo_unico: codigoUnico, cupom: PRESALE.cupom }
        : { ...lead, codigo_unico: codigoUnico }

      const { data, error } = await supabase
        .from('lista_vip')
        .insert(payload)
        .select('id, codigo_unico')
        .single()

      if (!error) {
        const finalCode = data.codigo_unico ?? codigoUnico
        await dispatchVipEmail(lead.nome, lead.email, data.id)
        return { success: true, data: { codigoUnico: finalCode } }
      }

      // Coluna cupom inexistente: tenta de novo sem ela (não consome tentativa).
      if ((error.code === '42703' || error.code === 'PGRST204') && incluirCupom) {
        incluirCupom = false
        attempt -= 1
        continue
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
    await dispatchVipEmail(lead.nome, lead.email, data.id)
    return { success: true, data: { codigoUnico: fallbackCode } }
  } catch {
    return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
  }
}

async function dispatchVipEmail(nome: string, email: string, leadId: string): Promise<void> {
  try {
    const resendId = await sendVipTicketEmail({ nome, email, cupom: PRESALE.cupom })
    if (resendId) {
      // Marca como enviado já no cadastro; o webhook completa entregue/aberto/clicado.
      const supabase = createServerClient()
      await supabase
        .from('lista_vip')
        .update({ resend_email_id: resendId, email_status: 'sent', email_sent_at: new Date().toISOString() })
        .eq('id', leadId)
    }
  } catch (error) {
    console.error('[lista-vip] Erro ao disparar e-mail VIP:', error)
  }
}
