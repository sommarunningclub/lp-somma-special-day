import { getDistance } from 'geolib'
import {
  TRACKING_MAX_ACCURACY_METERS,
  TRACKING_MAX_SPEED_MPS,
  TRACKING_DEDUPE_MIN_METERS,
  TRACKING_DEDUPE_MIN_SECONDS,
} from './constants'
import type { PointInput } from './schemas'

export type Anchor = { lat: number; lng: number; at: number } | null

export type ProcessedRow = {
  p: PointInput
  at: number
  is_valid: boolean
  rejection_reason: string | null
}

export type ProcessResult = {
  rows: ProcessedRow[]
  anchor: Anchor
  addedDistance: number
  latest: { lat: number; lng: number; accuracy: number | null; at: number } | null
}

// Valida pontos em ordem cronológica e acumula distância só entre pontos válidos.
export function processPoints(incoming: PointInput[], anchorIn: Anchor): ProcessResult {
  const sorted = [...incoming].sort((a, b) => Date.parse(a.captured_at) - Date.parse(b.captured_at))
  let anchor: Anchor = anchorIn
  let added = 0
  let latest: ProcessResult['latest'] = null
  const rows: ProcessedRow[] = []

  for (const p of sorted) {
    const at = Date.parse(p.captured_at)
    let valid = true
    let reason: string | null = null

    if (!Number.isFinite(at)) {
      valid = false
      reason = 'invalid_timestamp'
    } else if (p.accuracy != null && p.accuracy > TRACKING_MAX_ACCURACY_METERS) {
      valid = false
      reason = 'low_accuracy'
    } else if (anchor) {
      const dist = getDistance({ latitude: anchor.lat, longitude: anchor.lng }, { latitude: p.lat, longitude: p.lng })
      const dt = (at - anchor.at) / 1000
      if (dt <= 0) {
        if (dist < TRACKING_DEDUPE_MIN_METERS) {
          valid = false
          reason = 'duplicate'
        }
      } else {
        const speed = dist / dt
        if (speed > TRACKING_MAX_SPEED_MPS) {
          valid = false
          reason = 'impossible_jump'
        } else if (dist < TRACKING_DEDUPE_MIN_METERS && dt < TRACKING_DEDUPE_MIN_SECONDS) {
          valid = false
          reason = 'duplicate'
        }
      }
      if (valid) {
        added += dist
        anchor = { lat: p.lat, lng: p.lng, at }
        latest = { lat: p.lat, lng: p.lng, accuracy: p.accuracy ?? null, at }
      }
    } else {
      // primeiro ponto válido: vira a âncora, sem somar distância
      anchor = { lat: p.lat, lng: p.lng, at }
      latest = { lat: p.lat, lng: p.lng, accuracy: p.accuracy ?? null, at }
    }

    rows.push({ p, at, is_valid: valid, rejection_reason: reason })
  }

  return { rows, anchor, addedDistance: added, latest }
}

export function paceSecondsPerKm(distanceM: number, durationSeconds: number): number | null {
  if (distanceM < 20 || durationSeconds <= 0) return null
  return Math.round(durationSeconds / (distanceM / 1000))
}
