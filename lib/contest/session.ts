import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'contest_session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 dias

function secret(): string {
  const s = process.env.PARTICIPANT_SESSION_SECRET
  if (!s) throw new Error('PARTICIPANT_SESSION_SECRET ausente')
  return s
}
function sign(id: string, exp: number): string {
  return createHmac('sha256', secret()).update(`${id}.${exp}`).digest('hex')
}

export function makeSessionValue(id: string): string {
  const exp = Date.now() + MAX_AGE * 1000
  return `${id}.${exp}.${sign(id, exp)}`
}

export function verifySessionValue(v: string | undefined | null): string | null {
  if (!v) return null
  const [id, exp, sig] = v.split('.')
  if (!id || !exp || !sig) return null
  const good = sign(id, Number(exp))
  const a = Buffer.from(sig)
  const b = Buffer.from(good)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  if (Date.now() > Number(exp)) return null
  return id
}

export async function setParticipantSession(id: string): Promise<void> {
  ;(await cookies()).set(SESSION_COOKIE, makeSessionValue(id), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function clearParticipantSession(): Promise<void> {
  ;(await cookies()).set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export async function getParticipantId(): Promise<string | null> {
  return verifySessionValue((await cookies()).get(SESSION_COOKIE)?.value)
}
