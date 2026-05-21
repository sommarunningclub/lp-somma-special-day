'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import FloatingElement from './FloatingElement'
import {
  PERCURSO_PATH,
  PERCURSO_START,
  PERCURSO_FINISH,
  PERCURSO_TURN,
} from '@/lib/percurso-path'

gsap.registerPlugin(ScrollTrigger)

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
// Map ID Vector (Google Cloud Console). Quando definido, libera 3D real (predios + rotacao suave).
const GOOGLE_MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID
const HAS_VECTOR = Boolean(GOOGLE_MAP_ID)

// Estilo do mapa adaptado a identidade Somma (creme/azul, alto contraste)
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
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#F9F0DC' }] },
]

const STATS = [
  { value: '4,2', unit: 'KM', label: 'Distancia total' },
  { value: '+18', unit: 'M', label: 'Ganho de elevacao' },
  { value: '100%', unit: '', label: 'Asfalto e vista pro lago' },
]

type ViewMode = 'mapa' | 'satelite'
type LatLngLit = { lat: number; lng: number }
type PathProfile = { path: LatLngLit[]; cumulative: number[]; total: number }

const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)
const lerpPoint = (a: LatLngLit, b: LatLngLit, k: number): LatLngLit => ({
  lat: lerp(a.lat, b.lat, k),
  lng: lerp(a.lng, b.lng, k),
})

// Perfil de distancia acumulada do traçado (para interpolar posicao por metro)
function buildProfile(google: typeof window.google, path: LatLngLit[]): PathProfile {
  const cumulative = [0]
  let total = 0
  for (let i = 1; i < path.length; i++) {
    total += google.maps.geometry.spherical.computeDistanceBetween(path[i - 1], path[i])
    cumulative.push(total)
  }
  return { path, cumulative, total }
}

// Posicao a `dist` metros do inicio do traçado
function pointAt(google: typeof window.google, profile: PathProfile, dist: number): LatLngLit {
  const d = Math.max(0, Math.min(dist, profile.total))
  for (let i = 1; i < profile.path.length; i++) {
    if (profile.cumulative[i] >= d) {
      const segLen = profile.cumulative[i] - profile.cumulative[i - 1]
      const frac = segLen ? (d - profile.cumulative[i - 1]) / segLen : 0
      const p = google.maps.geometry.spherical.interpolate(profile.path[i - 1], profile.path[i], frac)
      return { lat: p.lat(), lng: p.lng() }
    }
  }
  return profile.path[profile.path.length - 1]
}

// Sub-traçado do inicio ate `dist` metros (para a linha de progresso)
function segmentTo(google: typeof window.google, profile: PathProfile, dist: number): LatLngLit[] {
  const d = Math.max(0, Math.min(dist, profile.total))
  const pts: LatLngLit[] = [profile.path[0]]
  for (let i = 1; i < profile.path.length; i++) {
    if (profile.cumulative[i] < d) pts.push(profile.path[i])
    else break
  }
  pts.push(pointAt(google, profile, d))
  return pts
}

export default function RouteSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const mapElRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const boundsRef = useRef<google.maps.LatLngBounds | null>(null)
  const profileRef = useRef<PathProfile | null>(null)
  const progressLineRef = useRef<google.maps.Polyline | null>(null)
  const runnerRef = useRef<google.maps.Marker | null>(null)
  const tourRafRef = useRef(0)
  const tourActiveRef = useRef(false)
  const [mapError, setMapError] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [view, setView] = useState<ViewMode>('mapa')
  const [is3D, setIs3D] = useState(false)
  const [isTouring, setIsTouring] = useState(false)
  const [tourLabel, setTourLabel] = useState('')

  // Inicializa o mapa do Google com o traçado real do percurso
  useEffect(() => {
    if (!mapElRef.current) return
    if (!GOOGLE_MAPS_API_KEY) {
      setMapError(true)
      return
    }

    let cancelled = false
    let dashOffset = 0
    let pulse = 0
    let rafId = 0

    async function initMap() {
      try {
        setOptions({ key: GOOGLE_MAPS_API_KEY as string, v: 'weekly' })
        await importLibrary('maps')
        await importLibrary('geometry')
        const google = window.google
        if (cancelled || !mapElRef.current) return

        const bounds = new google.maps.LatLngBounds()
        PERCURSO_PATH.forEach((p) => bounds.extend(p))
        boundsRef.current = bounds

        const map = new google.maps.Map(mapElRef.current, {
          center: bounds.getCenter(),
          zoom: 14,
          minZoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          rotateControl: true,
          gestureHandling: 'greedy',
          backgroundColor: '#F9F0DC',
          mapTypeId: 'roadmap',
          // Mapa vetorial (mapId) habilita tilt/rotacao 3D em qualquer lugar.
          // Sem mapId, aplicamos o estilo Somma inline (mapa raster).
          ...(HAS_VECTOR ? { mapId: GOOGLE_MAP_ID } : { styles: SOMMA_MAP_STYLES }),
          tilt: 0,
        })
        map.fitBounds(bounds, 56)
        mapRef.current = map
        setMapReady(true)

        // Sombra "brutalista" do traçado
        new google.maps.Polyline({
          map,
          path: PERCURSO_PATH,
          geodesic: true,
          strokeColor: '#0a0a0a',
          strokeOpacity: 0.9,
          strokeWeight: 9,
          zIndex: 1,
        })

        // Traçado principal (amarelo Somma)
        new google.maps.Polyline({
          map,
          path: PERCURSO_PATH,
          geodesic: true,
          strokeColor: '#FDB716',
          strokeOpacity: 1,
          strokeWeight: 5,
          zIndex: 2,
        })

        // Traçado animado (setas correndo pelo percurso)
        const animated = new google.maps.Polyline({
          map,
          path: PERCURSO_PATH,
          geodesic: true,
          strokeOpacity: 0,
          zIndex: 3,
          icons: [
            {
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                strokeColor: '#FF4800',
                strokeWeight: 2,
                fillColor: '#FF4800',
                fillOpacity: 1,
                scale: 3,
              },
              offset: '0%',
              repeat: '90px',
            },
          ],
        })

        const markerDot = (color: string, scale: number) => ({
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#0a0a0a',
          strokeWeight: 3,
          scale,
        })

        // Anel pulsante em volta da largada
        const pulseRing = new google.maps.Marker({
          map,
          position: PERCURSO_START,
          clickable: false,
          zIndex: 5,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FF4800',
            fillOpacity: 0.25,
            strokeColor: '#FF4800',
            strokeOpacity: 0.6,
            strokeWeight: 2,
            scale: 12,
          },
        })

        new google.maps.Marker({
          map,
          position: PERCURSO_START,
          title: 'Largada / Chegada',
          zIndex: 10,
          icon: markerDot('#FF4800', 9),
        })
        new google.maps.Marker({
          map,
          position: PERCURSO_TURN,
          title: 'Ponto de virada',
          zIndex: 8,
          icon: markerDot('#FD6FDB', 7),
        })

        // Perfil de distancia + elementos do "tour" animado (escondidos ate dar play)
        profileRef.current = buildProfile(google, PERCURSO_PATH)
        progressLineRef.current = new google.maps.Polyline({
          map: null,
          path: [],
          geodesic: true,
          strokeColor: '#FF4800',
          strokeOpacity: 1,
          strokeWeight: 7,
          zIndex: 4,
        })
        runnerRef.current = new google.maps.Marker({
          map: null,
          position: PERCURSO_START,
          zIndex: 12,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FFFFFF',
            fillOpacity: 1,
            strokeColor: '#FF4800',
            strokeWeight: 5,
            scale: 7,
          },
        })

        // Loop de animacao: setas correndo + pulso da largada
        const tick = () => {
          dashOffset = (dashOffset + 0.4) % 100
          const icons = animated.get('icons') as google.maps.IconSequence[]
          icons[0].offset = `${dashOffset}%`
          animated.set('icons', icons)

          pulse += 0.05
          const t = (Math.sin(pulse) + 1) / 2 // 0..1
          pulseRing.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FF4800',
            fillOpacity: 0.28 * (1 - t),
            strokeColor: '#FF4800',
            strokeOpacity: 0.7 * (1 - t),
            strokeWeight: 2,
            scale: 12 + t * 16,
          })

          rafId = window.requestAnimationFrame(tick)
        }
        rafId = window.requestAnimationFrame(tick)
      } catch (err) {
        console.error('Falha ao carregar o mapa do percurso', err)
        if (!cancelled) setMapError(true)
      }
    }

    initMap()

    return () => {
      cancelled = true
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [])

  // Alterna entre mapa estilizado e satelite (hibrido)
  const applyView = useCallback((mode: ViewMode, tilted: boolean) => {
    const map = mapRef.current
    if (!map) return
    if (mode === 'satelite') {
      map.setMapTypeId('hybrid')
    } else {
      map.setMapTypeId('roadmap')
      if (!HAS_VECTOR) map.setOptions({ styles: SOMMA_MAP_STYLES })
    }
    if (tilted) {
      // Mapa vetorial inclina em qualquer camada; raster precisa de zoom alto + satelite (45°)
      if (!HAS_VECTOR && map.getZoom()! < 16) map.setZoom(16)
      map.setTilt(HAS_VECTOR ? 67.5 : 45)
    } else {
      map.setTilt(0)
      map.setHeading(0)
    }
  }, [])

  const handleView = (mode: ViewMode) => {
    setView(mode)
    applyView(mode, is3D)
  }

  const handle3D = () => {
    const next = !is3D
    setIs3D(next)
    // Sem mapa vetorial, o 3D depende da imagem aerea: forcamos satelite
    let mode = view
    if (next && !HAS_VECTOR) {
      mode = 'satelite'
      setView('satelite')
    }
    applyView(mode, next)
  }

  const handleRecenter = () => {
    if (isTouring) {
      stopTour()
      return
    }
    const map = mapRef.current
    const bounds = boundsRef.current
    if (!map || !bounds) return
    setIs3D(false)
    map.setTilt(0)
    map.setHeading(0)
    map.fitBounds(bounds, 56)
  }

  const handleRotate = (delta: number) => {
    const map = mapRef.current
    if (!map) return
    map.setHeading(((map.getHeading() || 0) + delta) % 360)
  }

  const stopTour = useCallback(() => {
    tourActiveRef.current = false
    if (tourRafRef.current) cancelAnimationFrame(tourRafRef.current)
    progressLineRef.current?.setMap(null)
    runnerRef.current?.setMap(null)
    setIsTouring(false)
    setTourLabel('')
    const map = mapRef.current
    const bounds = boundsRef.current
    if (map && bounds) {
      map.setTilt(0)
      map.fitBounds(bounds, 56)
    }
  }, [])

  // Tour automatico: da zoom e percorre o trajeto — 1 volta (4km), depois 2 voltas (8km), em loop
  const startTour = useCallback(() => {
    const map = mapRef.current
    const profile = profileRef.current
    const progress = progressLineRef.current
    const runner = runnerRef.current
    const google = typeof window !== 'undefined' ? window.google : undefined
    if (!map || !profile || !progress || !runner || !google) return

    tourActiveRef.current = true
    setIsTouring(true)
    progress.setMap(map)
    runner.setMap(map)

    const L = profile.total
    const overviewCenter = (boundsRef.current?.getCenter()?.toJSON() ?? PERCURSO_START) as LatLngLit
    const startPos = profile.path[0]
    const introMs = 1300
    const lapMs = 7000 // duracao de 1 volta (4km)
    const followZoom = 16.5
    let t0 = 0

    const frame = (ts: number) => {
      if (!tourActiveRef.current) return
      if (!t0) t0 = ts
      const elapsed = ts - t0

      // Fase de introducao: zoom in saindo da visao geral ate a largada
      if (elapsed < introMs) {
        const k = easeInOut(elapsed / introMs)
        map.moveCamera({ center: lerpPoint(overviewCenter, startPos, k), zoom: lerp(13, followZoom, k) })
        runner.setPosition(startPos)
        progress.setPath([startPos])
        setTourLabel('Pronto pra largada...')
        tourRafRef.current = requestAnimationFrame(frame)
        return
      }

      // Ciclo: volta 1 (4km) -> volta 2 (8km) -> repete
      const cycle = (elapsed - introMs) % (lapMs * 2)
      const lap = Math.floor(cycle / lapMs) // 0 ou 1
      const lapFrac = (cycle % lapMs) / lapMs
      const dist = lapFrac * L
      const pos = pointAt(google, profile, dist)

      runner.setPosition(pos)
      progress.setPath(segmentTo(google, profile, dist))
      progress.setOptions({ strokeColor: lap === 0 ? '#FF4800' : '#FD6FDB' })
      map.moveCamera({ center: pos, zoom: followZoom })
      setTourLabel(lap === 0 ? 'Volta 1 · 4 KM' : 'Volta 2 · 8 KM ida e volta')

      tourRafRef.current = requestAnimationFrame(frame)
    }

    tourRafRef.current = requestAnimationFrame(frame)
  }, [])

  const toggleTour = () => {
    if (isTouring) stopTour()
    else startTour()
  }

  // Encerra o tour ao desmontar
  useEffect(() => () => stopTour(), [stopTour])

  // Animacoes de entrada da secao
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.route-stat', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.route-stats', start: 'top 85%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const chipBase =
    'min-h-0 rounded-lg border-2 border-somma-black px-3 py-1.5 font-dm text-[11px] font-bold uppercase tracking-wide transition-all sm:text-xs'

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-somma-cream px-4 py-14 sm:py-16 md:py-32"
    >
      <FloatingElement
        src="/elemento-corredor.svg"
        alt=""
        speed={0.8}
        rotate={-12}
        className="hidden md:block top-[8%] right-[4%] w-28 md:w-40 opacity-90 z-10"
      />
      <FloatingElement
        src="/elemento-relogio.svg"
        alt=""
        speed={1.3}
        rotate={18}
        className="hidden lg:block bottom-[6%] left-[3%] w-32 opacity-90 z-10"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="mb-3 text-center font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
          Por onde a gente corre
        </p>
        <h2 className="mb-12 text-center font-bebas text-4xl leading-[1.05] tracking-tight text-somma-black sm:mb-16 sm:text-6xl md:mb-20 md:text-8xl lg:text-9xl">
          O percurso{' '}
          <span className="block text-somma-blue sm:mt-1">Somma Special Day</span>
        </h2>

        {/* Cartao do mapa */}
        <div className="overflow-hidden rounded-2xl border-4 border-somma-black bg-somma-blue shadow-[6px_6px_0_#0a0a0a] sm:rounded-3xl sm:border-[6px] sm:shadow-[10px_10px_0_#0a0a0a]">
          {/* Barra superior estilo app de mapa */}
          <div className="flex flex-col gap-3 border-b-4 border-somma-black bg-somma-cream px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full bg-somma-orange ring-2 ring-somma-black" />
              <span className="font-bebas text-lg tracking-wide text-somma-black sm:text-2xl">
                Percurso Somma · 4,2 KM
              </span>
            </div>

            {/* Controles de camada / 3D */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleView('mapa')}
                aria-pressed={view === 'mapa'}
                className={`${chipBase} ${view === 'mapa' ? 'bg-somma-blue text-somma-cream shadow-[2px_2px_0_#0a0a0a]' : 'bg-white text-somma-black hover:bg-somma-yellow'}`}
              >
                Mapa
              </button>
              <button
                type="button"
                onClick={() => handleView('satelite')}
                aria-pressed={view === 'satelite'}
                className={`${chipBase} ${view === 'satelite' ? 'bg-somma-blue text-somma-cream shadow-[2px_2px_0_#0a0a0a]' : 'bg-white text-somma-black hover:bg-somma-yellow'}`}
              >
                Satelite
              </button>
              <button
                type="button"
                onClick={handle3D}
                aria-pressed={is3D}
                className={`${chipBase} ${is3D ? 'bg-somma-orange text-somma-cream shadow-[2px_2px_0_#0a0a0a]' : 'bg-white text-somma-black hover:bg-somma-yellow'}`}
              >
                3D
              </button>
              <button
                type="button"
                onClick={toggleTour}
                aria-pressed={isTouring}
                className={`${chipBase} ${isTouring ? 'bg-somma-pink text-somma-black shadow-[2px_2px_0_#0a0a0a]' : 'bg-somma-yellow text-somma-black hover:bg-somma-orange hover:text-somma-cream'}`}
              >
                {isTouring ? '■ Parar' : '▶ Tour 4K / 8K'}
              </button>
            </div>
          </div>

          {/* Mapa interativo do Google */}
          <div className="relative">
            <div
              ref={mapElRef}
              className="h-[58vh] max-h-[600px] min-h-[340px] w-full bg-somma-cream sm:h-[480px] md:h-[560px]"
              role="application"
              aria-label="Mapa interativo do percurso de 4,2 km da corrida Somma Special Day"
            />

            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-somma-cream px-6 text-center">
                <p className="font-dm text-sm text-somma-black/70">
                  Nao foi possivel carregar o mapa interativo agora.
                  <br />
                  Percurso: 4,2 km pela regiao das embaixadas, com largada e chegada no mesmo ponto.
                </p>
              </div>
            )}

            {/* Selo do tour (volta atual / distancia) */}
            {isTouring && tourLabel && (
              <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border-2 border-somma-black bg-somma-cream px-4 py-1.5 shadow-[3px_3px_0_#0a0a0a] sm:top-5">
                <span className="whitespace-nowrap font-bebas text-base tracking-wide text-somma-black sm:text-xl">
                  {tourLabel}
                </span>
              </div>
            )}

            {/* Controles de rotacao / recentralizar (so quando o mapa carrega) */}
            {mapReady && !mapError && (
              <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 sm:right-5 sm:top-5">
                <button
                  type="button"
                  onClick={() => handleRotate(-30)}
                  aria-label="Girar mapa para a esquerda"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-somma-black bg-somma-cream font-bebas text-lg shadow-[2px_2px_0_#0a0a0a] transition-transform active:translate-y-[2px] active:shadow-none"
                >
                  ↺
                </button>
                <button
                  type="button"
                  onClick={() => handleRotate(30)}
                  aria-label="Girar mapa para a direita"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-somma-black bg-somma-cream font-bebas text-lg shadow-[2px_2px_0_#0a0a0a] transition-transform active:translate-y-[2px] active:shadow-none"
                >
                  ↻
                </button>
                <button
                  type="button"
                  onClick={handleRecenter}
                  aria-label="Recentralizar percurso"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-somma-black bg-somma-yellow font-bebas text-lg shadow-[2px_2px_0_#0a0a0a] transition-transform active:translate-y-[2px] active:shadow-none"
                >
                  ⊕
                </button>
              </div>
            )}

            {/* Legenda flutuante */}
            <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-col gap-1.5 rounded-xl border-2 border-somma-black bg-somma-cream/95 px-3 py-2 shadow-[3px_3px_0_#0a0a0a] backdrop-blur-sm sm:bottom-5 sm:left-5 sm:gap-2 sm:px-4 sm:py-3">
              <span className="flex items-center gap-2 font-dm text-[10px] font-bold uppercase tracking-wide text-somma-black sm:text-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-somma-orange ring-2 ring-somma-black" />
                Largada / Chegada
              </span>
              <span className="flex items-center gap-2 font-dm text-[10px] font-bold uppercase tracking-wide text-somma-black sm:text-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-somma-pink ring-2 ring-somma-black" />
                Ponto de virada
              </span>
            </div>
          </div>
        </div>

        {/* Como funcionam as distancias */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:mt-12">
          <div className="rounded-2xl border-4 border-somma-black bg-somma-blue p-5 text-somma-cream shadow-[4px_4px_0_#0a0a0a] sm:p-6 sm:shadow-[6px_6px_0_#0a0a0a]">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-somma-black bg-somma-yellow font-bebas text-2xl text-somma-black">
                4
              </span>
              <h3 className="font-bebas text-2xl tracking-wide sm:text-3xl">Corrida de 4 km</h3>
            </div>
            <p className="mt-3 font-dm text-sm leading-relaxed text-somma-cream/90">
              Quem for fazer os <span className="font-bold text-somma-yellow">4 km</span> corre o trajeto só de ida:
              sai da largada e segue até o ponto de virada, onde fica a sua chegada.
            </p>
          </div>

          <div className="rounded-2xl border-4 border-somma-black bg-somma-orange p-5 text-somma-cream shadow-[4px_4px_0_#0a0a0a] sm:p-6 sm:shadow-[6px_6px_0_#0a0a0a]">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-somma-black bg-somma-yellow font-bebas text-2xl text-somma-black">
                8
              </span>
              <h3 className="font-bebas text-2xl tracking-wide sm:text-3xl">Corrida de 8 km</h3>
            </div>
            <p className="mt-3 font-dm text-sm leading-relaxed text-somma-cream/90">
              Quem for fazer os <span className="font-bold text-somma-yellow">8 km</span> faz o trajeto de
              ida e volta: vai até o ponto de virada e retorna pelo mesmo caminho até a largada.
            </p>
          </div>
        </div>

        {/* Stats do percurso */}
        <div className="route-stats mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 md:mt-12">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="route-stat rounded-2xl border-4 border-somma-black bg-somma-cream p-5 text-center shadow-[4px_4px_0_#0a0a0a] sm:p-6 sm:shadow-[6px_6px_0_#0a0a0a]"
            >
              <p className="font-bebas text-5xl leading-none tracking-tight text-somma-blue sm:text-6xl">
                {s.value}
                <span className="text-somma-orange">{s.unit}</span>
              </p>
              <p className="mt-2 font-dm text-xs uppercase tracking-widest text-somma-black/70">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
