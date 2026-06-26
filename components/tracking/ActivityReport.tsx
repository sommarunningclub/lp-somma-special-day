'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { loadMapsLib, mapsAvailable, DARK_SOMMA_STYLE } from './maps'
import { compressImage } from '@/components/concurso/image'
import { fmtDistance, fmtDuration, fmtPace } from '@/lib/tracking/format'
import type { TrackSession, TrackPoint, WatchMetrics, Consolidated } from '@/lib/tracking/types'
import type { Split } from '@/lib/tracking/analytics'

const CONF: Record<string, { txt: string; cls: string }> = {
  alta: { txt: 'Alta confiança', cls: 'bg-[#1faa59]/15 text-[#1faa59]' },
  media: { txt: 'Confiança média', cls: 'bg-somma-yellow/20 text-somma-yellow' },
  baixa: { txt: 'Divergência alta', cls: 'bg-red-500/15 text-red-300' },
  gps: { txt: 'Só GPS', cls: 'bg-somma-cream/10 text-somma-cream/60' },
}

const TIPO: Record<string, string> = { rua: 'Corrida na rua', esteira: 'Esteira', caminhada: 'Caminhada' }

export default function ActivityReport({
  token,
  session,
  points,
  splits,
  elevation,
}: {
  token: string
  session: TrackSession
  points: TrackPoint[]
  splits: Split[]
  elevation: { gain: number; series: number[]; hasData: boolean }
}) {
  const mapDiv = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<string | null>(session.watch_photo_signed ?? null)
  const [metrics, setMetrics] = useState<WatchMetrics | null>((session.watch_metrics as WatchMetrics) ?? null)
  const [consolidated, setConsolidated] = useState<Consolidated | null>((session.consolidated as Consolidated) ?? null)
  const [report, setReport] = useState<string | null>(session.ai_report ?? null)
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!mapsAvailable() || !mapDiv.current) return
    const valid = points.filter((p) => p.is_valid !== false).map((p) => ({ lat: Number(p.latitude), lng: Number(p.longitude) }))
    if (valid.length < 2) return
    let cancelled = false
    ;(async () => {
      const { Map } = await loadMapsLib('maps')
      if (cancelled || !mapDiv.current) return
      const map = new Map(mapDiv.current, { center: valid[0], zoom: 15, styles: DARK_SOMMA_STYLE, disableDefaultUI: true, gestureHandling: 'greedy', backgroundColor: '#1d1d1d' })
      new google.maps.Polyline({ map, path: valid, strokeColor: '#FF4800', strokeWeight: 5, strokeOpacity: 0.95 })
      new google.maps.Marker({ map, position: valid[0], label: { text: 'A', color: '#fff' } })
      new google.maps.Marker({ map, position: valid[valid.length - 1], label: { text: 'B', color: '#fff' } })
      const b = new google.maps.LatLngBounds()
      valid.forEach((p) => b.extend(p))
      map.fitBounds(b, 40)
    })()
    return () => {
      cancelled = true
    }
  }, [points])

  async function enviarFoto(file: File) {
    setBusy(true)
    setErro(null)
    try {
      const dataUrl = await compressImage(file, 'original')
      const res = await fetch('/api/tracking/gps-somma/watch-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, photo: dataUrl }),
      })
      const j = await res.json()
      if (res.ok) {
        setPhoto(j.photo ?? dataUrl)
        setMetrics(j.metrics ?? null)
        setConsolidated(j.consolidated ?? null)
        setReport(j.report ?? null)
      } else {
        setPhoto(dataUrl)
        setErro(j.code === 'no_key' ? 'IA ainda não configurada (falta a chave da OpenAI). A foto foi guardada.' : j.error ?? 'Não foi possível gerar o relatório.')
      }
    } catch {
      setErro('Erro ao processar a foto.')
    } finally {
      setBusy(false)
    }
  }

  const maxPace = Math.max(1, ...splits.map((s) => s.pace))
  const elev = elevation.series
  const dispDist = consolidated?.distance_m ?? Number(session.total_distance_m || 0)
  const dispDur = consolidated?.duration_seconds ?? Number(session.total_duration_seconds || 0)
  const dispPace = consolidated?.pace_seconds_per_km ?? session.average_pace_seconds_per_km
  const conf = consolidated ? CONF[consolidated.confidence] ?? CONF.gps : null

  return (
    <main className="min-h-[100svh] bg-somma-black px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(1.2rem+env(safe-area-inset-top))] text-somma-cream">
      <div className="mx-auto max-w-md space-y-5">
        <div className="flex items-center justify-between">
          <Link href="/tracking/gps-somma" className="font-dm text-sm font-bold uppercase tracking-wide text-somma-orange">← Início</Link>
          <button
            onClick={() => {
              const url = window.location.href
              if (navigator.share) navigator.share({ title: 'Meu corre SOMMA', url }).catch(() => {})
              else navigator.clipboard.writeText(url).then(() => alert('Link copiado!'))
            }}
            className="rounded-full border border-somma-cream/25 px-4 py-1.5 font-dm text-xs font-bold"
          >
            Compartilhar
          </button>
        </div>

        <header>
          <p className="font-dm text-[11px] font-bold uppercase tracking-[0.3em] text-somma-orange">{TIPO[session.activity_type] ?? 'Corrida'}</p>
          <h1 className="font-bebas text-4xl leading-none">{session.participant_name}</h1>
          <p className="mt-1 font-dm text-sm text-somma-cream/60">
            {session.reference_location_name ?? 'Corre livre'}
            {session.started_at ? ` · ${new Date(session.started_at).toLocaleString('pt-BR')}` : ''}
          </p>
        </header>

        <div>
          <div className="grid grid-cols-3 gap-3">
            <Box label="Distância" value={fmtDistance(dispDist)} />
            <Box label="Tempo" value={fmtDuration(dispDur)} />
            <Box label="Ritmo médio" value={fmtPace(dispPace)} />
          </div>
          {consolidated && (
            <p className="mt-1.5 text-center font-dm text-[10px] font-bold uppercase tracking-widest text-somma-cream/40">
              Resultado consolidado · GPS + relógio
            </p>
          )}
        </div>

        {mapsAvailable() && points.some((p) => p.is_valid !== false) && (
          <div className="overflow-hidden rounded-3xl border-2 border-somma-cream/15">
            <div ref={mapDiv} className="h-64 w-full bg-somma-cream/5" />
          </div>
        )}

        {/* Splits por km */}
        {splits.length > 0 && (
          <section>
            <h2 className="mb-2 font-bebas text-2xl tracking-widest text-somma-yellow">Parciais por km</h2>
            <div className="space-y-1.5">
              {splits.map((s) => (
                <div key={s.km} className="flex items-center gap-2">
                  <span className="w-10 shrink-0 font-bebas text-lg text-somma-cream/80">{s.partial ? `${s.fraction}` : s.km}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded bg-somma-cream/10">
                    <div className="h-full rounded bg-somma-orange" style={{ width: `${Math.max(12, (s.pace / maxPace) * 100)}%` }} />
                  </div>
                  <span className="w-20 shrink-0 text-right font-dm text-xs font-bold text-somma-cream/80">{fmtPace(s.pace)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Elevação */}
        {elevation.hasData && elev.length > 1 && (
          <section>
            <h2 className="mb-2 font-bebas text-2xl tracking-widest text-somma-yellow">Elevação · +{elevation.gain}m</h2>
            <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-20 w-full rounded-2xl border-2 border-somma-cream/15 bg-somma-cream/[0.04]">
              <polyline
                fill="none"
                stroke="#FDB716"
                strokeWidth="1.5"
                points={elev
                  .map((v, i) => {
                    const min = Math.min(...elev)
                    const max = Math.max(...elev)
                    const x = (i / (elev.length - 1)) * 100
                    const y = 26 - ((v - min) / Math.max(1, max - min)) * 24
                    return `${x},${y}`
                  })
                  .join(' ')}
              />
            </svg>
          </section>
        )}

        {/* Relatório com foto do relógio (IA) */}
        <section className="rounded-3xl border-2 border-somma-cream/15 bg-somma-cream/[0.04] p-5">
          <h2 className="font-bebas text-2xl tracking-widest text-somma-yellow">Relatório com IA</h2>
          <p className="mt-1 font-dm text-xs text-somma-cream/55">Tire uma foto da tela final do seu relógio (Garmin, Polar, etc). A IA lê as métricas e gera o resumo do corre.</p>

          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Foto do relógio" className="mt-4 w-full rounded-2xl border-2 border-somma-cream/15 object-contain" />
          )}

          {consolidated ? (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {conf && <span className={`rounded-full px-3 py-1 font-dm text-[11px] font-bold uppercase tracking-wide ${conf.cls}`}>{conf.txt}</span>}
                {consolidated.discrepancy_distance_pct != null && (
                  <span className="rounded-full bg-somma-cream/10 px-3 py-1 font-dm text-[11px] font-bold text-somma-cream/70">GPS × relógio: {consolidated.discrepancy_distance_pct}%</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {consolidated.avg_hr != null && <Tag label="FC média" value={`${consolidated.avg_hr} bpm`} />}
                {consolidated.max_hr != null && <Tag label="FC máx" value={`${consolidated.max_hr} bpm`} />}
                {consolidated.calories != null && <Tag label="Calorias" value={`${consolidated.calories}`} />}
                {consolidated.cadence != null && <Tag label="Cadência" value={`${consolidated.cadence} spm`} />}
                {consolidated.elevation_gain_m != null && <Tag label="Elevação" value={`+${consolidated.elevation_gain_m} m`} />}
                {metrics?.device && <Tag label="Aparelho" value={String(metrics.device)} />}
              </div>
              <p className="font-dm text-[11px] leading-relaxed text-somma-cream/45">
                Distância oficial: <span className="text-somma-cream/70">{fmtDistance(consolidated.distance_m ?? 0)}</span> (fonte: {consolidated.distance_source === 'watch' ? 'relógio' : 'GPS'})
                {session.calibration_factor != null && <> · calibração registrada (fator {session.calibration_factor})</>}
              </p>
            </div>
          ) : metrics ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {metrics.device && <Tag label="Aparelho" value={String(metrics.device)} />}
              {metrics.distance_km != null && <Tag label="Distância" value={`${metrics.distance_km} km`} />}
              {metrics.avg_pace && <Tag label="Pace" value={String(metrics.avg_pace)} />}
              {metrics.avg_hr != null && <Tag label="FC média" value={`${metrics.avg_hr} bpm`} />}
            </div>
          ) : null}

          {report && <p className="mt-4 whitespace-pre-line rounded-2xl bg-somma-orange/10 p-4 font-dm text-sm leading-relaxed text-somma-cream/90">{report}</p>}

          {erro && <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 font-dm text-sm text-red-300">{erro}</p>}

          <button onClick={() => fileRef.current?.click()} disabled={busy} className="mt-4 w-full rounded-2xl border-4 border-somma-cream bg-somma-orange px-3 py-3.5 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#000] disabled:opacity-60">
            {busy ? 'LENDO A FOTO…' : report ? 'Enviar outra foto' : '📸 Foto do relógio → gerar relatório'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.currentTarget.files?.[0]; if (f) enviarFoto(f); e.currentTarget.value = '' }} />
        </section>
      </div>
    </main>
  )
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-somma-cream/12 bg-somma-cream/[0.05] p-3 text-center">
      <p className="font-bebas text-2xl leading-none text-somma-cream">{value}</p>
      <p className="mt-1 font-dm text-[10px] font-bold uppercase tracking-widest text-somma-cream/50">{label}</p>
    </div>
  )
}
function Tag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-somma-cream/12 bg-somma-black/40 p-2 text-center">
      <p className="font-bebas text-lg leading-none text-somma-cream">{value}</p>
      <p className="font-dm text-[9px] font-bold uppercase tracking-widest text-somma-cream/45">{label}</p>
    </div>
  )
}
