import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import PropostaView from '@/components/proposta/PropostaView'
import SmoothScroll from '@/components/SmoothScroll'
import type { Proposta } from '@/lib/types/proposta'

export const dynamic = 'force-dynamic'

async function getProposta(slug: string): Promise<Proposta | null> {
  const supabase = createServerClient()
  const { data } = await supabase.from('propostas').select('*').eq('slug', slug).maybeSingle()
  return (data as Proposta | null) ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const proposta = await getProposta(slug)
  if (!proposta) return { title: 'Proposta não encontrada' }
  return {
    title: `Proposta · ${proposta.cliente_nome} — Somma Special Day 2026`,
    description: 'Proposta comercial de patrocínio do Somma Special Day 2026.',
    robots: { index: false, follow: false },
  }
}

export default async function PropostaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const proposta = await getProposta(slug)
  if (!proposta) notFound()

  // Expirou?
  if (proposta.validade) {
    const validade = new Date(proposta.validade + 'T23:59:59')
    if (validade < new Date()) notFound()
  }

  return (
    <SmoothScroll>
      <PropostaView proposta={proposta} />
    </SmoothScroll>
  )
}
