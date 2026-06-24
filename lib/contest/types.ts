export type ContestStatus = 'draft' | 'published' | 'hidden' | 'disqualified' | 'deleted'

export type ContestSettings = {
  id: number
  contest_name: string
  is_registration_open: boolean
  is_voting_open: boolean
  registration_starts_at: string | null
  registration_ends_at: string | null
  voting_starts_at: string | null
  voting_ends_at: string | null
  prize_title: string
  rules_content: string
  max_photos: number
  show_vote_count_publicly: boolean
  is_active: boolean
}

// Visão completa (área privada / admin). NUNCA expor cpf.
export type Participant = {
  id: string
  full_name: string
  display_name: string
  email: string
  whatsapp: string | null
  instagram_handle: string | null
  city: string | null
  look_title: string
  look_description: string | null
  main_photo_url: string | null // path
  second_photo_url: string | null // path
  status: ContestStatus
  slug: string
  published_at: string | null
  created_at: string
  updated_at: string
}

// Versão pra UI privada com fotos já assinadas.
export type ParticipantWithSigned = Participant & {
  main_photo_signed: string | null
  second_photo_signed: string | null
}

export type LeaderboardRow = {
  id: string
  slug: string
  display_name: string
  city: string | null
  look_title: string
  main_photo_signed: string | null
  votes: number
}

// Tipos de UI pública (client-safe).
export type LookCard = {
  id: string
  slug: string
  display_name: string
  city: string | null
  look_title: string
  photo: string | null // signed
  votes: number
  rank: number
  published_at: string | null
}

export type LookDetail = LookCard & {
  look_description: string | null
  instagram: string | null
  second_photo: string | null // signed
  total: number
}
