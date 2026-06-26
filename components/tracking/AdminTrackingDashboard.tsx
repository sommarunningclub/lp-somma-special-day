'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { loadMapsLib, mapsAvailable, DARK_SOMMA_STYLE } from './maps'
import { fmtDistance, fmtDuration, fmtPace } from '@/lib/tracking/format'
import type { TrackSession } from '@/lib/tracking/types'

const COR: Record<string, string> = { running: '#FF4800', paused: '#FDB716', finished: '#9aa0a6', created: '#005EFF', cancelled: '#666' }

function haAtras(iso: string | null): string {
  if (!iso) return '—'
  const s = Math.round((Date.now() - Date.parse(iso)) / 1000)
  if (s < 60) return `${s}s atrás`
  if (s < 3600) return `${Math.floor(s / 60)}min atrás`
  return `${Math.floor(s / 3600)}h atrás`
}
const aoVivo = (s: TrackSession) => s.status === 'running' && s.last_point_at != null && Date.now() - Date.parse(s.last_point_at) < 15000

export default function AdminTrackingDashboard() {
  const [sessions, setSessions] = useState<TrackSession[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const mapDiv = useRef<HTMLDivElement>(null)
  const map = useRef<google.maps.Map | null>(null)
  const markers = useRef<Map<string, google.maps.Marker>>(new Map())

  useEffect(() => {
    let cancelled = false
    if (mapsAvailable() && mapDiv.current) {
      ;(async () => {
        const { Map } = await loadMapsLib('maps')
        if (cancelled || !mapDiv.current) return
        map.current = new Map(mapDiv.current, { center: { lat: -15.7939, lng: -47.8828 }, zoom: 12, styles: DARK_SOMMA_STYLE, disableDefaultUI: true, gestureHandling: 'greedy', backgroundColor: '#1d1d1d' })
      })()
    }
    async function poll() {
      try {
        const res = await fetch('/api/tracking/gps-somma/admin/sessions')
        if (res.status === 401) {
          setErro('Sessão de admin expirada. Faça login novamente.')
          return
        }
        const j = await res.json()
        if (!cancelled) {
          setSessions(j.sessions ?? [])
          setErro(null)
        }
      } catch {
        /* mantém */
      }
    }
    poll()
    const id = setInterval(poll, 2000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  // atualiza marcadores no mapa
  useEffect(() => {
    if (!map.current) return
    const vistos = new Set<string>()
    for (const s of sessions) {
      if (s.latest_lat == null || s.latest_lng == null) continue
      vistos.add(s.id)
      const pos = { lat: Number(s.latest_lat), lng: Number(s.latest_lng) }
      const icon: google.maps.Symbol = { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: COR[s.status] ?? '#fff', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }
      const m = markers.current.get(s.id)
      if (m) {
        m.setPosition(pos)
        m.setIcon(icon)
      } else {
        markers.current.set(s.id, new google.maps.Marker({ map: map.current, position: pos, title: s.participant_name, icon }))
      }
    }
    for (const [id, m] of markers.current) if (!vistos.has(id)) { m.setMap(null); markers.current.delete(id) }
  }, [sessions])

  const ativos = sessions.filter((s) => s.status === 'running' || s.status === 'paused')

  return (
    <main className="min-h-screen bg-somma-black px-4 py-6 text-somma-cream md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-dm text-[11px] font-bold uppercase tracking-[0.3em] text-somma-orange">SOMMA GPS · Admin</p>
            <h1 className="font-bebas text-4xl tracking-wide">Painel ao vivo</h1>
          </div>
          <Link href="/admin" className="rounded-xl border-2 border-somma-cream/30 px-4 py-2 font-bebas tracking-widest">← Admin</Link>
        </div>

        {erro && <p className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 font-dm text-sm text-red-300">{erro}</p>}

        <div className="mb-5 overflow-hidden rounded-3xl border-2 border-somma-cream/15">
          <div ref={mapDiv} className="h-64 w-full bg-somma-cream/5 md:h-80" />
        </div>

        <p className="mb-3 font-bebas text-2xl tracking-widest text-somma-yellow">{ativos.length} sessão(ões) ativa(s) · {sessions.length} no total</p>

        <div className="grid gap-3">
          {sessions.length === 0 && <p className="rounded-2xl border-2 border-dashed border-somma-cream/15 p-8 text-center font-dm text-sm text-somma-cream/50">Nenhuma sessão ainda.</p>}
          {sessions.map((s) => (
            <Link key={s.id} href={`/tracking/gps-somma/admin/sessoes/${s.id}`} className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-somma-cream/15 bg-somma-cream/[0.04] p-4 transition-colors hover:border-somma-orange/60">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: COR[s.status] ?? '#fff', boxShadow: aoVivo(s) ? `0 0 10px ${COR[s.status]}` : 'none' }} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-dm text-base font-bold text-somma-cream">{s.participant_name}</p>
                <p className="truncate font-dm text-xs text-somma-cream/55">
                  {s.status} · {aoVivo(s) ? 'ao vivo' : haAtras(s.last_point_at)} · precisão {s.latest_accuracy_m ? `${Math.round(Number(s.latest_accuracy_m))}m` : '—'}
                </p>
              </div>
              <div className="flex gap-4 text-right">
                <Stat l="Dist" v={fmtDistance(Number(s.total_distance_m || 0))} />
                <Stat l="Tempo" v={fmtDuration(Number(s.total_duration_seconds || 0))} />
                <Stat l="Ritmo" v={fmtPace(s.average_pace_seconds_per_km)} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="min-w-[64px]">
      <p className="font-bebas text-lg leading-none text-somma-cream">{v}</p>
      <p className="font-dm text-[10px] font-bold uppercase tracking-wide text-somma-cream/45">{l}</p>
    </div>
  )
}
