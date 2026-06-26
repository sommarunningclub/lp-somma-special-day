import 'server-only'
import { trackingDb } from './db'
import { hashTrackingToken } from './token'

export async function findSessionByToken(token: string) {
  const { data } = await trackingDb()
    .from('gps_tracking_sessions')
    .select('*')
    .eq('tracking_token_hash', hashTrackingToken(token))
    .maybeSingle()
  return data
}

// Campos seguros pra devolver ao cliente (nunca o hash do token).
export function publicSession(s: Record<string, unknown>) {
  if (!s) return null
  const { tracking_token_hash, ...rest } = s
  void tracking_token_hash
  return rest
}

const num = (v: unknown): number | null => (v == null ? null : Number(v))

// Normaliza a linha do banco para o tipo client-safe TrackSession (numéricos coeridos).
export function toTrackSession(s: Record<string, unknown>) {
  return {
    id: s.id as string,
    participant_name: s.participant_name as string,
    activity_type: (s.activity_type as string) ?? 'rua',
    watch_metrics: (s.watch_metrics as Record<string, unknown>) ?? null,
    ai_report: (s.ai_report as string) ?? null,
    reference_location_name: (s.reference_location_name as string) ?? null,
    reference_lat: num(s.reference_lat),
    reference_lng: num(s.reference_lng),
    planned_route_polyline: (s.planned_route_polyline as string) ?? null,
    status: s.status as string,
    started_at: (s.started_at as string) ?? null,
    paused_at: (s.paused_at as string) ?? null,
    finished_at: (s.finished_at as string) ?? null,
    total_distance_m: Number(s.total_distance_m ?? 0),
    total_duration_seconds: Number(s.total_duration_seconds ?? 0),
    average_pace_seconds_per_km: num(s.average_pace_seconds_per_km),
    latest_lat: num(s.latest_lat),
    latest_lng: num(s.latest_lng),
    latest_accuracy_m: num(s.latest_accuracy_m),
    last_point_at: (s.last_point_at as string) ?? null,
    created_at: s.created_at as string,
    updated_at: s.updated_at as string,
  }
}
