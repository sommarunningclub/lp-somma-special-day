import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { contestDb } from '@/lib/contest/db'
import { registroSchema, edicaoSchema } from '@/lib/contest/schemas'
import { hashCpf, hashOpaque } from '@/lib/contest/cpf-hash'
import { getContestSettings, inscricaoAberta } from '@/lib/contest/settings'
import { uploadContestPhoto, removeContestPhotos } from '@/lib/contest/storage'
import { getParticipantId, setParticipantSession } from '@/lib/contest/session'
import { sendAccessCode } from '@/lib/contest/email'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

function slugify(s: string): string {
  return (
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'look'
  )
}
const isDataImg = (v: unknown): v is string => typeof v === 'string' && /^data:image\/(jpeg|png|webp);base64,/i.test(v)

// POST: cria inscrição (draft) + sobe fotos + gera OTP + loga (cookie).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Honeypot anti-bot: campo invisível precisa vir vazio.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ error: 'Não foi possível concluir.' }, { status: 400 })
    }

    const settings = await getContestSettings()
    if (!inscricaoAberta(settings)) {
      return NextResponse.json({ error: 'As inscrições não estão abertas no momento.' }, { status: 403 })
    }

    const parsed = registroSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 })
    }
    const d = parsed.data

    const fotos: string[] = Array.isArray(body.fotos) ? body.fotos.filter(isDataImg) : []
    const maxFotos = settings?.max_photos ?? 2
    if (fotos.length < 1) return NextResponse.json({ error: 'Envie pelo menos uma foto do look.' }, { status: 400 })
    if (fotos.length > maxFotos) return NextResponse.json({ error: `Máximo de ${maxFotos} fotos.` }, { status: 400 })

    const cpf_hash = hashCpf(d.cpf)
    const slug = `${slugify(d.display_name)}-${randomUUID().slice(0, 6)}`
    const db = contestDb()

    const { data: inserted, error: insErr } = await db
      .from('contest_participants')
      .insert([
        {
          full_name: d.full_name,
          display_name: d.display_name,
          email: d.email.toLowerCase(),
          whatsapp: d.whatsapp,
          cpf_hash,
          instagram_handle: d.instagram ? d.instagram.replace(/^@+/, '') : null,
          city: d.city || null,
          look_title: d.look_title,
          look_description: d.look_description || null,
          status: 'draft',
          slug,
        },
      ])
      .select('id')
      .single()

    if (insErr) {
      if (insErr.code === '23505' && /uq_cp_cpf_active/.test(insErr.message)) {
        return NextResponse.json(
          { error: 'Já existe uma inscrição com esse CPF. Acesse sua área pelo seu e-mail.', code: 'cpf_exists' },
          { status: 409 }
        )
      }
      console.error('[concurso-inscricao] insert:', insErr.message)
      return NextResponse.json({ error: 'Não foi possível criar a inscrição.' }, { status: 500 })
    }

    const id = inserted!.id as string
    let mainPath: string | null = null
    let secondPath: string | null = null
    try {
      mainPath = await uploadContestPhoto(fotos[0], id, 'main')
      if (fotos[1]) secondPath = await uploadContestPhoto(fotos[1], id, 'second')
    } catch (e) {
      await removeContestPhotos([mainPath, secondPath])
      await db.from('contest_participants').delete().eq('id', id)
      return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro ao enviar as fotos.' }, { status: 400 })
    }

    await db.from('contest_participants').update({ main_photo_url: mainPath, second_photo_url: secondPath }).eq('id', id)

    // OTP de acesso (best effort) + sessão.
    try {
      const code = String(Math.floor(100000 + Math.random() * 900000))
      await db
        .from('contest_participants')
        .update({ access_code_hash: hashOpaque(code), access_code_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() })
        .eq('id', id)
      await sendAccessCode(d.email.toLowerCase(), code, d.display_name)
    } catch (e) {
      console.error('[concurso-inscricao] OTP:', e)
    }

    await setParticipantSession(id)
    return NextResponse.json({ ok: true, id, slug }, { status: 201 })
  } catch (e) {
    console.error('[concurso-inscricao] erro:', e)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

// PATCH: edita a própria inscrição (sessão). Aceita troca de fotos.
export async function PATCH(request: NextRequest) {
  const id = await getParticipantId()
  if (!id) return NextResponse.json({ error: 'Sessão expirada.' }, { status: 401 })

  const settings = await getContestSettings()
  if (!inscricaoAberta(settings)) {
    return NextResponse.json({ error: 'O período de edição está fechado.' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = edicaoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 })
  }
  const d = parsed.data
  const db = contestDb()

  const { data: atual } = await db
    .from('contest_participants')
    .select('id, main_photo_url, second_photo_url, status')
    .eq('id', id)
    .maybeSingle()
  if (!atual) return NextResponse.json({ error: 'Inscrição não encontrada.' }, { status: 404 })

  const update: Record<string, unknown> = {
    display_name: d.display_name,
    instagram_handle: d.instagram ? d.instagram.replace(/^@+/, '') : null,
    city: d.city || null,
    look_title: d.look_title,
    look_description: d.look_description || null,
  }

  try {
    if (isDataImg(body.main_foto)) {
      const novo = await uploadContestPhoto(body.main_foto, id, 'main')
      await removeContestPhotos([atual.main_photo_url])
      update.main_photo_url = novo
    }
    if (isDataImg(body.second_foto)) {
      const novo = await uploadContestPhoto(body.second_foto, id, 'second')
      await removeContestPhotos([atual.second_photo_url])
      update.second_photo_url = novo
    } else if (body.remove_second === true) {
      await removeContestPhotos([atual.second_photo_url])
      update.second_photo_url = null
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro ao atualizar a foto.' }, { status: 400 })
  }

  const { error } = await db.from('contest_participants').update(update).eq('id', id)
  if (error) {
    console.error('[concurso-inscricao] patch:', error.message)
    return NextResponse.json({ error: 'Não foi possível salvar.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

// DELETE: exclui a própria inscrição + fotos (sessão).
export async function DELETE() {
  const id = await getParticipantId()
  if (!id) return NextResponse.json({ error: 'Sessão expirada.' }, { status: 401 })

  const settings = await getContestSettings()
  if (!inscricaoAberta(settings)) {
    return NextResponse.json({ error: 'O período de alterações está fechado.' }, { status: 403 })
  }

  const db = contestDb()
  const { data: row } = await db.from('contest_participants').select('main_photo_url, second_photo_url').eq('id', id).maybeSingle()
  await removeContestPhotos([row?.main_photo_url, row?.second_photo_url])
  const { error } = await db.from('contest_participants').delete().eq('id', id)
  if (error) {
    console.error('[concurso-inscricao] delete:', error.message)
    return NextResponse.json({ error: 'Não foi possível excluir.' }, { status: 500 })
  }
  const { clearParticipantSession } = await import('@/lib/contest/session')
  await clearParticipantSession()
  return NextResponse.json({ ok: true })
}
