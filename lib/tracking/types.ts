// Tipos client-safe (sem segredos).
export type WatchMetrics = {
  distance_km?: number | null
  duration?: string | null
  duration_seconds?: number | null
  avg_pace?: string | null
  avg_pace_seconds_per_km?: number | null
  avg_hr?: number | null
  max_hr?: number | null
  calories?: number | null
  elevation_gain_m?: number | null
  cadence?: number | null
  device?: string | null
  raw_text?: string | null
}

export type Consolidated = {
  distance_m: number | null
  distance_source: 'watch' | 'gps' | null
  duration_seconds: number | null
  duration_source: 'watch' | 'gps' | null
  pace_seconds_per_km: number | null
  pace_source: 'watch' | 'gps' | 'calc' | null
  avg_hr: number | null
  max_hr: number | null
  calories: number | null
  cadence: number | null
  elevation_gain_m: number | null
  discrepancy_distance_pct: number | null
  confidence: 'alta' | 'media' | 'baixa' | 'gps'
}

export type TrackSession = {
  id: string
  participant_name: string
  activity_type: 'rua' | 'esteira' | 'caminhada'
  watch_photo_signed?: string | null
  watch_metrics?: WatchMetrics | null
  consolidated?: Consolidated | null
  calibration_factor?: number | null
  ai_report?: string | null
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
  accuracy_m?: number | null
  altitude_m?: number | null
  captured_at: string
  speed_mps?: number | null
  is_valid?: boolean
  rejection_reason?: string | null
}
