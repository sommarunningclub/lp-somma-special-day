import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/insider'
import { contestDb } from '@/lib/contest/db'
import { removeContestPhotos } from '@/lib/contest/storage'
import { logAudit } from '@/lib/contest/admin'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const STATUS_OK = ['draft', 'published', 'hidden', 'disqualified']
const CAMPOS = ['display_name', 'look_title', 'look_description', 'city', 'instagram_handle'] as const

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const id = params.id
  const body = await request.json().catch(() => ({}))
  const db = contestDb()

  const update: Record<string, unknown> = {}
  if (typeof body.status === 'string') {
    if (!STATUS_OK.includes(body.status)) return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    update.status = body.status
    if (body.status === 'published') {
      const { data: cur } = await db.from('contest_participants').select('published_at').eq('id', id).maybeSingle()
      update.published_at = cur?.published_at ?? new Date().toISOString()
    }
  }
  for (const c of CAMPOS) if (typeof body[c] === 'string') update[c] = body[c]

  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 })

  const { data, error } = await db.from('contest_participants').update(update).eq('id', id).select('id')
  if (error) return NextResponse.json({ error: 'Falha ao atualizar' }, { status: 500 })
  if (!data?.length) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  await logAudit('participant.update', 'participant', id, update)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const id = params.id
  const db = contestDb()
  const { data: row } = await db.from('contest_participants').select('main_photo_url, second_photo_url').eq('id', id).maybeSingle()
  await removeContestPhotos([row?.main_photo_url, row?.second_photo_url])
  const { data, error } = await db.from('contest_participants').delete().eq('id', id).select('id')
  if (error) return NextResponse.json({ error: 'Falha ao excluir' }, { status: 500 })
  if (!data?.length) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  await logAudit('participant.delete', 'participant', id)
  return NextResponse.json({ ok: true })
}
