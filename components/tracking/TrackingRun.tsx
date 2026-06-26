'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getDistance } from 'geolib'
import { loadMapsLib, mapsAvailable, DARK_SOMMA_STYLE } from './maps'
import { fmtDistance, fmtDuration, fmtPace } from '@/lib/tracking/format'
import { TRACKING_MIN_INTERVAL_MS, TRACKING_MIN_DISTANCE_METERS, TRACKING_MAX_ACCURACY_METERS } from '@/lib/tracking/constants'
import type { TrackSession, TrackPoint } from '@/lib/tracking/types'

type Pt = { lat: number; lng: number; accuracy: number | null; altitude: number | null; speed: number | null; heading: number | null; captured_at: string }
type Status = 'created' | 'running' | 'paused' | 'finished' | 'cancelled'

export default function TrackingRun({ token, session, initialPoints }: { token: string; session: TrackSession; initialPoints: TrackPoint[] }) {
  const [status, setStatus] = useState<Status>(session.status === 'created' ? 'running' : (session.status as Status))
  const [distanceM, setDistanceM] = useState(session.total_distance_m || 0)
  const [durationSec, setDurationSec] = useState(session.total_duration_seconds || 0)
  const [avgPace, setAvgPace] = useState<number | null>(session.average_pace_seconds_per_km)
  const [curPace, setCurPace] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(session.latest_accuracy_m)
  const [online, setOnline] = useState(true)
  const [pending, setPending] = useState(0)
  const [hasFix, setHasFix] = useState(initialPoints.length > 0)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [summary, setSummary] = useState<{ distance: number; duration: number; pace: number | null } | null>(null)

  const mapDiv = useRef<HTMLDivElement>(null)
  const map = useRef<google.maps.Map | null>(null)
  const meMarker = useRef<google.maps.Marker | null>(null)
  const meCircle = useRef<google.maps.Circle | null>(null)
  const realLine = useRef<google.maps.Polyline | null>(null)
  const follow = useRef(true)
  const watchId = useRef<number | null>(null)
  const queue = useRef<Pt[]>([])
  const realPath = useRef<{ lat: number; lng: number }[]>(initialPoints.map((p) => ({ lat: Number(p.latitude), lng: Number(p.longitude) })))
  const lastSent = useRef<{ lat: number; lng: number; at: number } | null>(null)
  const startedAtMs = useRef<number>(session.started_at ? Date.parse(session.started_at) : Date.now())
  const flushing = useRef(false)
  const statusRef = useRef<Status>(status)
  statusRef.current = status

  const QKEY = `gps_queue_${token}`

  const persistQueue = useCallback(() => {
    try {
      localStorage.setItem(QKEY, JSON.stringify(queue.current))
    } catch {
      /* storage cheio/indisponível */
    }
    setPending(queue.current.length)
  }, [QKEY])

  const flush = useCallback(async () => {
    if (flushing.current || queue.current.length === 0 || !navigator.onLine) return
    flushing.current = true
    const snapshot = queue.current.slice(0, 200)
    try {
      const res = await fetch('/api/tracking/gps-somma/point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, points: snapshot }),
      })
      if (res.ok) {
        const j = await res.json()
        const sentKeys = new Set(snapshot.map((p) => p.captured_at))
        queue.current = queue.current.filter((p) => !sentKeys.has(p.captured_at))
        persistQueue()
        if (typeof j.total_distance_m === 'number') setDistanceM(j.total_distance_m)
        if (typeof j.total_duration_seconds === 'number') setDurationSec(j.total_duration_seconds)
        if ('average_pace_seconds_per_km' in j) setAvgPace(j.average_pace_seconds_per_km)
      }
    } catch {
      /* mantém na fila e tenta depois */
    } finally {
      flushing.current = false
    }
  }, [token, persistQueue])

  // restaura fila persistida
  useEffect(() => {
    try {
      const raw = localStorage.getItem(QKEY)
      if (raw) {
        queue.current = JSON.parse(raw)
        setPending(queue.current.length)
      }
    } catch {
      /* ignore */
    }
  }, [QKEY])

  // mapa
  useEffect(() => {
    if (!mapsAvailable() || !mapDiv.current) return
    let cancelled = false
    ;(async () => {
      const { Map } = await loadMapsLib('maps')
      if (cancelled || !mapDiv.current) return
      const center = session.latest_lat != null ? { lat: Number(session.latest_lat), lng: Number(session.latest_lng) } : session.reference_lat != null ? { lat: Number(session.reference_lat), lng: Number(session.reference_lng) } : { lat: -15.7939, lng: -47.8828 }
      map.current = new Map(mapDiv.current, { center, zoom: 17, styles: DARK_SOMMA_STYLE, disableDefaultUI: true, gestureHandling: 'greedy', backgroundColor: '#1d1d1d' })
      map.current.addListener('dragstart', () => (follow.current = false))
      realLine.current = new google.maps.Polyline({ map: map.current, path: realPath.current, strokeColor: '#FF4800', strokeWeight: 5, strokeOpacity: 0.95 })
      // rota planejada (cinza pontilhada)
      if (session.planned_route_polyline) {
        try {
          const geo = await loadMapsLib('geometry')
          const path = geo.encoding.decodePath(session.planned_route_polyline)
          new google.maps.Polyline({ map: map.current, path, strokeOpacity: 0, icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.6, strokeColor: '#9aa0a6', scale: 3 }, offset: '0', repeat: '14px' }] })
        } catch {
          /* opcional */
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session])

  const drawMe = useCallback((lat: number, lng: number, acc: number | null) => {
    if (!map.current) return
    const pos = { lat, lng }
    if (!meMarker.current) {
      meMarker.current = new google.maps.Marker({ map: map.current, position: pos, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#FF4800', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 } })
      meCircle.current = new google.maps.Circle({ map: map.current, center: pos, radius: acc ?? 15, strokeColor: '#FF4800', strokeOpacity: 0.35, strokeWeight: 1, fillColor: '#FF4800', fillOpacity: 0.08 })
    } else {
      meMarker.current.setPosition(pos)
      meCircle.current?.setCenter(pos)
      meCircle.current?.setRadius(acc ?? 15)
    }
    if (follow.current) map.current.panTo(pos)
  }, [])

  const onPosition = useCallback(
    (p: GeolocationPosition) => {
      if (statusRef.current !== 'running') return
      const { latitude: lat, longitude: lng, accuracy, altitude, speed, heading } = p.coords
      setAccuracy(accuracy)
      setHasFix(true)
      drawMe(lat, lng, accuracy)

      const now = p.timestamp || Date.now()
      const prev = lastSent.current
      const dist = prev ? getDistance({ latitude: prev.lat, longitude: prev.lng }, { latitude: lat, longitude: lng }) : Infinity
      const dt = prev ? now - prev.at : Infinity
      if (dt < TRACKING_MIN_INTERVAL_MS && dist < TRACKING_MIN_DISTANCE_METERS) return // throttle

      lastSent.current = { lat, lng, at: now }
      queue.current.push({ lat, lng, accuracy: accuracy ?? null, altitude: altitude ?? null, speed: speed ?? null, heading: heading ?? null, captured_at: new Date(now).toISOString() })
      persistQueue()

      // desenha só pontos de boa precisão na linha real
      if (accuracy == null || accuracy <= TRACKING_MAX_ACCURACY_METERS) {
        realPath.current.push({ lat, lng })
        realLine.current?.setPath(realPath.current)
        // ritmo atual: janela dos últimos ~6 pontos
        const w = realPath.current.slice(-6)
        if (w.length >= 2) {
          let d = 0
          for (let i = 1; i < w.length; i++) d += getDistance(w[i - 1], w[i])
          const secs = Math.min(30, (w.length - 1) * 5)
          setCurPace(d > 15 ? Math.round(secs / (d / 1000)) : null)
        }
      }
      flush()
    },
    [drawMe, persistQueue, flush]
  )

  const startWatch = useCallback(() => {
    if (!navigator.geolocation || watchId.current != null) return
    watchId.current = navigator.geolocation.watchPosition(onPosition, () => setHasFix(false), { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
  }, [onPosition])

  const stopWatch = useCallback(() => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }, [])

  // boot: marca running + começa a captar
  useEffect(() => {
    ;(async () => {
      if (session.status === 'created' || session.status === 'paused') {
        await fetch('/api/tracking/gps-somma/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }).catch(() => {})
        startedAtMs.current = session.started_at ? Date.parse(session.started_at) : Date.now()
      }
      if (session.status !== 'finished') {
        setStatus('running')
        startWatch()
      } else {
        setStatus('finished')
      }
    })()
    return () => stopWatch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // timers: duração + flush periódico + online
  useEffect(() => {
    const tick = setInterval(() => {
      if (statusRef.current === 'running') setDurationSec(Math.max(0, Math.round((Date.now() - startedAtMs.current) / 1000)))
    }, 1000)
    const fl = setInterval(() => flush(), 4000)
    const on = () => {
      setOnline(true)
      flush()
    }
    const off = () => setOnline(false)
    setOnline(navigator.onLine)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      clearInterval(tick)
      clearInterval(fl)
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [flush])

  async function pausar() {
    stopWatch()
    setStatus('paused')
    await fetch('/api/tracking/gps-somma/pause', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }).catch(() => {})
  }
  async function retomar() {
    await fetch('/api/tracking/gps-somma/resume', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }).catch(() => {})
    setStatus('running')
    startWatch()
  }
  async function finalizar() {
    stopWatch()
    setStatus('finished')
    await flush()
    try {
      const res = await fetch('/api/tracking/gps-somma/finish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      const j = await res.json()
      setSummary({ distance: j.total_distance_m ?? distanceM, duration: j.total_duration_seconds ?? durationSec, pace: j.average_pace_seconds_per_km ?? avgPace })
    } catch {
      setSummary({ distance: distanceM, duration: durationSec, pace: avgPace })
    }
    // ajusta câmera ao trajeto
    if (map.current && realPath.current.length > 1) {
      const b = new google.maps.LatLngBounds()
      realPath.current.forEach((p) => b.extend(p))
      map.current.fitBounds(b, 48)
    }
  }

  function centralizar() {
    follow.current = true
    const last = realPath.current[realPath.current.length - 1]
    if (map.current && last) {
      map.current.panTo(last)
      map.current.setZoom(17)
    }
  }

  // simulador (somente dev): injeta um passo de caminhada
  const devStep = useCallback(() => {
    const last = realPath.current[realPath.current.length - 1] ?? { lat: Number(session.reference_lat) || -15.7939, lng: Number(session.reference_lng) || -47.8828 }
    const lat = last.lat + (Math.random() - 0.3) * 0.00009
    const lng = last.lng + (Math.random() - 0.3) * 0.00009
    onPosition({ coords: { latitude: lat, longitude: lng, accuracy: 8, altitude: null, altitudeAccuracy: null, heading: null, speed: 3 }, timestamp: Date.now() } as unknown as GeolocationPosition)
  }, [onPosition, session])

  const gps = !hasFix ? { t: 'GPS buscando sinal', c: 'text-somma-yellow' } : accuracy == null ? { t: 'Aguardando localização', c: 'text-somma-cream/60' } : accuracy <= TRACKING_MAX_ACCURACY_METERS ? { t: `GPS bom · ${Math.round(accuracy)}m`, c: 'text-[#1faa59]' } : { t: `Sinal fraco · ${Math.round(accuracy)}m`, c: 'text-somma-orange' }

  // ---------- Tela final ----------
  if (status === 'finished' && summary) {
    return (
      <main className="min-h-[100svh] bg-somma-black px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] text-somma-cream">
        <div className="mx-auto flex max-w-md flex-col gap-5">
          <header className="text-center">
            <p className="font-dm text-[11px] font-bold uppercase tracking-[0.35em] text-somma-orange">Corre finalizado</p>
            <h1 className="font-bebas text-5xl leading-none">Mandou bem! 🧡</h1>
          </header>
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Distância" value={fmtDistance(summary.distance)} />
            <Metric label="Tempo" value={fmtDuration(summary.duration)} />
            <Metric label="Ritmo médio" value={fmtPace(summary.pace)} />
          </div>
          <div className="overflow-hidden rounded-3xl border-2 border-somma-cream/15">
            <div ref={mapDiv} className="h-72 w-full bg-somma-cream/5" />
          </div>
          <p className="text-center font-dm text-sm text-somma-cream/60">
            {session.reference_location_name ?? 'Corre livre'} · {new Date().toLocaleString('pt-BR')}
          </p>
          <div className="flex flex-col gap-3">
            <Link href={`/tracking/gps-somma/admin`} className="rounded-2xl border-2 border-somma-cream/30 px-3 py-3 text-center font-bebas text-lg tracking-widest">Ver no painel</Link>
            <Link href="/tracking/gps-somma" className="rounded-2xl border-4 border-somma-cream bg-somma-orange px-3 py-3 text-center font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#000]">Nova corrida</Link>
          </div>
        </div>
      </main>
    )
  }

  // ---------- Tracking ativo ----------
  return (
    <main className="relative h-[100svh] w-full overflow-hidden bg-somma-black text-somma-cream">
      <div ref={mapDiv} className="absolute inset-0 bg-somma-cream/5" />
      {!mapsAvailable() && <div className="absolute inset-0 flex items-center justify-center p-6 text-center font-dm text-sm text-somma-cream/60">Mapa indisponível (sem chave do Google Maps). O tracking continua salvando os pontos.</div>}

      {/* topo: status */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 px-3 pt-[calc(0.6rem+env(safe-area-inset-top))]">
        <span className={`rounded-full border border-somma-cream/15 bg-somma-black/70 px-3 py-1.5 font-dm text-xs font-bold backdrop-blur ${gps.c}`}>{gps.t}</span>
        <div className="flex gap-2">
          <span className={`rounded-full border border-somma-cream/15 bg-somma-black/70 px-3 py-1.5 font-dm text-xs font-bold backdrop-blur ${online ? 'text-somma-cream/70' : 'text-red-400'}`}>
            {online ? (pending > 0 ? `Sincronizando ${pending}` : 'Online') : 'Sem conexão'}
          </span>
          <span className={`rounded-full border border-somma-cream/15 bg-somma-black/70 px-3 py-1.5 font-dm text-xs font-bold backdrop-blur ${status === 'running' ? 'text-[#1faa59]' : 'text-somma-yellow'}`}>
            {status === 'running' ? 'Ativo' : 'Pausado'}
          </span>
        </div>
      </div>

      {/* centralizar */}
      <button onClick={centralizar} className="absolute right-3 top-[calc(3.6rem+env(safe-area-inset-top))] z-10 flex h-11 w-11 items-center justify-center rounded-full border border-somma-cream/20 bg-somma-black/70 text-lg backdrop-blur" aria-label="Centralizar em mim">
        ◎
      </button>

      {process.env.NODE_ENV !== 'production' && (
        <button onClick={devStep} className="absolute left-3 top-[calc(3.6rem+env(safe-area-inset-top))] z-10 rounded-full border border-somma-cream/20 bg-somma-black/70 px-3 py-1.5 font-dm text-xs backdrop-blur">
          + ponto (dev)
        </button>
      )}

      {/* painel inferior */}
      <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-3xl border-t-2 border-somma-cream/15 bg-somma-black/85 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur">
        <div className="grid grid-cols-3 gap-3">
          <Metric label="Distância" value={fmtDistance(distanceM)} />
          <Metric label="Tempo" value={fmtDuration(durationSec)} />
          <Metric label="Ritmo" value={fmtPace(curPace ?? avgPace)} />
        </div>
        <div className="mt-4 flex gap-3">
          {status === 'running' ? (
            <button onClick={pausar} className="flex-1 rounded-2xl border-2 border-somma-cream/30 py-4 font-bebas text-xl tracking-widest">Pausar</button>
          ) : (
            <button onClick={retomar} className="flex-1 rounded-2xl border-4 border-somma-cream bg-[#1faa59] py-4 font-bebas text-xl tracking-widest text-somma-cream shadow-[3px_3px_0_#000]">Retomar</button>
          )}
          <button onClick={() => setConfirmFinish(true)} className="flex-1 rounded-2xl border-4 border-somma-cream bg-somma-orange py-4 font-bebas text-xl tracking-widest text-somma-cream shadow-[3px_3px_0_#000]">Finalizar</button>
        </div>
      </div>

      {confirmFinish && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-somma-black/70 p-4 sm:items-center" onClick={() => setConfirmFinish(false)}>
          <div className="w-full max-w-sm rounded-3xl border-2 border-somma-cream/20 bg-somma-black p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="font-bebas text-2xl uppercase tracking-wide">Finalizar o corre?</p>
            <p className="mt-1 font-dm text-sm text-somma-cream/65">Vamos consolidar distância, tempo e ritmo.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirmFinish(false)} className="flex-1 rounded-2xl border-2 border-somma-cream/30 py-3 font-bebas tracking-widest">Voltar</button>
              <button onClick={() => { setConfirmFinish(false); finalizar() }} className="flex-1 rounded-2xl border-4 border-somma-cream bg-somma-orange py-3 font-bebas tracking-widest text-somma-cream">Finalizar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-somma-cream/12 bg-somma-cream/[0.05] p-3 text-center">
      <p className="font-bebas text-2xl leading-none text-somma-cream">{value}</p>
      <p className="mt-1 font-dm text-[10px] font-bold uppercase tracking-widest text-somma-cream/50">{label}</p>
    </div>
  )
}
