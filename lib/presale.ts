import { createServerClient } from '@/lib/supabase/server'

const DEFAULT_LIMIT = 110

export type PresaleStatus = {
  limit: number
  startAt: string | null
  count: number
  closed: boolean
  restantes: number
}

async function getSettings(): Promise<{ limit: number; startAt: string | null }> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['presale_limit', 'presale_start_at'])

    const map = new Map((data ?? []).map((r) => [r.key as string, r.value as string]))
    const parsedLimit = Number.parseInt(map.get('presale_limit') ?? '', 10)

    return {
      limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_LIMIT,
      startAt: map.get('presale_start_at') ?? null,
    }
  } catch {
    return { limit: DEFAULT_LIMIT, startAt: null }
  }
}

async function getCount(startAt: string | null): Promise<number> {
  try {
    const supabase = createServerClient()
    let query = supabase.from('lista_vip').select('id', { count: 'exact', head: true })
    if (startAt) query = query.gte('created_at', startAt)
    const { count } = await query
    return count ?? 0
  } catch {
    return 0
  }
}

/** Status atual da pré-venda (limite real, contagem e se esgotou). */
export async function getPresaleStatus(): Promise<PresaleStatus> {
  const { limit, startAt } = await getSettings()
  const count = await getCount(startAt)
  // Sem marco zero configurado (migration ainda não rodada) não dá para contar
  // "do zero" de forma confiável — nesse caso a pré-venda fica aberta.
  const closed = startAt !== null && count >= limit
  return {
    limit,
    startAt,
    count,
    closed,
    restantes: Math.max(0, limit - count),
  }
}

/** Atualiza o limite real de vagas (controle de folga oculta no admin). */
export async function setPresaleLimit(limit: number): Promise<boolean> {
  if (!Number.isFinite(limit) || limit < 0) return false
  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'presale_limit', value: String(Math.floor(limit)), updated_at: new Date().toISOString() })
    return !error
  } catch {
    return false
  }
}
