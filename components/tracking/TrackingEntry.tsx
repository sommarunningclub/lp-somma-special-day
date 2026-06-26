'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadMapsLib, mapsAvailable, DARK_SOMMA_STYLE } from './maps'

type Coords = { lat: number; lng: number; accuracy?: number }
type Dest = { name: string; lat: number; lng: number }

export default function TrackingEntry() {
  const router = useRouter()
  const [nome, setNome] = useState('Alex')
  const [atual, setAtual] = useState<Coords | null>(null)
  const [destino, setDestino] = useState<Dest | null>(null)
  const [plannedPolyline, setPlannedPolyline] = useState<string | null>(null)
  const [geoMsg, setGeoMsg] = useState<string | null>(null)
  const [buscandoLoc, setBuscandoLoc] = useState(false)
  const [iniciando, setIniciando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const mapDiv = useRef<HTMLDivElement>(null)
  const placesInput = useRef<HTMLInputElement>(null)
  const map = useRef<google.maps.Map | null>(null)
  const meMarker = useRef<google.maps.Marker | null>(null)
  const meCircle = useRef<google.maps.Circle | null>(null)
  const destMarker = useRef<google.maps.Marker | null>(null)
  const plannedLine = useRef<google.maps.Polyline | null>(null)

  // Inicializa mapa + autocomplete (client only).
  useEffect(() => {
    if (!mapsAvailable() || !mapDiv.current) return
    let cancelled = false
    ;(async () => {
      try {
        const { Map } = await loadMapsLib('maps')
        if (cancelled || !mapDiv.current) return
        map.current = new Map(mapDiv.current, {
          center: { lat: -15.7939, lng: -47.8828 },
          zoom: 13,
          styles: DARK_SOMMA_STYLE,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          backgroundColor: '#1d1d1d',
        })

        const { Autocomplete } = await loadMapsLib('places')
        if (cancelled || !placesInput.current) return
        const ac = new Autocomplete(placesInput.current, { fields: ['geometry', 'name', 'formatted_address'] })
        ac.addListener('place_changed', () => {
          const place = ac.getPlace()
          const loc = place.geometry?.location
          if (!loc) return
          setDestino({ name: place.name || place.formatted_address || 'Destino', lat: loc.lat(), lng: loc.lng() })
        })
      } catch {
        /* sem mapa: segue só com geolocalização */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Atualiza marcador da posição atual.
  useEffect(() => {
    if (!map.current || !atual) return
    const pos = { lat: atual.lat, lng: atual.lng }
    if (!meMarker.current) {
      meMarker.current = new google.maps.Marker({ map: map.current, position: pos, title: 'Você', icon: dotIcon('#FF4800') })
      meCircle.current = new google.maps.Circle({ map: map.current, center: pos, radius: atual.accuracy ?? 20, strokeColor: '#FF4800', strokeOpacity: 0.4, strokeWeight: 1, fillColor: '#FF4800', fillOpacity: 0.1 })
    } else {
      meMarker.current.setPosition(pos)
      meCircle.current?.setCenter(pos)
      meCircle.current?.setRadius(atual.accuracy ?? 20)
    }
    map.current.setCenter(pos)
    map.current.setZoom(16)
  }, [atual])

  // Destino + rota planejada (cinza pontilhada).
  useEffect(() => {
    if (!map.current || !destino) return
    const pos = { lat: destino.lat, lng: destino.lng }
    if (!destMarker.current) destMarker.current = new google.maps.Marker({ map: map.current, position: pos, title: destino.name, icon: dotIcon('#FDB716') })
    else destMarker.current.setPosition(pos)
    ;(async () => {
      if (!atual) return
      try {
        const { DirectionsService } = await loadMapsLib('routes')
        const geometry = await loadMapsLib('geometry')
        const svc = new DirectionsService()
        const res = await svc.route({ origin: { lat: atual.lat, lng: atual.lng }, destination: pos, travelMode: google.maps.TravelMode.WALKING })
        const path = res.routes[0]?.overview_path
        if (!path) return
        plannedLine.current?.setMap(null)
        plannedLine.current = new google.maps.Polyline({
          map: map.current!,
          path,
          strokeColor: '#9aa0a6',
          strokeOpacity: 0,
          icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.7, scale: 3 }, offset: '0', repeat: '14px' }],
        })
        setPlannedPolyline(geometry.encoding.encodePath(path))
        const b = new google.maps.LatLngBounds()
        b.extend({ lat: atual.lat, lng: atual.lng })
        b.extend(pos)
        map.current!.fitBounds(b, 64)
      } catch {
        /* rota planejada é opcional */
      }
    })()
  }, [destino, atual])

  function usarLocalizacao() {
    if (!navigator.geolocation) {
      setGeoMsg('Geolocalização não suportada neste navegador.')
      return
    }
    setBuscandoLoc(true)
    setGeoMsg('Buscando sua localização…')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setAtual({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy })
        setGeoMsg(`Localização obtida (precisão ~${Math.round(p.coords.accuracy)}m).`)
        setBuscandoLoc(false)
      },
      (err) => {
        setGeoMsg(err.code === err.PERMISSION_DENIED ? 'Permissão de localização negada. Libere nos ajustes do navegador.' : 'Não foi possível obter a localização.')
        setBuscandoLoc(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  async function iniciar() {
    setErro(null)
    if (!nome.trim()) {
      setErro('Informe seu nome.')
      return
    }
    setIniciando(true)
    try {
      const ref = destino ?? (atual ? { name: 'Localização atual', lat: atual.lat, lng: atual.lng } : null)
      const res = await fetch('/api/tracking/gps-somma/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_name: nome.trim(),
          reference_location_name: ref?.name ?? null,
          reference_lat: ref?.lat ?? null,
          reference_lng: ref?.lng ?? null,
          planned_route_polyline: destino ? plannedPolyline : null,
        }),
      })
      const j = await res.json()
      if (res.ok && j.token) router.push(`/tracking/gps-somma/correr/${j.token}`)
      else setErro(j.error ?? 'Não foi possível iniciar.')
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setIniciando(false)
    }
  }

  return (
    <main className="min-h-[100svh] bg-somma-black px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-somma-cream">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <header className="text-center">
          <p className="font-dm text-[11px] font-bold uppercase tracking-[0.35em] text-somma-orange">SOMMA</p>
          <h1 className="font-bebas text-5xl leading-none tracking-tight">SOMMA GPS Tracking</h1>
          <p className="mx-auto mt-2 max-w-xs font-dm text-sm text-somma-cream/70">Registra teu percurso ao vivo no mapa. Distância, tempo e ritmo em tempo real.</p>
        </header>

        <div className="overflow-hidden rounded-3xl border-2 border-somma-cream/15">
          <div ref={mapDiv} className="h-52 w-full bg-somma-cream/5" />
          {!mapsAvailable() && <p className="bg-somma-cream/5 p-3 text-center font-dm text-xs text-somma-cream/50">Mapa indisponível (sem chave do Google Maps).</p>}
        </div>

        <div className="space-y-4 rounded-3xl border-2 border-somma-cream/15 bg-somma-cream/[0.04] p-5">
          <div>
            <label className={labelCls}>Seu nome</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} placeholder="Seu nome" />
          </div>

          <div>
            <label className={labelCls}>Onde você vai correr?</label>
            <button onClick={usarLocalizacao} disabled={buscandoLoc} className="w-full rounded-xl border-2 border-somma-orange bg-somma-orange/10 px-4 py-3 font-bebas text-base tracking-widest text-somma-orange disabled:opacity-60">
              {buscandoLoc ? 'Buscando…' : atual ? '✓ Localização atual definida' : '📍 Usar minha localização atual'}
            </button>
            <input ref={placesInput} className={`${inputCls} mt-2`} placeholder="Ou busca um local (ex: Parque da Cidade)" />
            {geoMsg && <p className="mt-2 font-dm text-xs text-somma-cream/55">{geoMsg}</p>}
            {destino && <p className="mt-1 font-dm text-xs text-somma-yellow">Destino: {destino.name} · rota planejada (cinza) será exibida.</p>}
          </div>

          {erro && <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-center font-dm text-sm text-red-300">{erro}</p>}

          <button onClick={iniciar} disabled={iniciando} className="w-full rounded-2xl border-4 border-somma-cream bg-somma-orange px-3 py-4 font-bebas text-2xl tracking-widest text-somma-cream shadow-[4px_4px_0_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-60">
            {iniciando ? 'INICIANDO…' : 'INICIAR CORRE'}
          </button>
          <p className="text-center font-dm text-xs text-somma-cream/45">Mantenha esta tela aberta durante o corre para melhor precisão.</p>
        </div>
      </div>
    </main>
  )
}

const inputCls = 'w-full rounded-xl border-2 border-somma-cream/20 bg-somma-black px-4 py-3 font-dm text-somma-cream placeholder:text-somma-cream/30 focus:border-somma-orange focus:outline-none'
const labelCls = 'mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-cream/60'

function dotIcon(color: string): google.maps.Symbol {
  return { path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }
}
