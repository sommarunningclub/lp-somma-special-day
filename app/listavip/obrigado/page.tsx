import type { Metadata } from 'next'
import FormSuccess from '@/components/special-day/FormSuccess'
import { codeFromLeadId } from '@/lib/lista-vip-code'
import { createServerClient } from '@/lib/supabase/server'

type ObrigadoPageProps = {
  searchParams?: {
    codigo?: string
  }
}

type ListaVipObrigadoLead = {
  id: string
  nome: string
  email: string
  codigo_unico?: string | null
}

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Obrigado — Lista VIP Somma Special Day',
  description: 'Seu código VIP para a pré-venda do Somma Special Day foi gerado.',
}

export default async function ObrigadoPage({ searchParams }: ObrigadoPageProps) {
  const codigo = searchParams?.codigo?.trim().toUpperCase()

  let lead: ListaVipObrigadoLead | null = null

  if (codigo?.startsWith('VIP') && codigo.length > 3) {
    const supabase = createServerClient()

    const { data: leadByStoredCode } = await supabase
      .from('lista_vip')
      .select('id, nome, email, codigo_unico')
      .eq('codigo_unico', codigo)
      .limit(1)
      .maybeSingle()

    if (leadByStoredCode) {
      lead = leadByStoredCode as ListaVipObrigadoLead
    }

    const { data } = await supabase
      .from('lista_vip')
      .select('id, nome, email')
      .order('created_at', { ascending: false })
      .limit(5000)

    lead = lead ?? ((data ?? []) as ListaVipObrigadoLead[]).find((item) => codeFromLeadId(item.id) === codigo) ?? null
  }

  return (
    <main className="min-h-screen bg-somma-blue">
      <FormSuccess
        userData={{
          nome: lead?.nome ?? 'Cadastro VIP',
          email: lead?.email ?? 'codigo confirmado',
          codigoUnico: lead?.codigo_unico ?? (lead ? codeFromLeadId(lead.id) : codigo ?? 'VIP'),
        }}
      />
    </main>
  )
}
