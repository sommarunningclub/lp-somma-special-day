'use client'

import { useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { ESQUENTA } from '@/lib/esquenta-constants'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// Estilo do mapa alinhado à identidade SOMMA (creme/preto/laranja, alto contraste).
const SOMMA_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#F9F0DC' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F9F0DC' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#0a0a0a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#0a0a0a' }, { weight: 0.6 }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#E7E0C7' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E2D8BD' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#FDB716' }, { lightness: 55 }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#005EFF' }] },
]

export default function EsquentaMap() {
  const ref = useRef<HTMLDivElement>(null)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setErro(true)
      return
    }
    let cancelled = false

    ;(async () => {
      try {
        setOptions({ key: GOOGLE_MAPS_API_KEY, v: 'weekly' })
        const { Map } = await importLibrary('maps')
        if (cancelled || !ref.current) return

        const center = { lat: ESQUENTA.coords.lat, lng: ESQUENTA.coords.lng }
        const map = new Map(ref.current, {
          center,
          zoom: 16,
          styles: SOMMA_MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
          backgroundColor: '#F9F0DC',
        })

        // Marcador pino SOMMA (SVG laranja).
        new google.maps.Marker({
          position: center,
          map,
          title: `Esquenta Somma Special Day · ${ESQUENTA.local}`,
          icon: {
            path: 'M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z',
            fillColor: '#FF4800',
            fillOpacity: 1,
            strokeColor: '#0a0a0a',
            strokeWeight: 2,
            scale: 1.6,
            anchor: new google.maps.Point(12, 36),
            labelOrigin: new google.maps.Point(12, 12),
          },
          label: { text: '★', color: '#FFFFFF', fontSize: '14px', fontWeight: 'bold' },
        })

        // Círculo de destaque do ponto de encontro.
        new google.maps.Circle({
          map,
          center,
          radius: 90,
          strokeColor: '#FF4800',
          strokeOpacity: 0.5,
          strokeWeight: 1.5,
          fillColor: '#FF4800',
          fillOpacity: 0.08,
        })
      } catch {
        if (!cancelled) setErro(true)
      }
    })()

    return () => { cancelled = true }
  }, [])

  if (erro) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-somma-black/5 text-center">
        <p className="font-bebas text-2xl uppercase tracking-wide text-somma-black">Entre 106 e 107 Sul · Brasília DF</p>
        <a href={ESQUENTA.maps.abrirNoMaps} target="_blank" rel="noopener noreferrer" className="mt-2 font-dm text-sm font-bold text-somma-orange underline-offset-2 hover:underline">
          Abrir no Google Maps
        </a>
      </div>
    )
  }

  return <div ref={ref} className="h-full w-full" aria-label="Mapa do local do evento, entre a 106 e 107 Sul, Brasília DF" role="img" />
}
