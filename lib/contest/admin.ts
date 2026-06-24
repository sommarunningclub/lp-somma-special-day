import 'server-only'
import { contestDb } from './db'
import { signContestPhotos } from './storage'
import type { AdminParticipant } from './types'

// Todos os participantes (menos deletados) com votos e fotos assinadas. SEM CPF.
export async function getAllParticipantsAdmin(): Promise<AdminParticipant[]> {
  const db = contestDb()
  const { data: parts } = await db
    .from('contest_participants')
    .select(
      'id, full_name, display_name, email, whatsapp, instagram_handle, city, look_title, look_description, main_photo_url, second_photo_url, status, slug, published_at, created_at'
    )
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  const rows = parts ?? []
  const { data: votes } = await db.from('contest_votes').select('participant_id')
  const counts = new Map<string, number>()
  for (const v of votes ?? []) counts.set(v.participant_id, (counts.get(v.participant_id) ?? 0) + 1)

  const signed = await signContestPhotos(rows.flatMap((r) => [r.main_photo_url, r.second_photo_url]))

  return rows.map((r) => ({
    id: r.id,
    full_name: r.full_name,
    display_name: r.display_name,
    email: r.email,
    whatsapp: r.whatsapp,
    instagram_handle: r.instagram_handle,
    city: r.city,
    look_title: r.look_title,
    look_description: r.look_description,
    status: r.status,
    slug: r.slug,
    published_at: r.published_at,
    created_at: r.created_at,
    votes: counts.get(r.id) ?? 0,
    main_photo_signed: r.main_photo_url ? signed.get(r.main_photo_url) ?? null : null,
    second_photo_signed: r.second_photo_url ? signed.get(r.second_photo_url) ?? null : null,
  }))
}

export async function logAudit(action: string, targetType: string, targetId: string, metadata?: Record<string, unknown>): Promise<void> {
  try {
    await contestDb().from('contest_admin_audit_logs').insert({ admin_user_id: 'admin', action, target_type: targetType, target_id: targetId, metadata: metadata ?? null })
  } catch (e) {
    console.error('[audit] falha:', e)
  }
}
