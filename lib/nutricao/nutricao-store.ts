/**
 * Overrides editáveis dos passos de nutrição, persistidos em `app_settings`
 * (chave `nutricao_overrides`). Permite editar copy de cada e-mail pelo admin
 * sem precisar de redeploy.
 *
 * O constants `NUTRICAO_STEPS` continua como fallback (defaults). Quando o
 * admin edita um passo, gravamos só o patch e, na hora de enviar, mesclamos.
 */

import { createServerClient } from '@/lib/supabase/server'
import {
  NUTRICAO_STEPS,
  getNutricaoStep,
  type NutricaoStep,
  type NutricaoStepKey,
} from './nutricao-steps'

const K_OVERRIDES = 'nutricao_overrides'

/** Campos que o admin pode editar (NÃO permite mudar offset/ordem/step). */
export type StepOverride = Partial<
  Pick<NutricaoStep, 'subject' | 'kicker' | 'headline' | 'selo' | 'message' | 'cta' | 'theme'>
> & { enabled?: boolean }

type OverridesMap = Partial<Record<NutricaoStepKey, StepOverride>>

async function readOverrides(): Promise<OverridesMap> {
  const supabase = createServerClient()
  const { data } = await supabase.from('app_settings').select('value').eq('key', K_OVERRIDES).maybeSingle()
  if (!data?.value) return {}
  try {
    return JSON.parse(data.value as string) as OverridesMap
  } catch {
    return {}
  }
}

async function writeOverrides(map: OverridesMap): Promise<void> {
  const supabase = createServerClient()
  await supabase
    .from('app_settings')
    .upsert(
      { key: K_OVERRIDES, value: JSON.stringify(map), updated_at: new Date().toISOString() },
      { onConflict: 'key' },
    )
}

/** Mescla constants + override para um passo. Marca enabled (default true). */
export async function resolveStep(step: NutricaoStepKey): Promise<(NutricaoStep & { enabled: boolean }) | null> {
  const base = getNutricaoStep(step)
  if (!base) return null
  const overrides = await readOverrides()
  const patch = overrides[step] ?? {}
  return {
    ...base,
    ...patch,
    step: base.step,
    offsetHours: base.offsetHours,
    ordem: base.ordem,
    enabled: patch.enabled ?? true,
  }
}

/** Resolve TODOS os passos (constants + overrides) para o admin/listagens. */
export async function resolveAllSteps(): Promise<(NutricaoStep & { enabled: boolean })[]> {
  const overrides = await readOverrides()
  return NUTRICAO_STEPS.map((base) => {
    const patch = overrides[base.step] ?? {}
    return {
      ...base,
      ...patch,
      step: base.step,
      offsetHours: base.offsetHours,
      ordem: base.ordem,
      enabled: patch.enabled ?? true,
    }
  })
}

/** Salva o override de um passo (merge campo a campo com o existente). */
export async function saveStepOverride(step: NutricaoStepKey, patch: StepOverride): Promise<void> {
  const current = await readOverrides()
  current[step] = { ...(current[step] ?? {}), ...patch }
  await writeOverrides(current)
}
