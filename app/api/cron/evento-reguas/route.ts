import { NextRequest, NextResponse } from 'next/server'
import { REGUAS_META, type EventoBase } from '@/lib/evento/reguas'
import { getSchedule, getRuns } from '@/lib/evento/store'
import { dispatchStep } from '@/lib/evento/dispatch'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.get('authorization')
  if (header === `Bearer ${secret}`) return true
  return req.nextUrl.searchParams.get('secret') === secret
}

/** Passo vencido mais antigo de uma base (ainda não enviado e ativo). */
async function dueStep(base: EventoBase, now: number): Promise<string | null> {
  const [schedule, runs] = await Promise.all([getSchedule(base), getRuns(base)])
  const due = schedule
    .filter((s) => s.enabled && new Date(s.sendAt).getTime() <= now && runs[s.step]?.status !== 'enviado')
    .sort((a, b) => new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime())
  return due[0]?.step ?? null
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const now = Date.now()
  const results: unknown[] = []

  // Dispara no máximo um passo vencido por base a cada execução.
  for (const meta of REGUAS_META) {
    const forced = req.nextUrl.searchParams.get(meta.base)
    const step = forced ?? (await dueStep(meta.base, now))
    if (!step) continue
    try {
      const outcome = await dispatchStep(meta.base, step)
      results.push(outcome)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`[cron evento-reguas] ${meta.base}/${step} erro:`, msg)
      results.push({ base: meta.base, step, error: msg })
    }
  }

  return NextResponse.json({ ok: true, ran: results.length, results })
}
