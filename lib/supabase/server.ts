import { createClient } from '@supabase/supabase-js'

const SUPABASE_FETCH_TIMEOUT_MS = 5_000

// IMPORTANTE: `cache: 'no-store'` é OBRIGATORIO pra evitar que o data cache
// do Next.js armazene o resultado dos SELECTs em rotas dynamic. Sem isso,
// crons que rodam de hora em hora podem ver dados antigos e disparar
// duplicacoes (foi o bug que causou ~17 envios duplicados de D2 da nutricao
// em 25/06/2026, ate que o killswitch fosse acionado).
function fetchNoStore(url: RequestInfo | URL, opts?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SUPABASE_FETCH_TIMEOUT_MS)
  return fetch(url, { ...opts, cache: 'no-store', signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  )
}

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false },
      global: { fetch: fetchNoStore },
    },
  )
}
