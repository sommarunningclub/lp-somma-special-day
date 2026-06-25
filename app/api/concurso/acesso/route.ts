import { NextRequest, NextResponse } from 'next/server'
import { contestDb } from '@/lib/contest/db'
import { acessoSchema } from '@/lib/contest/schemas'
import { hashCpf } from '@/lib/contest/cpf-hash'
import { setParticipantSession } from '@/lib/contest/session'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// POST { cpf } — valida CPF, encontra inscricao ativa e seta sessao (cookie).
// Sem OTP por e-mail: o proprio CPF e o "ingresso" pra acessar a area.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ error: 'Nao foi possivel entrar.' }, { status: 400 })
    }
    const parsed = acessoSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'CPF inválido.' }, { status: 400 })

    const cpf_hash = hashCpf(parsed.data.cpf)
    const db = contestDb()
    const { data: p } = await db
      .from('contest_participants')
      .select('id')
      .eq('cpf_hash', cpf_hash)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!p) {
      return NextResponse.json({ error: 'Não encontramos uma inscrição com esse CPF.' }, { status: 404 })
    }

    await setParticipantSession(p.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
