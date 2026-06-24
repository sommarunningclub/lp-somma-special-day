import { NextRequest, NextResponse } from 'next/server'
import { contestDb } from '@/lib/contest/db'
import { verificarSchema } from '@/lib/contest/schemas'
import { hashOpaque } from '@/lib/contest/cpf-hash'
import { setParticipantSession } from '@/lib/contest/session'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// POST { email, code } — valida o OTP e cria a sessão (cookie).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const parsed = verificarSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Código inválido ou expirado.' }, { status: 400 })

  const email = parsed.data.email.toLowerCase()
  const db = contestDb()
  const { data: p } = await db
    .from('contest_participants')
    .select('id, access_code_hash, access_code_expires_at, status')
    .eq('email', email)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const ok =
    p &&
    p.access_code_hash &&
    p.access_code_expires_at &&
    Date.now() < Date.parse(p.access_code_expires_at) &&
    p.access_code_hash === hashOpaque(parsed.data.code)

  if (!ok) return NextResponse.json({ error: 'Código inválido ou expirado.' }, { status: 400 })

  await db.from('contest_participants').update({ access_code_hash: null, access_code_expires_at: null }).eq('id', p!.id)
  await setParticipantSession(p!.id)
  return NextResponse.json({ ok: true })
}
