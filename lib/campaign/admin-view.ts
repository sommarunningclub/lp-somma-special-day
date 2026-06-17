import { COUNTDOWN_STEPS } from './vip-countdown-steps'
import { getSchedule, getRuns } from './campaign-store'
import { countEligible, getStepMetrics } from './dispatch'
import type { StepView } from '@/components/admin/CampaignManager'

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

export async function getCampaignView(): Promise<{ steps: StepView[]; totalEligible: number }> {
  const [schedule, runs, totalEligible] = await Promise.all([getSchedule(), getRuns(), countEligible()])

  const steps: StepView[] = []
  for (let i = 0; i < COUNTDOWN_STEPS.length; i++) {
    const cfg = COUNTDOWN_STEPS[i]
    const sch = schedule.find((s) => s.step === cfg.step)
    const run = runs[cfg.step]
    const sendAt = sch?.sendAt ?? cfg.sendAt
    const { local, dia } = toBrt(sendAt)
    const metrics = await getStepMetrics(cfg.step, run?.dispatchedAt)

    steps.push({
      step: cfg.step,
      ordem: i + 1,
      dia,
      sendAtLocal: local,
      enabled: sch?.enabled ?? true,
      subject: cfg.subject,
      status: run?.status ?? 'pendente',
      enviados: metrics.enviados,
      aberturas: metrics.aberturas,
      cliques: metrics.cliques,
    })
  }

  return { steps, totalEligible }
}
