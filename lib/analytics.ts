// Stub leve de analytics. Dispara eventos nomeados; hoje envia pro dataLayer/gtag
// se existirem e loga em dev. Pronto pra plugar GA4/Vercel Analytics depois.

export type ContestEvent =
  | 'contest_viewed'
  | 'contest_registration_started'
  | 'contest_registration_completed'
  | 'contest_entry_published'
  | 'contest_vote_started'
  | 'contest_vote_completed'
  | 'contest_share_clicked'
  | 'contest_ranking_viewed'

export function track(event: ContestEvent | string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  try {
    const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void }
    if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event, ...props })
    if (typeof w.gtag === 'function') w.gtag('event', event, props || {})
    if (process.env.NODE_ENV !== 'production') console.debug('[track]', event, props || {})
  } catch {
    /* nunca quebra a UI por causa de tracking */
  }
}
