'use server'

import { redirect } from 'next/navigation'
import { createListaVipAccessSession, destroyInsiderSession, findListaVipAccess } from '@/lib/insider'

type ValidarResult = { success: false; error: string }

export async function validarInsider(formData: FormData): Promise<ValidarResult> {
  const identificador = String(formData.get('identificador') ?? formData.get('cpf') ?? '').trim()

  if (!identificador) {
    return { success: false, error: 'Digite seu CPF, e-mail ou código VIP.' }
  }

  const autorizado = await findListaVipAccess(identificador)
  if (!autorizado) {
    redirect('/listavip')
  }

  await createListaVipAccessSession(identificador)
  redirect('/')
}

export async function sairInsider(): Promise<void> {
  await destroyInsiderSession()
  redirect('/acesso')
}
