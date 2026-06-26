'use client'

export type RunnerMarker = {
  setPosition: (p: google.maps.LatLngLiteral) => void
  setMap: (m: google.maps.Map | null) => void
}

// Marcador customizado (núcleo branco + borda laranja + halo pulsante) via OverlayView.
// Precisa ser chamado depois do Google Maps carregado (usa google.maps.OverlayView).
export function createRunnerMarker(map: google.maps.Map): RunnerMarker {
  class Marker extends google.maps.OverlayView {
    div: HTMLDivElement | null = null
    pos: google.maps.LatLngLiteral | null = null

    onAdd() {
      const d = document.createElement('div')
      d.className = 'srm'
      d.innerHTML = '<div class="srm-halo"></div><div class="srm-core"></div>'
      this.div = d
      this.getPanes()?.overlayLayer.appendChild(d)
    }
    draw() {
      if (!this.div || !this.pos) return
      const proj = this.getProjection()
      if (!proj) return
      const pt = proj.fromLatLngToDivPixel(new google.maps.LatLng(this.pos))
      if (pt) {
        this.div.style.left = `${pt.x}px`
        this.div.style.top = `${pt.y}px`
      }
    }
    onRemove() {
      this.div?.remove()
      this.div = null
    }
    setPosition(p: google.maps.LatLngLiteral) {
      this.pos = p
      this.draw()
    }
  }
  const m = new Marker()
  m.setMap(map)
  return m
}
