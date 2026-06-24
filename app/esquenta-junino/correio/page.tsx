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
  // Privacidade: o mural tem contatos e fotos pessoais — não indexar em buscadores.
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

  // Service role + no-store (RLS esconde tudo da anon key). select('*') é resiliente
  // caso alguma coluna nova ainda não exista (mapeamos com fallback abaixo).
  const supabase = createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (u, o) => fetch(u, { ...o, cache: 'no-store' }) },
  })

  const { data, error } = await supabase.from('correio_elegante').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('[correio-mural] erro ao buscar:', error.message)
    return []
  }

  return (data ?? []).map(
    (r): Correio => ({
      id: r.id,
      nome: r.nome ?? null,
      instagram: r.instagram ?? null,
      contato: r.contato ?? null,
      de_foto_url: r.de_foto_url ?? null,
      para_nome: r.para_nome ?? null,
      para_instagram: r.para_instagram ?? null,
      para_foto_url: r.para_foto_url ?? null,
      mensagem: r.mensagem ?? '',
      oculto: r.oculto ?? false,
      created_at: r.created_at,
    })
  )
}

export default async function CorreioMuralPage({ searchParams }: { searchParams: { k?: string } }) {
  const token = process.env.CORREIO_ADMIN_TOKEN
  const admin = !!token && searchParams?.k === token

  const todas = await getMensagens()
  const mensagens = admin ? todas : todas.filter((m) => !m.oculto)

  return <CorreioMural mensagens={mensagens} admin={admin} adminToken={admin ? (searchParams?.k ?? '') : ''} />
}
