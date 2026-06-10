import type { ListaVipLead } from '@/components/admin/LeadManager'

function pct(part: number, total: number): string {
  if (total <= 0) return '0%'
  return `${Math.round((part / total) * 100)}%`
}

export default function EmailStatsDashboard({ leads }: { leads: ListaVipLead[] }) {
  const total = leads.length
  const enviados = leads.filter((l) => l.email_sent_at || l.email_status).length
  const entregues = leads.filter((l) => l.email_delivered_at).length
  const abertos = leads.filter((l) => l.email_opened_at).length
  const clicados = leads.filter((l) => l.email_clicked_at).length
  const bounces = leads.filter((l) => l.email_status === 'bounced' || l.email_status === 'complained' || l.email_status === 'failed').length

  const base = enviados || total

  const cards = [
    { label: 'Cadastros', value: total, sub: 'total na lista', color: 'text-somma-blue' },
    { label: 'Enviados', value: enviados, sub: pct(enviados, total) + ' dos cadastros', color: 'text-somma-black' },
    { label: 'Entregues', value: entregues, sub: pct(entregues, base) + ' dos enviados', color: 'text-green-600' },
    { label: 'Abertos', value: abertos, sub: pct(abertos, base) + ' dos enviados', color: 'text-somma-orange' },
    { label: 'Clicaram', value: clicados, sub: pct(clicados, base) + ' dos enviados', color: 'text-purple-600' },
    { label: 'Falhas', value: bounces, sub: 'bounce / spam', color: 'text-red-600' },
  ]

  return (
    <div className="mb-8 rounded-2xl border-4 border-somma-orange/30 bg-white p-5 md:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-bebas text-2xl tracking-wider text-somma-orange">E-mails · Engajamento</h2>
        <span className="font-dm text-xs text-somma-black/50">cupom SOMMAVIP</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-somma-black/[0.04] px-3 py-4 text-center">
            <p className={`font-bebas text-4xl leading-none tracking-wide ${c.color}`}>{c.value}</p>
            <p className="mt-1.5 font-dm text-[11px] font-bold uppercase tracking-wider text-somma-black/60">{c.label}</p>
            <p className="mt-0.5 font-dm text-[10px] text-somma-black/40">{c.sub}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 font-dm text-[11px] leading-relaxed text-somma-black/45">
        As aberturas e cliques dependem do webhook do Resend configurado e do rastreamento (open/click) ativado no domínio.
        Os números aparecem conforme os e-mails são entregues e os destinatários interagem.
      </p>
    </div>
  )
}
