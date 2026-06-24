import 'server-only'
import { contestDb } from './db'
import { getParticipantId } from './session'
import { signContestPhotos } from './storage'
import type { ParticipantWithSigned } from './types'

// Carrega a inscrição do participante logado (sessão), com fotos assinadas.
export async function getMyParticipant(): Promise<ParticipantWithSigned | null> {
  const id = await getParticipantId()
  if (!id) return null

  const { data } = await contestDb()
    .from('contest_participants')
    .select(
      'id, full_name, display_name, email, whatsapp, instagram_handle, city, look_title, look_description, main_photo_url, second_photo_url, status, slug, published_at, created_at, updated_at'
    )
    .eq('id', id)
    .maybeSingle()

  if (!data || data.status === 'deleted') return null

  const signed = await signContestPhotos([data.main_photo_url, data.second_photo_url])
  return {
    ...(data as ParticipantWithSigned),
    main_photo_signed: data.main_photo_url ? signed.get(data.main_photo_url) ?? null : null,
    second_photo_signed: data.second_photo_url ? signed.get(data.second_photo_url) ?? null : null,
  }
}
