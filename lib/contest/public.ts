import 'server-only'
import { contestDb } from './db'
import { signContestPhotos } from './storage'
import type { LookCard, LookDetail } from './types'

// Ordena por votos desc, depois mais antigo primeiro (estável). Atribui rank 1-based.
function ordenar<T extends { votes: number; published_at?: string | null }>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) => b.votes - a.votes || (Date.parse(a.published_at ?? '') || 0) - (Date.parse(b.published_at ?? '') || 0)
  )
}

export async function getPublishedLooks(): Promise<LookCard[]> {
  const { data } = await contestDb().from('contest_public_leaderboard').select('*')
  const rows = ordenar((data ?? []) as { id: string; slug: string; display_name: string; city: string | null; look_title: string; main_photo_url: string | null; published_at: string | null; votes: number }[])
  const signed = await signContestPhotos(rows.map((r) => r.main_photo_url))
  return rows.map((r, i) => ({
    id: r.id,
    slug: r.slug,
    display_name: r.display_name,
    city: r.city,
    look_title: r.look_title,
    photo: r.main_photo_url ? signed.get(r.main_photo_url) ?? null : null,
    votes: r.votes,
    rank: i + 1,
    published_at: r.published_at,
  }))
}

export async function getLookBySlug(slug: string): Promise<LookDetail | null> {
  const { data: p } = await contestDb().from('contest_public_participants').select('*').eq('slug', slug).maybeSingle()
  if (!p) return null

  const all = await getPublishedLooks()
  const me = all.find((x) => x.slug === slug)
  const signed = await signContestPhotos([p.main_photo_url, p.second_photo_url])

  return {
    id: p.id,
    slug,
    display_name: p.display_name,
    city: p.city,
    look_title: p.look_title,
    look_description: p.look_description,
    instagram: p.instagram_handle,
    photo: p.main_photo_url ? signed.get(p.main_photo_url) ?? null : null,
    second_photo: p.second_photo_url ? signed.get(p.second_photo_url) ?? null : null,
    votes: me?.votes ?? 0,
    rank: me?.rank ?? 0,
    published_at: p.published_at,
    total: all.length,
  }
}

// Só a foto principal assinada (pra OG image precisamos da URL).
export async function getLookOgImage(slug: string): Promise<string | null> {
  const { data: p } = await contestDb().from('contest_public_participants').select('main_photo_url').eq('slug', slug).maybeSingle()
  if (!p?.main_photo_url) return null
  const signed = await signContestPhotos([p.main_photo_url], 60 * 60 * 24)
  return signed.get(p.main_photo_url) ?? null
}

// Contagens leves pra atualização "ao vivo" (sem PII, sem assinar fotos).
export async function getLeaderboardCounts(): Promise<{ id: string; slug: string; votes: number }[]> {
  const { data } = await contestDb().from('contest_public_leaderboard').select('id, slug, votes')
  return ordenar((data ?? []) as { id: string; slug: string; votes: number; published_at?: string | null }[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    votes: r.votes,
  }))
}
