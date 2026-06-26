import { getDistance } from 'geolib'

type RawPoint = { latitude: number | string; longitude: number | string; altitude_m?: number | string | null; captured_at: string }
export type Split = { km: number; seconds: number; pace: number; partial?: boolean; fraction?: number }

// Splits por km com interpolação de tempo na virada de quilômetro.
export function computeSplits(points: RawPoint[]): Split[] {
  const pts = points
    .map((p) => ({ lat: Number(p.latitude), lng: Number(p.longitude), t: Date.parse(p.captured_at) }))
    .filter((p) => Number.isFinite(p.t))
    .sort((a, b) => a.t - b.t)
  if (pts.length < 2) return []

  const splits: Split[] = []
  let acc = 0
  let kmStartT = pts[0].t
  let kmIndex = 1
  for (let i = 1; i < pts.length; i++) {
    const d = getDistance({ latitude: pts[i - 1].lat, longitude: pts[i - 1].lng }, { latitude: pts[i].lat, longitude: pts[i].lng })
    acc += d
    while (acc >= kmIndex * 1000) {
      const over = acc - kmIndex * 1000
      const segFrac = d > 0 ? (d - over) / d : 1
      const tBoundary = pts[i - 1].t + (pts[i].t - pts[i - 1].t) * segFrac
      const seconds = Math.max(1, Math.round((tBoundary - kmStartT) / 1000))
      splits.push({ km: kmIndex, seconds, pace: seconds })
      kmStartT = tBoundary
      kmIndex++
    }
  }
  const remaining = acc - (kmIndex - 1) * 1000
  if (remaining > 60) {
    const seconds = Math.max(1, Math.round((pts[pts.length - 1].t - kmStartT) / 1000))
    const frac = remaining / 1000
    splits.push({ km: kmIndex, seconds, pace: Math.round(seconds / frac), partial: true, fraction: Math.round(frac * 100) / 100 })
  }
  return splits
}

export function computeElevation(points: RawPoint[]): { gain: number; series: number[]; hasData: boolean } {
  const series = points.map((p) => (p.altitude_m == null ? null : Number(p.altitude_m))).filter((a): a is number => a != null && Number.isFinite(a))
  let gain = 0
  for (let i = 1; i < series.length; i++) {
    const d = series[i] - series[i - 1]
    if (d > 0.5) gain += d
  }
  const step = Math.max(1, Math.floor(series.length / 40))
  const ds = series.filter((_, i) => i % step === 0)
  return { gain: Math.round(gain), series: ds, hasData: series.length > 1 }
}
