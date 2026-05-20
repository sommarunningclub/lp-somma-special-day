'use server'

import { redirect } from 'next/navigation'
import { findInsiderByCPF, createInsiderSession, destroyInsiderSession } from '@/lib/insider'

type ValidarResult = { success: false; error: string }

export async function validarInsider(formData: FormData): Promise<ValidarResult> {
  const cpf = String(formData.get('cpf') ?? '')
  const digits = cpf.replace(/\D/g, '')

  if (digits.length !== 11) {
    return { success: false, error: 'Digite um CPF válido (11 dígitos).' }
  }

  const autorizado = await findInsiderByCPF(cpf)
  if (!autorizado) {
    // CPF não está na lista de insiders → vai para a Lista VIP
    redirect('/listavip')
  }

  await createInsiderSession(cpf)
  redirect('/')
}

export async function sairInsider(): Promise<void> {
  await destroyInsiderSession()
  redirect('/acesso')
}
