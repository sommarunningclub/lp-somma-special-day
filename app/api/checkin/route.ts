import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
export const runtime = 'nodejs'

// Client com fetch no-store (dedupe precisa enxergar check-ins recentes).
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
  }
)

/**
 * Grava o check-in na tabela compartilhada `checkins` (mesmo Supabase da gestão).
 * Mesma lógica/colunas do /api/checkin do site público — o registro aparece no
 * painel da gestão (módulo Check-in + contador do evento).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome_completo, email, telefone, cpf, sexo, pelotao, data_do_evento, nome_do_evento, evento_id } = body

    if (!nome_completo || !email || !telefone || !cpf || !sexo) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    // Dedupe: 1 CPF por evento.
    if (evento_id) {
      const cpfLimpo = String(cpf).replace(/\D/g, '')
      const { data: existing } = await supabase
        .from('checkins')
        .select('id')
        .eq('evento_id', evento_id)
        .or(`cpf.eq.${cpfLimpo},cpf.eq.${cpf}`)
        .limit(1)

      if (existing && existing.length > 0) {
        return NextResponse.json(
          { error: 'Você já fez check-in neste evento. Cada CPF pode ser cadastrado apenas uma vez por evento.' },
          { status: 409 }
        )
      }
    }

    const { data, error } = await supabase
      .from('checkins')
      .insert([
        {
          nome_completo,
          email,
          telefone,
          cpf,
          sexo,
          pelotao: pelotao || null,
          data_do_evento: data_do_evento || '',
          nome_do_evento: nome_do_evento || '',
          evento_id: evento_id || null,
          data_hora_checkin: new Date().toISOString(),
          validacao_do_checkin: false,
        },
      ])
      .select()

    if (error) {
      console.error('[esquenta-checkin] erro ao inserir:', error.message)
      return NextResponse.json({ error: `Erro ao salvar check-in: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
