import { NextResponse } from 'next/server'
import { getLeaderboardCounts } from '@/lib/contest/public'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// Contagens agregadas (sem PII) pra atualização "ao vivo" da galeria/ranking.
export async function GET() {
  try {
    const participants = await getLeaderboardCounts()
    const total = participants.reduce((s, p) => s + p.votes, 0)
    return NextResponse.json({ participants, total, count: participants.length }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ participants: [], total: 0, count: 0 })
  }
}
