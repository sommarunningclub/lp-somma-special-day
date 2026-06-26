import 'server-only'

type Ctx = {
  activity_type: string
  reference?: string | null
  gps_distance_km: number
  gps_duration_seconds: number
  gps_pace_seconds_per_km?: number | null
  splits: { km: number; seconds: number; partial?: boolean }[]
}

type Result =
  | { error: 'no_key' }
  | { error: 'api'; status: number }
  | { metrics: Record<string, unknown> | null; report: string | null }

// Lê a foto da tela do relógio (Garmin/Polar/etc) e gera métricas + relatório (OpenAI Vision).
export async function watchAiReport(imageDataUrl: string, ctx: Ctx): Promise<Result> {
  const key = process.env.OPENAI_API_KEY
  if (!key) return { error: 'no_key' }
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  const system = [
    'Você é o assistente de corrida do SOMMA Run Club.',
    'Recebe a foto da TELA FINAL de um relógio esportivo (Garmin, Polar, Coros, Apple Watch, etc).',
    'Leia com cuidado os números do visor e devolva SOMENTE um JSON válido no formato:',
    '{"metrics":{"distance_km":number|null,"duration":string|null,"duration_seconds":number|null,"avg_pace":string|null,"avg_pace_seconds_per_km":number|null,"avg_hr":number|null,"max_hr":number|null,"calories":number|null,"elevation_gain_m":number|null,"cadence":number|null,"device":string|null,"raw_text":string},',
    '"report":string}.',
    'No "report": um texto curto (3-5 frases), em português BR, tom de comunidade/parça, combinando os dados do relógio com o GPS do app. Destaque distância, ritmo e um elogio honesto. Sem inventar métricas que não aparecem. Não use travessões.',
  ].join(' ')

  const userText = `Dados do nosso GPS (referência): tipo=${ctx.activity_type}; distancia_gps_km=${ctx.gps_distance_km.toFixed(2)}; duracao_seg=${ctx.gps_duration_seconds}; pace_seg_km=${ctx.gps_pace_seconds_per_km ?? 'n/d'}; splits=${JSON.stringify(ctx.splits.slice(0, 20))}. A imagem é a tela do relógio do corredor.`

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: [{ type: 'text', text: userText }, { type: 'image_url', image_url: { url: imageDataUrl } }] },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 900,
        temperature: 0.4,
      }),
    })
    if (!r.ok) {
      console.error('[openai] status', r.status)
      return { error: 'api', status: r.status }
    }
    const j = await r.json()
    const content = j.choices?.[0]?.message?.content ?? '{}'
    try {
      const parsed = JSON.parse(content)
      return { metrics: parsed.metrics ?? null, report: parsed.report ?? null }
    } catch {
      return { metrics: null, report: typeof content === 'string' ? content : null }
    }
  } catch (e) {
    console.error('[openai] erro', e)
    return { error: 'api', status: 0 }
  }
}
