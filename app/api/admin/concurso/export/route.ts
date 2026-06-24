import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/insider'
import { getAllParticipantsAdmin, logAudit } from '@/lib/contest/admin'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const toCsv = (headers: string[], rows: (unknown[])[]) => [headers.join(','), ...rows.map((r) => r.map(cell).join(','))].join('\n')

// GET ?type=participants|votes — CSV (nunca inclui CPF nem dados de eleitores).
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const type = request.nextUrl.searchParams.get('type') === 'votes' ? 'votes' : 'participants'
  const parts = await getAllParticipantsAdmin()

  let csv: string
  if (type === 'votes') {
    csv = toCsv(
      ['participant_id', 'display_name', 'look_title', 'status', 'votes'],
      parts.map((p) => [p.id, p.display_name, p.look_title, p.status, p.votes])
    )
  } else {
    csv = toCsv(
      ['id', 'display_name', 'full_name', 'email', 'whatsapp', 'instagram', 'city', 'look_title', 'status', 'votes', 'created_at', 'published_at'],
      parts.map((p) => [p.id, p.display_name, p.full_name, p.email, p.whatsapp, p.instagram_handle, p.city, p.look_title, p.status, p.votes, p.created_at, p.published_at])
    )
  }

  await logAudit('export', type, '-')
  return new NextResponse('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="concurso-${type}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
