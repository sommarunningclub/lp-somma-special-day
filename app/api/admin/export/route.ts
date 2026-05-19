import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

interface Lead {
  nome: string
  email: string
  cpf: string
  telefone: string
  created_at: string
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createServerClient()
  const { data } = await supabase
    .from('vip_leads')
    .select('nome, email, cpf, telefone, created_at')
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as Lead[]
  const header = 'Nome,Email,CPF,Telefone,Data\n'
  const body = rows
    .map((r) =>
      [r.nome, r.email, r.cpf, r.telefone, new Date(r.created_at).toLocaleString('pt-BR')]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n')

  return new NextResponse(header + body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="vip-leads.csv"',
    },
  })
}
