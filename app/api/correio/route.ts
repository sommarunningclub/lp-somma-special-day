import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) },
  }
)

// Salva uma mensagem do Correio Elegante na tabela `correio_elegante`.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const nome = String(body.nome ?? '').trim()
    const instagram = String(body.instagram ?? '').trim()
    const mensagem = String(body.mensagem ?? '').trim()
    const contato = String(body.contato ?? '').trim()
    const origem = body.origem === 'evento' ? 'evento' : 'site'

    if (!nome || !instagram || !mensagem) {
      return NextResponse.json({ error: 'Preencha nome, Instagram e mensagem.' }, { status: 400 })
    }

    const { error } = await supabase.from('correio_elegante').insert([
      {
        nome,
        instagram: instagram.replace(/^@+/, '').trim(),
        mensagem,
        contato: contato || null,
        origem,
      },
    ])

    if (error) {
      console.error('[correio] erro ao inserir:', error.message)
      // Tabela ainda não criada → mensagem amigável.
      if (/relation .*correio_elegante.* does not exist/i.test(error.message)) {
        return NextResponse.json({ error: 'Correio ainda não está ativo. Tente mais tarde.' }, { status: 503 })
      }
      return NextResponse.json({ error: 'Não foi possível enviar agora.' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
