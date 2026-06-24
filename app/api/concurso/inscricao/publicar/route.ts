import { NextRequest, NextResponse } from 'next/server'
import { contestDb } from '@/lib/contest/db'
import { getParticipantId } from '@/lib/contest/session'
import { getContestSettings, inscricaoAberta } from '@/lib/contest/settings'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// POST { publish: boolean } — publica/despublica a própria inscrição.
export async function POST(request: NextRequest) {
  const id = await getParticipantId()
  if (!id) return NextResponse.json({ error: 'Sessão expirada.' }, { status: 401 })

  if (!inscricaoAberta(await getContestSettings())) {
    return NextResponse.json({ error: 'O período de participação está fechado.' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const publish = !!body.publish
  const db = contestDb()

  const { data: p } = await db
    .from('contest_participants')
    .select('id, main_photo_url, status, published_at')
    .eq('id', id)
    .maybeSingle()
  if (!p) return NextResponse.json({ error: 'Inscrição não encontrada.' }, { status: 404 })
  if (['disqualified', 'deleted'].includes(p.status)) {
    return NextResponse.json({ error: 'Esta inscrição não pode ser alterada.' }, { status: 403 })
  }
  if (publish && !p.main_photo_url) {
    return NextResponse.json({ error: 'Envie pelo menos uma foto antes de publicar.' }, { status: 400 })
  }

  const { error } = await db
    .from('contest_participants')
    .update({ status: publish ? 'published' : 'draft', published_at: publish ? p.published_at ?? new Date().toISOString() : null })
    .eq('id', id)
  if (error) {
    console.error('[concurso-publicar]', error.message)
    return NextResponse.json({ error: 'Não foi possível atualizar.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, status: publish ? 'published' : 'draft' })
}
