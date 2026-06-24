import type { Metadata, Viewport } from 'next'
import { createClient } from '@supabase/supabase-js'
import CorreioMural, { type Correio } from '@/components/esquenta/CorreioMural'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: 'Correio Elegante · Esquenta SOMMA Special Day',
  description: 'Os recados do Correio Elegante da comunidade SOMMA. Toque num coração e descubra.',
  // Privacidade: o mural tem contatos pessoais — não indexar em buscadores.
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#005EFF',
}

async function getMensagens(): Promise<Correio[]> {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return []

  // Service role + fetch no-store (RLS esconde tudo da anon key; precisa enxergar tudo).
  const supabase = createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (u, o) => fetch(u, { ...o, cache: 'no-store' }) },
  })

  const { data, error } = await supabase
    .from('correio_elegante')
    .select('id, nome, instagram, mensagem, contato, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[correio-mural] erro ao buscar:', error.message)
    return []
  }
  return (data ?? []) as Correio[]
}

export default async function CorreioMuralPage() {
  const mensagens = await getMensagens()
  return <CorreioMural mensagens={mensagens} />
}
