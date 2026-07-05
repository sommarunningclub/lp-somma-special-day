import { REGUAS_META, stepsForBase, type EventoBase } from './reguas'
import { getSchedule, getRuns } from './store'
import { countEligible, getStepMetrics } from './dispatch'
import type { ReguaGroup, ReguaStepView } from '@/components/admin/EventoReguasManager'

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

/** UTC ISO -> partes BRT (UTC-3). */
function toBrt(iso: string) {
  const brt = new Date(new Date(iso).getTime() - 3 * 3600 * 1000)
  const local = brt.toISOString().slice(0, 16) // 'YYYY-MM-DDTHH:mm'
  const dd = String(brt.getUTCDate()).padStart(2, '0')
  const mm = String(brt.getUTCMonth() + 1).padStart(2, '0')
  const hh = String(brt.getUTCHours()).padStart(2, '0')
  const min = String(brt.getUTCMinutes()).padStart(2, '0')
  const dia = `${DIAS[brt.getUTCDay()]} ${dd}/${mm} · ${hh}h${min === '00' ? '' : min}`
  return { local, dia }
}

async function buildGroup(base: EventoBase): Promise<ReguaGroup> {
  const meta = REGUAS_META.find((m) => m.base === base)!
  const [schedule, runs, totalEligible] = await Promise.all([getSchedule(base), getRuns(base), countEligible(base)])
  const cfgs = stepsForBase(base)

  const steps: ReguaStepView[] = []
  for (let i = 0; i < cfgs.length; i++) {
    const cfg = cfgs[i]
    const sch = schedule.find((s) => s.step === cfg.step)
    const run = runs[cfg.step]
    const sendAt = sch?.sendAt ?? cfg.sendAt
    const { local, dia } = toBrt(sendAt)
    const metrics = await getStepMetrics(base, cfg.step, run?.dispatchedAt)

    steps.push({
      base,
      step: cfg.step,
      ordem: i + 1,
      dia,
      sendAtLocal: local,
      enabled: sch?.enabled ?? false,
      subject: cfg.subject,
      status: run?.status ?? 'pendente',
      enviados: metrics.enviados,
      aberturas: metrics.aberturas,
      cliques: metrics.cliques,
    })
  }

  return { base, label: meta.label, descricao: meta.descricao, accent: meta.accent, totalEligible, steps }
}

export async function getReguasView(): Promise<ReguaGroup[]> {
  return Promise.all(REGUAS_META.map((m) => buildGroup(m.base)))
}
