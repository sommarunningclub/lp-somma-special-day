import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { codeFromLeadId } from '@/lib/lista-vip-code'
import { createServerClient } from '@/lib/supabase/server'

interface Lead {
  id: string
  nome: string
  email: string
  cpf: string
  telefone: string
  sexo: string
  created_at: string
}

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const supabase = createServerClient()
  const { data } = await supabase
    .from('lista_vip')
    .select('id, nome, email, cpf, telefone, sexo, created_at')
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as Lead[]
  const header = 'Nome,Email,CPF,Telefone,Sexo,Codigo VIP,Status cupom,Quantidade usos,Data expiracao,Data cadastro\n'
  const body = rows
    .map((r) =>
      [
        r.nome,
        r.email,
        r.cpf,
        r.telefone,
        r.sexo,
        codeFromLeadId(r.id),
        'ativo',
        0,
        '',
        new Date(r.created_at).toLocaleString('pt-BR'),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n')

  return new NextResponse(header + body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="vip-leads.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
