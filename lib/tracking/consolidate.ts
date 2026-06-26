import type { WatchMetrics, Consolidated } from './types'

type GpsInput = { distance_m: number; duration_seconds: number; pace_seconds_per_km: number | null }

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number)
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

// Reconciliação determinística: relógio é ground truth pra distância/pace/FC/calorias;
// nosso GPS entra pra validar e como fallback. Calcula divergência e fator de calibração.
export function buildConsolidated(
  gps: GpsInput,
  wm: WatchMetrics | null,
  gpsElevationGain: number | null
): { consolidated: Consolidated; calibration_factor: number | null } {
  const gpsDist = gps.distance_m > 0 ? gps.distance_m : null
  const watchDist = wm?.distance_km != null ? (num(wm.distance_km) ?? 0) * 1000 : null

  const distance_m = watchDist ?? gpsDist
  const distance_source: Consolidated['distance_source'] = watchDist != null ? 'watch' : gpsDist != null ? 'gps' : null

  const watchDur = num(wm?.duration_seconds)
  const duration_seconds = watchDur ?? (gps.duration_seconds || null)
  const duration_source: Consolidated['duration_source'] = watchDur != null ? 'watch' : gps.duration_seconds ? 'gps' : null

  const watchPace = num(wm?.avg_pace_seconds_per_km)
  let pace_seconds_per_km: number | null = watchPace
  let pace_source: Consolidated['pace_source'] = watchPace != null ? 'watch' : null
  if (pace_seconds_per_km == null && distance_m && distance_m > 50 && duration_seconds) {
    pace_seconds_per_km = Math.round(duration_seconds / (distance_m / 1000))
    pace_source = 'calc'
  }
  if (pace_seconds_per_km == null && gps.pace_seconds_per_km != null) {
    pace_seconds_per_km = gps.pace_seconds_per_km
    pace_source = 'gps'
  }

  // divergência de distância GPS x relógio
  const discrepancy_distance_pct =
    watchDist != null && gpsDist != null && watchDist > 0 ? Math.round((Math.abs(gpsDist - watchDist) / watchDist) * 1000) / 10 : null

  const calibration_factor = watchDist != null && gpsDist != null && gpsDist > 200 ? Math.round((watchDist / gpsDist) * 1000) / 1000 : null

  let confidence: Consolidated['confidence'] = 'gps'
  if (discrepancy_distance_pct != null) confidence = discrepancy_distance_pct <= 3 ? 'alta' : discrepancy_distance_pct <= 8 ? 'media' : 'baixa'

  const consolidated: Consolidated = {
    distance_m,
    distance_source,
    duration_seconds,
    duration_source,
    pace_seconds_per_km,
    pace_source,
    avg_hr: num(wm?.avg_hr),
    max_hr: num(wm?.max_hr),
    calories: num(wm?.calories),
    cadence: num(wm?.cadence),
    elevation_gain_m: num(wm?.elevation_gain_m) ?? gpsElevationGain,
    discrepancy_distance_pct,
    confidence,
  }
  return { consolidated, calibration_factor }
}
