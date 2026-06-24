import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import CorreioMural, { type Correio } from '@/components/esquenta/CorreioMural'
import { ADMIN_COOKIE, resolverContato, toStoragePath, tokensIguais } from '@/lib/correio'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: 'Correio Elegante · Esquenta SOMMA Special Day',
  description: 'Os recados do Correio Elegante da comunidade SOMMA. Toque num coração e descubra.',
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

const SUPA_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const FOTO_TTL = 60 * 60 * 2 // 2h

function db() {
  return createClient(SUPA_URL!, SERVICE_KEY!, {
    auth: { persistSession: false },
    global: { fetch: (u, o) => fetch(u, { ...o, cache: 'no-store' }) },
  })
}

async function getMensagens(incluirOcultos: boolean): Promise<Correio[]> {
  if (!SUPA_URL || !SERVICE_KEY) return []
  const supabase = db()

  const { data, error } = await supabase.from('correio_elegante').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('[correio-mural] erro ao buscar:', error.message)
    return []
  }

  const linhas = (data ?? []).filter((r) => incluirOcultos || !r.oculto)

  // Gera URLs assinadas (bucket privado) só pras fotos visíveis.
  const paths = Array.from(
    new Set(
      linhas
        .flatMap((r) => [toStoragePath(r.de_foto_url), toStoragePath(r.para_foto_url)])
        .filter(Boolean) as string[]
    )
  )
  const assinada = new Map<string, string>()
  if (paths.length) {
    const { data: signed } = await supabase.storage.from('correio').createSignedUrls(paths, FOTO_TTL)
    for (const s of signed ?? []) if (s.signedUrl && s.path) assinada.set(s.path, s.signedUrl)
  }
  const urlFoto = (v: string | null) => {
    const p = toStoragePath(v)
    return p ? assinada.get(p) ?? null : null
  }

  return linhas.map(
    (r): Correio => ({
      id: r.id,
      nome: r.nome ?? null,
      instagram: r.instagram ?? null,
      // contato (telefone) NÃO vai no payload público — revelado sob demanda via API.
      tem_contato: !!resolverContato({ contato: r.contato ?? null, instagram: r.instagram ?? null }),
      de_foto_url: urlFoto(r.de_foto_url),
      para_nome: r.para_nome ?? null,
      para_instagram: r.para_instagram ?? null,
      para_foto_url: urlFoto(r.para_foto_url),
      mensagem: r.mensagem ?? '',
      oculto: r.oculto ?? false,
      created_at: r.created_at,
    })
  )
}

export default async function CorreioMuralPage() {
  const token = process.env.CORREIO_ADMIN_TOKEN
  const admin = !!token && tokensIguais((await cookies()).get(ADMIN_COOKIE)?.value, token)

  const mensagens = await getMensagens(admin)
  return <CorreioMural mensagens={mensagens} admin={admin} />
}
