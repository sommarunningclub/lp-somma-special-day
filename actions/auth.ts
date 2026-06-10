'use server'

import { redirect } from 'next/navigation'
import { createAdminSession, destroyAdminSession, findInsiderByCPF } from '@/lib/insider'

type LoginResult = { success: false; error: string }

export async function login(formData: FormData): Promise<LoginResult> {
  const cpf = String(formData.get('cpf') ?? '')
  const chave = String(formData.get('adminKey') ?? '')
  const digits = cpf.replace(/\D/g, '')

  if (digits.length !== 11) {
    return { success: false, error: 'Digite um CPF válido (11 dígitos).' }
  }

  if (!process.env.ADMIN_SECRET_KEY || chave !== process.env.ADMIN_SECRET_KEY) {
    return { success: false, error: 'Chave administrativa inválida.' }
  }

  // CPFs autorizados via env ADMIN_CPFS (lista separada por vírgula) ou tabela dados_insiders.
  const allowlist = (process.env.ADMIN_CPFS ?? '')
    .split(',')
    .map((c) => c.replace(/\D/g, ''))
    .filter((c) => c.length === 11)

  const autorizado = allowlist.includes(digits) || (await findInsiderByCPF(cpf))
  if (!autorizado) {
    return { success: false, error: 'CPF não autorizado para acesso administrativo.' }
  }

  await createAdminSession(cpf)
  redirect('/admin')
}

export async function logout(): Promise<void> {
  await destroyAdminSession()
  redirect('/login-admin')
}
