// Tipos client-safe (sem segredos).
export type TrackSession = {
  id: string
  participant_name: string
  reference_location_name: string | null
  reference_lat: number | null
  reference_lng: number | null
  planned_route_polyline: string | null
  status: 'created' | 'running' | 'paused' | 'finished' | 'cancelled'
  started_at: string | null
  paused_at: string | null
  finished_at: string | null
  total_distance_m: number
  total_duration_seconds: number
  average_pace_seconds_per_km: number | null
  latest_lat: number | null
  latest_lng: number | null
  latest_accuracy_m: number | null
  last_point_at: string | null
  created_at: string
  updated_at: string
}

export type TrackPoint = {
  latitude: number
  longitude: number
  accuracy_m: number | null
  captured_at: string
  speed_mps?: number | null
  is_valid?: boolean
  rejection_reason?: string | null
}
