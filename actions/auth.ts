'use server'

import { redirect } from 'next/navigation'
import { checkPassword, createSession, destroySession } from '@/lib/auth'

type LoginResult = { success: false; error: string }

export async function login(formData: FormData): Promise<LoginResult> {
  const senha = String(formData.get('senha') ?? '')
  if (!checkPassword(senha)) {
    return { success: false, error: 'Senha incorreta.' }
  }
  await createSession()
  redirect('/admin')
}

export async function logout(): Promise<void> {
  await destroySession()
  redirect('/login-admin')
}
