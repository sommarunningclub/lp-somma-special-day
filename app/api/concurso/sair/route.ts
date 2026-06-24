import { NextResponse } from 'next/server'
import { clearParticipantSession } from '@/lib/contest/session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  await clearParticipantSession()
  return NextResponse.json({ ok: true })
}
