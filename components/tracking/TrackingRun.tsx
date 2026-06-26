'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getDistance } from 'geolib'
import { loadMapsLib, mapsAvailable, DARK_SOMMA_STYLE } from './maps'
import { animateMapTo, prefersReducedMotion } from './cameraAnim'
import { createRunnerMarker, type RunnerMarker } from './runnerMarker'
import { fmtDistance, fmtDuration, fmtPace } from '@/lib/tracking/format'
import { TRACKING_MIN_INTERVAL_MS, TRACKING_MIN_DISTANCE_METERS, TRACKING_MAX_ACCURACY_METERS } from '@/lib/tracking/constants'
import type { TrackSession, TrackPoint } from '@/lib/tracking/types'

type Pt = { lat: number; lng: number; accuracy: number | null; altitude: number | null; speed: number | null; heading: number | null; captured_at: string }
type Status = 'created' | 'running' | 'paused' | 'finished' | 'cancelled'
type MapPhase = 'acquiring' | 'locking' | 'active'

const KEYFRAMES = `
@keyframes srmPulse{0%{transform:scale(.5);opacity:.7}100%{transform:scale(2.4);opacity:0}}
@keyframes radarRing{0%{transform:scale(.2);opacity:.8}100%{transform:scale(1);opacity:0}}
@keyframes radarSweep{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.srm{position:absolute;will-change:left,top}
.srm-halo{position:absolute;left:0;top:0;width:48px;height:48px;margin:-24px 0 0 -24px;border-radius:50%;background:rgba(255,72,0,.28);animation:srmPulse 1.8s ease-out infinite}
.srm-core{position:absolute;left:0;top:0;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:#fff;border:3px solid #FF4800;box-shadow:0 0 0 2px rgba(0,0,0,.35)}
`

export default function TrackingRun({ token, session, initialPoints }: { token: string; session: TrackSession; initialPoints: TrackPoint[] }) {
  const esteira = session.activity_type === 'esteira'
  const [status, setStatus] = useState<Status>(session.status === 'created' ? 'running' : (session.status as Status))
  const [mapPhase, setMapPhase] = useState<MapPhase>(esteira || initialPoints.length > 0 ? 'active' : 'acquiring')
  const [lockMsg, setLockMsg] = useState(false)
  const [geoError, setGeoError] = useState<'denied' | null>(null)
  const [slowGps, setSlowGps] = useState(false)
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
  const runner = useRef<RunnerMarker | null>(null)
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
  const phaseRef = useRef<MapPhase>(mapPhase)
  phaseRef.current = mapPhase
  const locked = useRef<boolean>(mapPhase === 'active')
  const acquireStart = useRef<number>(Date.now())
  const cameraCancel = useRef<() => void>(() => {})

  const QKEY = `gps_queue_${token}`

  const persistQueue = useCallback(() => {
    try {
      localStorage.setItem(QKEY, JSON.stringify(queue.current))
    } catch {
      /* storage indisponível */
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
        const sent = new Set(snapshot.map((p) => p.captured_at))
        queue.current = queue.current.filter((p) => !sent.has(p.captured_at))
        persistQueue()
        if (typeof j.total_distance_m === 'number') setDistanceM(j.total_distance_m)
        if (typeof j.total_duration_seconds === 'number') setDurationSec(j.total_duration_seconds)
        if ('average_pace_seconds_per_km' in j) setAvgPace(j.average_pace_seconds_per_km)
      }
    } catch {
      /* mantém na fila */
    } finally {
      flushing.current = false
    }
  }, [token, persistQueue])

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

  // ---- mapa ----
  useEffect(() => {
    if (!mapsAvailable() || !mapDiv.current) return
    let cancelled = false
    ;(async () => {
      const { Map } = await loadMapsLib('maps')
      if (cancelled || !mapDiv.current) return
      const last = realPath.current[realPath.current.length - 1]
      const center = last ?? (session.latest_lat != null ? { lat: Number(session.latest_lat), lng: Number(session.latest_lng) } : session.reference_lat != null ? { lat: Number(session.reference_lat), lng: Number(session.reference_lng) } : { lat: -15.7939, lng: -47.8828 })
      const startZoom = phaseRef.current === 'active' ? 17 : 12
      map.current = new Map(mapDiv.current, {
        center,
        zoom: startZoom,
        styles: DARK_SOMMA_STYLE,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        backgroundColor: '#1d1d1d',
        isFractionalZoomEnabled: true,
        clickableIcons: false,
      })
      map.current.addListener('dragstart', () => (follow.current = false))

      realLine.current = new google.maps.Polyline({ map: map.current, path: realPath.current, strokeColor: '#FF4800', strokeWeight: 5, strokeOpacity: 0.95 })

      if (session.planned_route_polyline) {
        try {
          const geo = await loadMapsLib('geometry')
          const path = geo.encoding.decodePath(session.planned_route_polyline)
          new google.maps.Polyline({ map: map.current, path, strokeOpacity: 0, icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.6, strokeColor: '#9aa0a6', scale: 3 }, offset: '0', repeat: '14px' }] })
        } catch {
          /* opcional */
        }
      }

      // se já estamos ativos (reload no meio), posiciona o marcador
      if (phaseRef.current === 'active' && last) ensureMarker(last.lat, last.lng, accuracy)
    })()
    return () => {
      cancelled = true
      cameraCancel.current()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  function ensureMarker(lat: number, lng: number, acc: number | null) {
    if (!map.current) return
    const pos = { lat, lng }
    if (!runner.current) {
      runner.current = createRunnerMarker(map.current)
      meCircle.current = new google.maps.Circle({ map: map.current, center: pos, radius: acc ?? 15, strokeColor: '#FF4800', strokeOpacity: 0.3, strokeWeight: 1, fillColor: '#FF4800', fillOpacity: 0.07 })
    }
    runner.current.setPosition(pos)
    meCircle.current?.setCenter(pos)
    meCircle.current?.setRadius(acc ?? 15)
  }

  function triggerLock(lat: number, lng: number) {
    if (locked.current || !map.current) return
    locked.current = true
    setMapPhase('locking')
    cameraCancel.current = animateMapTo(map.current, { lat, lng, zoom: 17 }, prefersReducedMotion() ? 300 : 1600, () => {
      setLockMsg(true)
      window.setTimeout(() => {
        setLockMsg(false)
        setMapPhase('active')
      }, 1300)
    })
  }

  const onPosition = useCallback((p: GeolocationPosition) => {
    if (statusRef.current !== 'running') return
    const { latitude: lat, longitude: lng, accuracy, altitude, speed, heading } = p.coords
    setAccuracy(accuracy)
    setHasFix(true)
    setGeoError(null)
    setSlowGps(false)
    ensureMarker(lat, lng, accuracy)

    // fase de aquisição → trava quando a precisão for boa (ou após 25s, degradado)
    if (phaseRef.current === 'acquiring') {
      const good = accuracy == null || accuracy <= TRACKING_MAX_ACCURACY_METERS
      if (good || Date.now() - acquireStart.current > 25000) triggerLock(lat, lng)
    } else if (phaseRef.current === 'active' && follow.current && map.current) {
      map.current.panTo({ lat, lng })
    }

    const now = p.timestamp || Date.now()
    const prev = lastSent.current
    const dist = prev ? getDistance({ latitude: prev.lat, longitude: prev.lng }, { latitude: lat, longitude: lng }) : Infinity
    const dt = prev ? now - prev.at : Infinity
    if (dt < TRACKING_MIN_INTERVAL_MS && dist < TRACKING_MIN_DISTANCE_METERS) return

    lastSent.current = { lat, lng, at: now }
    queue.current.push({ lat, lng, accuracy: accuracy ?? null, altitude: altitude ?? null, speed: speed ?? null, heading: heading ?? null, captured_at: new Date(now).toISOString() })
    persistQueue()

    if (accuracy == null || accuracy <= TRACKING_MAX_ACCURACY_METERS) {
      realPath.current.push({ lat, lng })
      realLine.current?.setPath(realPath.current)
      const w = realPath.current.slice(-6)
      if (w.length >= 2) {
        let d = 0
        for (let i = 1; i < w.length; i++) d += getDistance(w[i - 1], w[i])
        const secs = Math.min(30, (w.length - 1) * 5)
        setCurPace(d > 15 ? Math.round(secs / (d / 1000)) : null)
      }
    }
    flush()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistQueue, flush])

  const startWatch = useCallback(() => {
    if (!navigator.geolocation || watchId.current != null) return
    acquireStart.current = Date.now()
    watchId.current = navigator.geolocation.watchPosition(
      onPosition,
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setGeoError('denied')
        else setSlowGps(true)
        setHasFix(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }, [onPosition])

  const stopWatch = useCallback(() => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      if (session.status === 'created' || session.status === 'paused') {
        await fetch('/api/tracking/gps-somma/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }).catch(() => {})
        startedAtMs.current = session.started_at ? Date.parse(session.started_at) : Date.now()
      }
      if (session.status !== 'finished') {
        setStatus('running')
        if (!esteira) startWatch()
      } else {
        setStatus('finished')
      }
    })()
    return () => stopWatch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    if (!esteira) startWatch()
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
  function tentarNovamente() {
    setGeoError(null)
    setSlowGps(false)
    stopWatch()
    startWatch()
  }

  const devStep = useCallback(() => {
    const last = realPath.current[realPath.current.length - 1] ?? { lat: Number(session.reference_lat) || -15.7939, lng: Number(session.reference_lng) || -47.8828 }
    const lat = last.lat + (Math.random() - 0.3) * 0.00009
    const lng = last.lng + (Math.random() - 0.3) * 0.00009
    onPosition({ coords: { latitude: lat, longitude: lng, accuracy: 8, altitude: null, altitudeAccuracy: null, heading: null, speed: 3 }, timestamp: Date.now() } as unknown as GeolocationPosition)
  }, [onPosition, session])

  const gps = esteira
    ? { t: 'Esteira (indoor)', c: 'text-somma-cream/70' }
    : !hasFix ? { t: 'GPS buscando sinal', c: 'text-somma-yellow' } : accuracy == null ? { t: 'Aguardando localização', c: 'text-somma-cream/60' } : accuracy <= TRACKING_MAX_ACCURACY_METERS ? { t: `GPS bom · ${Math.round(accuracy)}m`, c: 'text-[#1faa59]' } : { t: `GPS fraco · ${Math.round(accuracy)}m`, c: 'text-somma-orange' }

  const acqText = lockMsg
    ? 'Localização confirmada'
    : !hasFix
      ? slowGps ? 'Ainda buscando sinal GPS' : 'Buscando sinal GPS'
      : accuracy != null && accuracy > TRACKING_MAX_ACCURACY_METERS ? 'Validando precisão' : 'Identificando posição'

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
          <p className="text-center font-dm text-sm text-somma-cream/60">{session.reference_location_name ?? 'Corre livre'} · {new Date().toLocaleString('pt-BR')}</p>
          <div className="flex flex-col gap-3">
            <Link href={`/tracking/gps-somma/atividade/${token}`} className="rounded-2xl border-4 border-somma-cream bg-somma-orange px-3 py-4 text-center font-bebas text-xl tracking-widest text-somma-cream shadow-[4px_4px_0_#000]">📸 Relatório completo + foto do relógio</Link>
            <Link href="/tracking/gps-somma" className="rounded-2xl border-2 border-somma-cream/30 px-3 py-3 text-center font-bebas text-lg tracking-widest">Nova corrida</Link>
          </div>
        </div>
      </main>
    )
  }

  // ---------- Tracking ativo ----------
  return (
    <main className="relative h-[100svh] w-full overflow-hidden bg-somma-black text-somma-cream">
      <style>{KEYFRAMES}</style>
      <div ref={mapDiv} className="absolute inset-0 bg-somma-cream/5" />
      {!mapsAvailable() && <div className="absolute inset-0 flex items-center justify-center p-6 text-center font-dm text-sm text-somma-cream/60">Mapa indisponível (sem chave do Google Maps). O tracking continua salvando os pontos.</div>}

      {/* badges topo */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-3 pt-[calc(0.6rem+env(safe-area-inset-top))]">
        <span className={`rounded-full border border-somma-cream/15 bg-somma-black/70 px-3 py-1.5 font-dm text-xs font-bold backdrop-blur ${gps.c}`}>{gps.t}</span>
        <div className="flex gap-2">
          <span className={`rounded-full border border-somma-cream/15 bg-somma-black/70 px-3 py-1.5 font-dm text-xs font-bold backdrop-blur ${online ? 'text-somma-cream/70' : 'text-red-400'}`}>{online ? (pending > 0 ? `Sincronizando ${pending}` : 'Online') : 'Sem conexão'}</span>
          <span className={`rounded-full border border-somma-cream/15 bg-somma-black/70 px-3 py-1.5 font-dm text-xs font-bold backdrop-blur ${status === 'running' ? 'text-[#1faa59]' : 'text-somma-yellow'}`}>{status === 'running' ? 'Ativo' : 'Pausado'}</span>
        </div>
      </div>

      <button onClick={centralizar} className="absolute right-3 top-[calc(3.6rem+env(safe-area-inset-top))] z-20 flex h-11 w-11 items-center justify-center rounded-full border border-somma-cream/20 bg-somma-black/70 text-lg backdrop-blur" aria-label="Centralizar em mim">◎</button>
      {process.env.NODE_ENV !== 'production' && (
        <button onClick={devStep} className="absolute left-3 top-[calc(3.6rem+env(safe-area-inset-top))] z-20 rounded-full border border-somma-cream/20 bg-somma-black/70 px-3 py-1.5 font-dm text-xs backdrop-blur">+ ponto (dev)</button>
      )}

      {/* overlay de aquisição / lock */}
      {!esteira && mapPhase !== 'active' && !geoError && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-somma-black/45 backdrop-blur-[2px]">
          <div className="relative h-40 w-40">
            <span className="absolute inset-0 rounded-full border border-somma-orange/40" style={{ animation: 'radarRing 2s ease-out infinite' }} />
            <span className="absolute inset-0 rounded-full border border-somma-orange/30" style={{ animation: 'radarRing 2s ease-out infinite .6s' }} />
            <span className="absolute inset-0 rounded-full border border-somma-orange/20" style={{ animation: 'radarRing 2s ease-out infinite 1.2s' }} />
            <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-somma-orange shadow-[0_0_18px_#FF4800]" />
          </div>
          <p className="mt-6 font-dm text-[11px] font-bold uppercase tracking-[0.35em] text-somma-orange">SOMMA GPS</p>
          <p className="mt-1 font-bebas text-3xl tracking-wide text-somma-cream">{lockMsg ? '✓ ' : ''}{acqText}</p>
          {accuracy != null && <p className="mt-1 font-dm text-xs text-somma-cream/55">precisão ~{Math.round(accuracy)}m</p>}
        </div>
      )}

      {/* falha de permissão */}
      {geoError === 'denied' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-somma-black/85 px-8 text-center">
          <p className="font-bebas text-3xl tracking-wide">Precisamos da sua localização</p>
          <p className="max-w-xs font-dm text-sm text-somma-cream/70">Libere a localização precisa nos ajustes do navegador pra rastrear o corre.</p>
          <button onClick={tentarNovamente} className="rounded-2xl border-4 border-somma-cream bg-somma-orange px-6 py-3 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#000]">Tentar novamente</button>
        </div>
      )}

      {/* painel inferior */}
      <div className="absolute inset-x-0 bottom-0 z-20 rounded-t-3xl border-t-2 border-somma-cream/15 bg-somma-black/85 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur">
        {esteira && <p className="mb-3 text-center font-dm text-xs text-somma-yellow">Esteira: o GPS não mede distância. Ao terminar, gere o relatório com a foto do relógio. 📸</p>}
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
        <div className="absolute inset-0 z-30 flex items-end justify-center bg-somma-black/70 p-4 sm:items-center" onClick={() => setConfirmFinish(false)}>
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
