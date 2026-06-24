import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Cliente service role com fetch no-store (RLS bloqueia anon; tudo passa por aqui no servidor).
export function contestDb() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service credentials ausentes')
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (u, o) => fetch(u, { ...o, cache: 'no-store' }) },
  })
}
