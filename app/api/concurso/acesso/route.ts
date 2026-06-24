import { NextRequest, NextResponse } from 'next/server'
import { contestDb } from '@/lib/contest/db'
import { acessoSchema } from '@/lib/contest/schemas'
import { hashOpaque } from '@/lib/contest/cpf-hash'
import { sendAccessCode } from '@/lib/contest/email'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// POST { email } — envia código de acesso. Resposta sempre genérica (não revela se existe).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ ok: true })
    }
    const parsed = acessoSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })

    const email = parsed.data.email.toLowerCase()
    const db = contestDb()
    const { data: p } = await db
      .from('contest_participants')
      .select('id, display_name, access_code_expires_at, status')
      .eq('email', email)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (p) {
      // throttle: não reemite se o código atual foi gerado há menos de 60s.
      const recente = p.access_code_expires_at && Date.parse(p.access_code_expires_at) - Date.now() > 14 * 60 * 1000
      if (!recente) {
        const code = String(Math.floor(100000 + Math.random() * 900000))
        await db
          .from('contest_participants')
          .update({ access_code_hash: hashOpaque(code), access_code_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() })
          .eq('id', p.id)
        await sendAccessCode(email, code, p.display_name)
      }
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
