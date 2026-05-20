import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'

const COOKIE_NAME = 'somma_insider_session'

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

// Token simples derivado do CPF — não armazena o CPF puro no cookie
function tokenFor(cpfDigits: string): string {
  return Buffer.from(`insider:${cpfDigits}`).toString('base64url')
}

export async function isInsider(): Promise<boolean> {
  const store = await cookies()
  const cookie = store.get(COOKIE_NAME)?.value
  return Boolean(cookie && cookie.startsWith('insider:'))
}

/**
 * Procura o CPF na tabela `dados_insiders`. Aceita CPF com ou sem máscara.
 * Tenta primeiro com o valor puro, depois com a máscara, para suportar bases
 * que armazenam em qualquer um dos dois formatos.
 */
export async function findInsiderByCPF(cpfRaw: string): Promise<boolean> {
  const digits = onlyDigits(cpfRaw)
  if (digits.length !== 11) return false

  const masked = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  const supabase = createServerClient()

  const { data } = await supabase
    .from('dados_insiders')
    .select('cpf')
    .in('cpf', [digits, masked])
    .limit(1)
    .maybeSingle()

  return Boolean(data)
}

export async function createInsiderSession(cpfRaw: string): Promise<void> {
  const digits = onlyDigits(cpfRaw)
  const store = await cookies()
  store.set(COOKIE_NAME, tokenFor(digits), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 ano — só sai pelo botão "Sair"
  })
}

export async function destroyInsiderSession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
