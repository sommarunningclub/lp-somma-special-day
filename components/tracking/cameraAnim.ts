'use client'

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

// Anima a câmera (centro + zoom) com easeInOutCubic via requestAnimationFrame.
// Retorna uma função pra cancelar. Respeita prefers-reduced-motion (salto curto).
export function animateMapTo(
  map: google.maps.Map,
  target: { lat: number; lng: number; zoom: number },
  durationMs: number,
  onDone?: () => void
): () => void {
  const start = map.getCenter()
  const sLat = start?.lat() ?? target.lat
  const sLng = start?.lng() ?? target.lng
  const sZoom = map.getZoom() ?? 12

  if (prefersReducedMotion() || durationMs <= 0) {
    map.moveCamera({ center: { lat: target.lat, lng: target.lng }, zoom: target.zoom })
    onDone?.()
    return () => {}
  }

  let raf = 0
  let cancelled = false
  const t0 = performance.now()
  const tick = (now: number) => {
    if (cancelled) return
    const p = Math.min(1, (now - t0) / durationMs)
    const e = easeInOutCubic(p)
    map.moveCamera({
      center: { lat: sLat + (target.lat - sLat) * e, lng: sLng + (target.lng - sLng) * e },
      zoom: sZoom + (target.zoom - sZoom) * e,
    })
    if (p < 1) raf = requestAnimationFrame(tick)
    else onDone?.()
  }
  raf = requestAnimationFrame(tick)
  return () => {
    cancelled = true
    cancelAnimationFrame(raf)
  }
}
