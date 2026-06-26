'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadMapsLib, mapsAvailable, DARK_SOMMA_STYLE } from './maps'
import { fmtDistance, fmtDuration, fmtPace } from '@/lib/tracking/format'
import type { TrackSession, TrackPoint } from '@/lib/tracking/types'

type Stats = { total: number; valid: number; rejected: number; avg_accuracy_m: number | null }

export default function SessionDetail({ session, points, stats }: { session: TrackSession; points: TrackPoint[]; stats: Stats }) {
  const router = useRouter()
  const mapDiv = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapsAvailable() || !mapDiv.current) return
    let cancelled = false
    ;(async () => {
      const { Map } = await loadMapsLib('maps')
      if (cancelled || !mapDiv.current) return
      const valid = points.filter((p) => p.is_valid !== false).map((p) => ({ lat: Number(p.latitude), lng: Number(p.longitude) }))
      const center = valid[0] ?? (session.reference_lat != null ? { lat: Number(session.reference_lat), lng: Number(session.reference_lng) } : { lat: -15.7939, lng: -47.8828 })
      const map = new Map(mapDiv.current, { center, zoom: 15, styles: DARK_SOMMA_STYLE, disableDefaultUI: true, gestureHandling: 'greedy', backgroundColor: '#1d1d1d' })

      if (session.planned_route_polyline) {
        try {
          const geo = await loadMapsLib('geometry')
          const path = geo.encoding.decodePath(session.planned_route_polyline)
          new google.maps.Polyline({ map, path, strokeOpacity: 0, icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.6, strokeColor: '#9aa0a6', scale: 3 }, offset: '0', repeat: '14px' }] })
        } catch {
          /* opcional */
        }
      }
      if (valid.length) {
        new google.maps.Polyline({ map, path: valid, strokeColor: '#FF4800', strokeWeight: 5, strokeOpacity: 0.95 })
        new google.maps.Marker({ map, position: valid[0], label: { text: 'A', color: '#fff' }, title: 'Início' })
        new google.maps.Marker({ map, position: valid[valid.length - 1], label: { text: 'B', color: '#fff' }, title: 'Fim' })
        const b = new google.maps.LatLngBounds()
        valid.forEach((p) => b.extend(p))
        map.fitBounds(b, 48)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session, points])

  return (
    <main className="min-h-screen bg-somma-black px-4 py-6 text-somma-cream md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/tracking/gps-somma/admin" className="font-dm text-sm font-bold uppercase tracking-wide text-somma-orange underline-offset-2 hover:underline">← Painel</Link>
          <button onClick={() => router.refresh()} className="rounded-xl border-2 border-somma-cream/30 px-4 py-2 font-bebas tracking-widest">Atualizar</button>
        </div>

        <h1 className="font-bebas text-4xl tracking-wide">{session.participant_name}</h1>
        <p className="mt-1 font-dm text-sm text-somma-cream/60">
          {session.reference_location_name ?? 'Corre livre'} · {session.status}
          {session.started_at ? ` · início ${new Date(session.started_at).toLocaleString('pt-BR')}` : ''}
          {session.finished_at ? ` · fim ${new Date(session.finished_at).toLocaleTimeString('pt-BR')}` : ''}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Card l="Distância" v={fmtDistance(Number(session.total_distance_m || 0))} />
          <Card l="Tempo" v={fmtDuration(Number(session.total_duration_seconds || 0))} />
          <Card l="Ritmo médio" v={fmtPace(session.average_pace_seconds_per_km)} />
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border-2 border-somma-cream/15">
          <div ref={mapDiv} className="h-80 w-full bg-somma-cream/5" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card l="Pontos válidos" v={String(stats.valid)} />
          <Card l="Rejeitados" v={String(stats.rejected)} />
          <Card l="Precisão média" v={stats.avg_accuracy_m != null ? `${stats.avg_accuracy_m}m` : '—'} />
          <Card l="Total pontos" v={String(stats.total)} />
        </div>
      </div>
    </main>
  )
}

function Card({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-2xl border border-somma-cream/12 bg-somma-cream/[0.05] p-3 text-center">
      <p className="font-bebas text-2xl leading-none text-somma-cream">{v}</p>
      <p className="mt-1 font-dm text-[10px] font-bold uppercase tracking-widest text-somma-cream/50">{l}</p>
    </div>
  )
}
