import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { codeFromLeadId } from '@/lib/lista-vip-code'
import { createServerClient } from '@/lib/supabase/server'

const VIP_COOKIE_NAME = 'somma_vip_session'
const ADMIN_COOKIE_NAME = 'somma_admin_session'
const ONE_YEAR = 60 * 60 * 24 * 365
const ONE_DAY = 60 * 60 * 24

type SessionRole = 'vip' | 'admin'

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

function sessionSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_SECRET_KEY
}

function sign(value: string) {
  const secret = sessionSecret()
  if (!secret) {
    throw new Error('SESSION_SECRET ou ADMIN_SECRET_KEY precisa estar configurado.')
  }

  return createHmac('sha256', secret).update(value).digest('base64url')
}

function encodeSession(payload: { role: SessionRole; subject: string; exp: number }) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${body}.${sign(body)}`
}

function decodeSession(token: string, expectedRole: SessionRole) {
  const [body, signature] = token.split('.')
  if (!body || !signature) return null

  const expected = sign(body)
  const providedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (providedBuffer.length !== expectedBuffer.length) return null
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as {
      role?: string
      subject?: string
      exp?: number
    }

    if (payload.role !== expectedRole || !payload.subject || !payload.exp) return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

async function hasValidSession(cookieName: string, role: SessionRole) {
  const secret = sessionSecret()
  if (!secret) return false

  const store = await cookies()
  const token = store.get(cookieName)?.value
  if (!token) return false

  return Boolean(decodeSession(token, role))
}

async function createSession(cookieName: string, role: SessionRole, subject: string, maxAge: number) {
  const store = await cookies()
  const exp = Math.floor(Date.now() / 1000) + maxAge
  store.set(cookieName, encodeSession({ role, subject, exp }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
}

export async function isInsider(): Promise<boolean> {
  return hasValidSession(VIP_COOKIE_NAME, 'vip')
}

export async function isAdmin(): Promise<boolean> {
  return hasValidSession(ADMIN_COOKIE_NAME, 'admin')
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

export async function findListaVipAccess(identifierRaw: string): Promise<boolean> {
  const identifier = identifierRaw.trim()
  if (!identifier) return false

  const digits = onlyDigits(identifier)
  const normalizedEmail = identifier.toLowerCase()
  const normalizedCode = identifier.toUpperCase()
  const supabase = createServerClient()

  if (digits.length === 11 && await findInsiderByCPF(identifier)) {
    return true
  }

  const masked = digits.length === 11
    ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : null

  const filters = [`email.eq.${normalizedEmail}`]

  if (masked) {
    filters.push(`cpf.eq.${digits}`, `cpf.eq.${masked}`)
  }

  const { data } = await supabase
    .from('lista_vip')
    .select('id')
    .or(filters.join(','))
    .limit(1)
    .maybeSingle()

  if (data) return true

  if (!normalizedCode.startsWith('VIP')) return false

  const { data: leadByStoredCode } = await supabase
    .from('lista_vip')
    .select('id')
    .eq('codigo_unico', normalizedCode)
    .limit(1)
    .maybeSingle()

  if (leadByStoredCode) return true

  const { data: leads } = await supabase
    .from('lista_vip')
    .select('id')
    .limit(5000)

  return Boolean((leads ?? []).find((lead) => codeFromLeadId(lead.id) === normalizedCode))
}

export async function createInsiderSession(cpfRaw: string): Promise<void> {
  const digits = onlyDigits(cpfRaw)
  await createListaVipAccessSession(digits)
}

export async function createListaVipAccessSession(identifierRaw: string): Promise<void> {
  const identifier = identifierRaw.trim().toLowerCase()
  await createSession(VIP_COOKIE_NAME, 'vip', identifier, ONE_YEAR)
}

export async function createAdminSession(cpfRaw: string): Promise<void> {
  const digits = onlyDigits(cpfRaw)
  await createSession(ADMIN_COOKIE_NAME, 'admin', digits, ONE_DAY)
}

export async function destroyInsiderSession(): Promise<void> {
  const store = await cookies()
  store.delete(VIP_COOKIE_NAME)
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies()
  store.delete(ADMIN_COOKIE_NAME)
}
