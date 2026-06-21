import { createServerClient } from '@/lib/supabase/server'
import { PRESALE } from '@/lib/presale-constants'

const DEFAULT_LIMIT = 0 // 0 = ilimitado (padrão enquanto não há config no banco)

export type PresaleStatus = {
  limit: number
  startAt: string | null
  count: number
  closed: boolean
  restantes: number
  /** Interruptor manual do formulário: false = admin fechou o cadastro. */
  manualOpen: boolean
  /** Pré-venda passou do prazo (domingo 23h59 BRT). */
  pastDeadline: boolean
}

async function getSettings(): Promise<{ limit: number; startAt: string | null; manualOpen: boolean }> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['presale_limit', 'presale_start_at', 'presale_open'])

    const map = new Map((data ?? []).map((r) => [r.key as string, r.value as string]))
    const parsedLimit = Number.parseInt(map.get('presale_limit') ?? '', 10)

    return {
      limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_LIMIT,
      startAt: map.get('presale_start_at') ?? null,
      // Sem a chave no banco, o formulário fica aberto.
      manualOpen: (map.get('presale_open') ?? 'true') !== 'false',
    }
  } catch {
    return { limit: DEFAULT_LIMIT, startAt: null, manualOpen: true }
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

/** Status atual da pré-venda (interruptor manual, limite, contagem). */
export async function getPresaleStatus(): Promise<PresaleStatus> {
  const { limit, startAt, manualOpen } = await getSettings()
  const count = await getCount(startAt)
  // Fechada se: o admin fechou manualmente, OU há limite (> 0) atingido, OU passou do prazo (dom 23h59).
  const closedByLimit = startAt !== null && limit > 0 && count >= limit
  const pastDeadline = Date.now() > new Date(PRESALE.deadlineISO).getTime()
  const closed = !manualOpen || closedByLimit || pastDeadline
  return {
    limit,
    startAt,
    count,
    closed,
    restantes: Math.max(0, limit - count),
    manualOpen,
    pastDeadline,
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

/** Abre/fecha o formulário da lista VIP manualmente (interruptor do admin). */
export async function setPresaleOpen(open: boolean): Promise<boolean> {
  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'presale_open', value: open ? 'true' : 'false', updated_at: new Date().toISOString() })
    return !error
  } catch {
    return false
  }
}
