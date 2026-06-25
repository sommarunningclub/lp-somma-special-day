import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { contestDb } from '@/lib/contest/db'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// DELETE /api/admin/concurso/votos
//   { participantId?: uuid }
// Sem participantId: zera TODOS os votos do concurso.
// Com participantId: zera apenas os votos daquele participante.
// Requer confirmacao via header X-Confirm: ZERAR (extra safety).
export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
  }
  if (request.headers.get('x-confirm') !== 'ZERAR') {
    return NextResponse.json({ error: 'Confirmacao ausente.' }, { status: 400 })
  }

  const body = await request.json().catch(() => ({} as { participantId?: string }))
  const participantId = typeof body.participantId === 'string' ? body.participantId : null

  const db = contestDb()
  // delete().select() retorna as linhas deletadas — usamos length pra contar.
  const base = db.from('contest_votes').delete()
  const filtered = participantId
    ? base.eq('participant_id', participantId)
    : base.gte('created_at', '1900-01-01')
  const { data: removed, error } = await filtered.select('id')

  if (error) {
    console.error('[admin-votos-reset]', error.message)
    return NextResponse.json({ error: 'Nao foi possivel zerar os votos.' }, { status: 500 })
  }

  const count = removed?.length ?? 0

  // log de auditoria (best effort)
  try {
    await db.from('contest_admin_audit_logs').insert({
      action: participantId ? 'reset_votes_participant' : 'reset_votes_all',
      target_type: participantId ? 'participant' : 'global',
      target_id: participantId,
      metadata: { removed: count },
    })
  } catch {
    // ignora
  }

  return NextResponse.json({ ok: true, removed: count })
}
