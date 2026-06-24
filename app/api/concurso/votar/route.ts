import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { contestDb } from '@/lib/contest/db'
import { voteSchema } from '@/lib/contest/schemas'
import { hashCpf, hashOpaque } from '@/lib/contest/cpf-hash'
import { getContestSettings, votacaoAberta } from '@/lib/contest/settings'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// Mensagem única pra qualquer falha de voto — não revela se o CPF já votou.
const GENERIC = 'Este voto não pôde ser concluído. Confira os dados e tente novamente.'
const VOTED_COOKIE = 'cj_voted'
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 30

function clientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    // Honeypot anti-bot.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ error: GENERIC }, { status: 400 })
    }

    if (!votacaoAberta(await getContestSettings())) {
      return NextResponse.json({ error: 'A votação não está aberta no momento.' }, { status: 403 })
    }

    const parsed = voteSchema.safeParse(body)
    if (!parsed.success) {
      const confirmFalhou = parsed.error.issues.some((i) => i.path[0] === 'confirm')
      return NextResponse.json({ error: confirmFalhou ? 'Você precisa confirmar a declaração.' : GENERIC }, { status: 400 })
    }
    const { participant_id, cpf } = parsed.data

    const db = contestDb()
    const ipHash = hashOpaque(clientIp(request))
    const uaHash = hashOpaque(request.headers.get('user-agent') || 'unknown')

    // Rate limit por IP (registra tentativa e conta na janela).
    await db.from('contest_vote_attempts').insert({ ip_hash: ipHash })
    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString()
    const { count } = await db
      .from('contest_vote_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since)
    if ((count ?? 0) > RATE_MAX) {
      return NextResponse.json({ error: GENERIC }, { status: 429 })
    }

    // Rate limit por sessão (cookie marca quem já votou neste navegador).
    if ((await cookies()).get(VOTED_COOKIE)?.value) {
      return NextResponse.json({ error: GENERIC }, { status: 400 })
    }

    // Participante precisa existir e estar publicado.
    const { data: part } = await db.from('contest_participants').select('id, status').eq('id', participant_id).maybeSingle()
    if (!part || part.status !== 'published') {
      return NextResponse.json({ error: GENERIC }, { status: 400 })
    }

    const voter_hash = hashCpf(cpf)
    const { error } = await db
      .from('contest_votes')
      .insert({ participant_id, voter_hash, ip_hash: ipHash, user_agent_hash: uaHash })

    if (error) {
      // 23505 = CPF já votou. Resposta genérica (não revela).
      return NextResponse.json({ error: GENERIC }, { status: 400 })
    }

    ;(await cookies()).set(VOTED_COOKIE, '1', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: GENERIC }, { status: 500 })
  }
}
