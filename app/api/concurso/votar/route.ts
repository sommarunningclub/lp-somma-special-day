import { NextRequest, NextResponse } from 'next/server'
import { contestDb } from '@/lib/contest/db'
import { voteSchema } from '@/lib/contest/schemas'
import { hashCpf, hashOpaque } from '@/lib/contest/cpf-hash'
import { getContestSettings, votacaoAberta } from '@/lib/contest/settings'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const GENERIC = 'Este voto não pôde ser concluído. Confira os dados e tente novamente.'
const JA_VOTOU = 'Esse CPF já votou no concurso. Cada pessoa vota uma única vez. 🌽'

// Trava de voto e SO pelo CPF (1 por pessoa, garantido pelo unique index
// uq_votes_voter). Sem cookie de navegador: varias pessoas podem votar do
// mesmo aparelho num evento presencial.
// Rate limit por IP segue ativo (anti-spam) mas com folga alta, ja que num
// evento o publico inteiro costuma compartilhar o mesmo IP (WiFi do local).
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 1000

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
      return NextResponse.json({ error: confirmFalhou ? 'Você precisa confirmar a declaração.' : 'CPF inválido. Confira os números.' }, { status: 400 })
    }
    const { participant_id, cpf } = parsed.data

    const db = contestDb()
    const ipHash = hashOpaque(clientIp(request))
    const uaHash = hashOpaque(request.headers.get('user-agent') || 'unknown')

    // Rate limit por IP (anti-spam) — folga alta pro WiFi do evento.
    await db.from('contest_vote_attempts').insert({ ip_hash: ipHash })
    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString()
    const { count } = await db
      .from('contest_vote_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since)
    if ((count ?? 0) > RATE_MAX) {
      return NextResponse.json({ error: 'Muitos votos em pouco tempo desse local. Aguarde um instante e tente de novo.' }, { status: 429 })
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
      // 23505 = unique violation no voter_hash = esse CPF já votou.
      if (error.code === '23505') {
        return NextResponse.json({ error: JA_VOTOU, code: 'already_voted' }, { status: 409 })
      }
      console.error('[concurso-votar] insert:', error.message)
      return NextResponse.json({ error: GENERIC }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: GENERIC }, { status: 500 })
  }
}
