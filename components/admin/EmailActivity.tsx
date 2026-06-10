export type EmailActivityItem = {
  id: string
  type: string
  link: string | null
  email: string | null
  created_at: string
  nome: string | null
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  clicked: { label: 'Clicou', cls: 'bg-purple-100 text-purple-700' },
  opened: { label: 'Abriu', cls: 'bg-orange-100 text-orange-700' },
  delivered: { label: 'Entregue', cls: 'bg-green-100 text-green-700' },
  sent: { label: 'Enviado', cls: 'bg-blue-100 text-blue-700' },
  bounced: { label: 'Bounce', cls: 'bg-red-100 text-red-700' },
  complained: { label: 'Spam', cls: 'bg-red-100 text-red-700' },
}

function tidyLink(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname.includes('tfsports')) return 'Comprar inscrição (app TF)'
    if (u.hostname.includes('apps.apple')) return 'App Store (iPhone)'
    if (u.hostname.includes('play.google')) return 'Google Play (Android)'
    if (u.hostname.includes('instagram')) return 'Instagram'
    return u.hostname.replace('www.', '') + u.pathname.slice(0, 24)
  } catch {
    return url
  }
}

export default function EmailActivity({ items }: { items: EmailActivityItem[] }) {
  return (
    <div className="mb-8 rounded-2xl border-4 border-purple-300/40 bg-white p-5 md:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-bebas text-2xl tracking-wider text-purple-700">Atividade recente</h2>
        <span className="font-dm text-xs text-somma-black/50">aberturas e cliques</span>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center font-dm text-sm text-somma-black/45">
          Nenhuma abertura ou clique registrado ainda. Aparece aqui assim que o webhook do Resend começar a receber eventos.
        </p>
      ) : (
        <ul className="divide-y divide-somma-black/[0.06]">
          {items.map((it) => {
            const badge = TYPE_BADGE[it.type] ?? { label: it.type, cls: 'bg-gray-100 text-gray-700' }
            return (
              <li key={it.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-dm text-[11px] font-bold uppercase tracking-wider ${badge.cls}`}>
                  {badge.label}
                </span>
                <span className="font-dm text-sm font-semibold text-somma-black">{it.nome ?? it.email ?? '—'}</span>
                {it.email && it.nome && <span className="font-dm text-xs text-somma-black/45">{it.email}</span>}
                {it.type === 'clicked' && it.link && (
                  <span className="font-dm text-xs text-purple-700">→ {tidyLink(it.link)}</span>
                )}
                <span className="ml-auto font-dm text-xs text-somma-black/40">
                  {new Date(it.created_at).toLocaleString('pt-BR')}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
