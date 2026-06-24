import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/insider'
import { contestDb } from '@/lib/contest/db'
import { logAudit } from '@/lib/contest/admin'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const BOOL = ['is_registration_open', 'is_voting_open', 'is_active', 'show_vote_count_publicly']
const TEXT = ['contest_name', 'prize_title', 'rules_content']
const DATE = ['registration_starts_at', 'registration_ends_at', 'voting_starts_at', 'voting_ends_at']

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const update: Record<string, unknown> = {}
  for (const k of BOOL) if (typeof body[k] === 'boolean') update[k] = body[k]
  for (const k of TEXT) if (typeof body[k] === 'string') update[k] = body[k]
  for (const k of DATE) if (k in body) update[k] = body[k] || null
  if (typeof body.max_photos === 'number') update.max_photos = Math.min(2, Math.max(1, body.max_photos))

  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 })

  const { error } = await contestDb().from('contest_settings').update(update).eq('id', 1)
  if (error) return NextResponse.json({ error: 'Falha ao salvar' }, { status: 500 })
  await logAudit('settings.update', 'settings', '1', update)
  return NextResponse.json({ ok: true })
}
