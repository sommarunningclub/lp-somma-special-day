import { NextRequest, NextResponse } from 'next/server'
import { getSchedule, getRuns } from '@/lib/campaign/campaign-store'
import { dispatchStep } from '@/lib/campaign/dispatch'
import type { CountdownStepKey } from '@/lib/campaign/vip-countdown-steps'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 120

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.get('authorization')
  if (header === `Bearer ${secret}`) return true
  // fallback para acionamento manual via querystring
  return req.nextUrl.searchParams.get('secret') === secret
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const forced = req.nextUrl.searchParams.get('step') as CountdownStepKey | null
  const now = Date.now()

  // Define o passo a processar: forçado por querystring OU o primeiro vencido,
  // habilitado e ainda NÃO enviado (evita ficar preso num passo já concluído).
  let stepToRun: CountdownStepKey | null = forced
  if (!stepToRun) {
    const [schedule, runs] = await Promise.all([getSchedule(), getRuns()])
    const due = schedule
      .filter((s) => s.enabled && new Date(s.sendAt).getTime() <= now && runs[s.step]?.status !== 'enviado')
      .sort((a, b) => new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime())
    stepToRun = due[0]?.step ?? null
  }

  if (!stepToRun) {
    return NextResponse.json({ ok: true, message: 'Nenhum passo vencido para enviar.' })
  }

  try {
    const outcome = await dispatchStep(stepToRun)
    return NextResponse.json({ ok: true, ...outcome })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[cron vip-countdown] erro:', msg)
    return NextResponse.json({ ok: false, step: stepToRun, error: msg }, { status: 500 })
  }
}
