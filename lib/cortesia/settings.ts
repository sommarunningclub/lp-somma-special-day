/**
 * Bloqueio manual do formulario de cortesia, persistido em `app_settings`
 * (key/value, service_role). Espelha o padrao de lib/evento/store.ts.
 *
 * Chave:
 *   cortesia_bloqueada -> 'true' | 'false'
 *
 * O formulario fica FECHADO ao publico quando bloqueado manualmente OU quando
 * o total de cadastros atinge CORTESIA_LIMITE (ver actions/cortesia.ts e a
 * pagina /cortesia). Este modulo cobre apenas a flag manual (kill-switch).
 */

import { createServerClient } from '@/lib/supabase/server'

const KEY = 'cortesia_bloqueada'

/** Formulario esta bloqueado manualmente pelo admin? (default: nao) */
export async function isCortesiaBloqueada(): Promise<boolean> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', KEY)
    .maybeSingle()
  return data?.value === 'true'
}

/** Liga/desliga o bloqueio manual do formulario. */
export async function setCortesiaBloqueada(bloqueada: boolean): Promise<void> {
  const supabase = createServerClient()
  await supabase.from('app_settings').upsert(
    { key: KEY, value: bloqueada ? 'true' : 'false', updated_at: new Date().toISOString() },
    { onConflict: 'key' },
  )
}
