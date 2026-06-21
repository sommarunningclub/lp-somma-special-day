'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateNutricaoStep, sendNutricaoTest } from '@/actions/nutricao-admin'
import type { StepWithMetrics, LeadView, NutricaoAdminView } from '@/lib/nutricao/admin-view'

interface Props {
  view: NutricaoAdminView
}

const THEME_COLOR: Record<string, { bg: string; text: string; accent: string }> = {
  normal: { bg: '#1f2937', text: '#9ca3af', accent: '#60a5fa' },
  alerta: { bg: '#2a2118', text: '#facc15', accent: '#facc15' },
  final:  { bg: '#2a1410', text: '#fb923c', accent: '#fb923c' },
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  ativo:    { label: 'Em fluxo',    color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  completo: { label: 'Completou',   color: 'bg-green-500/20 text-green-300 border-green-500/40' },
  unsub:    { label: 'Descadastr.', color: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40' },
}

function leadStatus(l: LeadView): 'ativo' | 'completo' | 'unsub' {
  if (l.unsubscribed_at) return 'unsub'
  if (l.completed_at) return 'completo'
  return 'ativo'
}

function offsetLabel(h: number): string {
  if (h === 0) return 'Imediato'
  if (h < 24) return `${h}h após cadastro`
  const d = Math.round(h / 24)
  return `${d}d após cadastro`
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function NutricaoManager({ view }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedStep, setSelectedStep] = useState<StepWithMetrics | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  // Edição local do passo
  const [draft, setDraft] = useState<Partial<StepWithMetrics> | null>(null)

  function openStep(step: StepWithMetrics) {
    setSelectedStep(step)
    setDraft({ ...step })
  }

  function closePanel() {
    setSelectedStep(null)
    setDraft(null)
  }

  function showToast(type: 'ok' | 'err', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  function handleSave() {
    if (!selectedStep || !draft) return
    startTransition(async () => {
      const result = await updateNutricaoStep(selectedStep.step, {
        subject: draft.subject,
        kicker: draft.kicker,
        headline: draft.headline,
        selo: draft.selo,
        message: draft.message,
        cta: draft.cta,
        theme: draft.theme,
        enabled: draft.enabled,
      })
      if (result.success) {
        showToast('ok', 'Passo salvo')
        router.refresh()
      } else {
        showToast('err', result.error)
      }
    })
  }

  function handleTest() {
    if (!selectedStep) return
    if (!testEmail) {
      showToast('err', 'Informe um e-mail de teste')
      return
    }
    startTransition(async () => {
      const result = await sendNutricaoTest(selectedStep.step, testEmail)
      if (result.success) showToast('ok', `Teste enviado para ${testEmail}`)
      else showToast('err', result.error)
    })
  }

  function handleQuickToggle(step: StepWithMetrics) {
    startTransition(async () => {
      const result = await updateNutricaoStep(step.step, { enabled: !step.enabled })
      if (result.success) {
        showToast('ok', step.enabled ? 'Passo desativado' : 'Passo ativado')
        router.refresh()
      } else {
        showToast('err', result.error)
      }
    })
  }

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border-4 border-somma-black bg-[#0b1220] text-zinc-200 shadow-[6px_6px_0_#FF4800]">
      {/* HEADER (estilo top-bar n8n) */}
      <div className="flex flex-col gap-3 border-b-2 border-white/10 bg-[#0a1018] px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-somma-orange font-bebas text-xl text-white">
            N
          </div>
          <div>
            <h2 className="font-bebas text-2xl tracking-widest text-white md:text-3xl">Automação · Nutrição</h2>
            <p className="font-dm text-xs text-zinc-400">4 passos · 7 dias · captura na home</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatBadge label="Total" value={view.totals.total} color="#60a5fa" />
          <StatBadge label="Em fluxo" value={view.totals.ativos} color="#34d399" />
          <StatBadge label="Completos" value={view.totals.completos} color="#fbbf24" />
          <StatBadge label="Descadastr." value={view.totals.unsub} color="#9ca3af" />
        </div>
      </div>

      {/* MAIN: canvas (esquerda) + properties (direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px]">
        {/* CANVAS — vertical flow de cards */}
        <div className="relative px-6 py-8 md:px-10 md:py-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '20px 20px' }}>
          <div className="mx-auto flex max-w-md flex-col items-center gap-0">
            {view.steps.map((step, i) => (
              <div key={step.step} className="flex w-full flex-col items-center">
                <NodeCard
                  step={step}
                  selected={selectedStep?.step === step.step}
                  onSelect={() => openStep(step)}
                  onToggle={() => handleQuickToggle(step)}
                />
                {i < view.steps.length - 1 && <Connector />}
              </div>
            ))}

            {/* Indicador de branch */}
            <div className="mt-6 w-full rounded-xl border-2 border-dashed border-orange-500/40 bg-orange-500/10 p-4 font-dm text-xs leading-relaxed text-orange-200">
              <p className="font-bold uppercase tracking-widest text-orange-300">🔀 Regra de branch</p>
              <p className="mt-1">Quando o lead clica no CTA de <strong>qualquer e-mail</strong>, o próximo tick do cron envia direto a <strong>Oferta final (#04)</strong> e o lead sai do fluxo.</p>
            </div>
          </div>
        </div>

        {/* PROPERTIES PANEL */}
        <aside className={`border-l-2 border-white/10 bg-[#0a1018] ${selectedStep ? 'block' : 'hidden lg:block'}`}>
          {!selectedStep || !draft ? (
            <div className="flex h-full min-h-[400px] items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-2xl">⚙️</div>
                <p className="font-dm text-sm text-zinc-400">Clique em um passo do fluxo<br/>para editar seu conteúdo.</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="font-dm text-[10px] uppercase tracking-widest text-zinc-500">Editando</p>
                  <h3 className="font-bebas text-xl tracking-wider text-white">{selectedStep.selo}</h3>
                </div>
                <button onClick={closePanel} aria-label="Fechar" className="text-zinc-400 hover:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <FieldGroup label="Geral">
                  <Toggle label="Passo ativo" checked={draft.enabled ?? true} onChange={(v) => setDraft({ ...draft, enabled: v })} />
                  <Select
                    label="Tema visual"
                    value={draft.theme ?? 'normal'}
                    onChange={(v) => setDraft({ ...draft, theme: v as 'normal' | 'alerta' | 'final' })}
                    options={[
                      { value: 'normal', label: 'Normal (azul)' },
                      { value: 'alerta', label: 'Alerta (amarelo)' },
                      { value: 'final',  label: 'Final (laranja)' },
                    ]}
                  />
                </FieldGroup>

                <FieldGroup label="Conteúdo do e-mail">
                  <Field label="Assunto (subject)" value={draft.subject ?? ''} onChange={(v) => setDraft({ ...draft, subject: v })} />
                  <Field label="Selo (badge superior)" value={draft.selo ?? ''} onChange={(v) => setDraft({ ...draft, selo: v })} />
                  <Field label="Kicker" value={draft.kicker ?? ''} onChange={(v) => setDraft({ ...draft, kicker: v })} />
                  <Field label="Headline (título grande)" value={draft.headline ?? ''} onChange={(v) => setDraft({ ...draft, headline: v })} />
                  <TextareaField label="Mensagem (corpo)" value={draft.message ?? ''} rows={6} onChange={(v) => setDraft({ ...draft, message: v })} />
                  <Field label="CTA (texto do botão)" value={draft.cta ?? ''} onChange={(v) => setDraft({ ...draft, cta: v })} />
                </FieldGroup>

                <FieldGroup label="Regras (não-editáveis)">
                  <ReadOnly label="Disparo" value={offsetLabel(selectedStep.offsetHours)} />
                  <ReadOnly label="Ordem" value={`#${String(selectedStep.ordem).padStart(2, '0')} de 4`} />
                  <ReadOnly label="Step key" value={selectedStep.step} />
                </FieldGroup>

                <FieldGroup label="Testar este passo">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-dm text-sm text-white placeholder:text-zinc-500 focus:border-somma-orange focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={isPending}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-dm text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-60"
                  >
                    Enviar teste
                  </button>
                </FieldGroup>
              </div>

              {/* Footer fixo */}
              <div className="border-t border-white/10 bg-[#080d14] px-5 py-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="w-full rounded-lg bg-somma-orange px-4 py-3 font-bebas text-base tracking-widest text-white transition-all hover:bg-orange-600 disabled:opacity-60"
                >
                  {isPending ? 'Salvando…' : 'Salvar alterações'}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* BASE DE LEADS */}
      <div className="border-t-2 border-white/10 bg-[#0a1018]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h3 className="font-bebas text-xl tracking-widest text-white">Base de leads</h3>
            <p className="font-dm text-xs text-zinc-400">{view.leads.length} pessoa(s) — exibindo as {Math.min(view.leads.length, 100)} mais recentes</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full font-dm text-sm">
            <thead className="bg-white/5 text-left text-[10px] uppercase tracking-widest text-zinc-400">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Entrou em</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Último step</th>
                <th className="px-4 py-3 text-right">Abriu / Clicou</th>
              </tr>
            </thead>
            <tbody>
              {view.leads.slice(0, 100).map((l) => {
                const status = leadStatus(l)
                const badge = STATUS_BADGE[status]
                return (
                  <tr key={l.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                    <td className="px-4 py-3 text-white">{l.nome}</td>
                    <td className="px-4 py-3 text-zinc-300">{l.email}</td>
                    <td className="px-4 py-3 text-zinc-400">{fmtDate(l.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {l.last_step ? (
                        <>
                          <span className="font-mono text-xs">{l.last_step}</span>
                          <div className="text-[10px] text-zinc-500">{fmtDate(l.last_step_at)}</div>
                        </>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300">
                      <span className="font-mono">{l.email_open_count}</span> / <span className="font-mono">{l.email_click_count}</span>
                    </td>
                  </tr>
                )
              })}
              {view.leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                    Nenhum lead capturado ainda. Cadastre um e-mail no form da home pra testar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className={`pointer-events-none fixed right-6 top-6 z-50 rounded-xl border px-5 py-3 font-dm text-sm shadow-2xl ${
          toast.type === 'ok' ? 'border-green-500/40 bg-green-500/15 text-green-300' : 'border-red-500/40 bg-red-500/15 text-red-300'
        }`}>
          {toast.msg}
        </div>
      )}
    </section>
  )
}

/* =============================== Sub-componentes =============================== */

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <span className="font-bebas text-xl text-white">{value}</span>
      <span className="font-dm text-[10px] uppercase tracking-widest" style={{ color }}>{label}</span>
    </div>
  )
}

function NodeCard({ step, selected, onSelect, onToggle }: { step: StepWithMetrics; selected: boolean; onSelect: () => void; onToggle: () => void }) {
  const theme = THEME_COLOR[step.theme]
  const disabled = !step.enabled
  return (
    <div
      onClick={onSelect}
      className={`relative w-full cursor-pointer rounded-xl border-2 bg-[#141b2f] px-5 py-4 transition-all hover:border-somma-orange/60 ${
        selected ? 'border-somma-orange shadow-[0_0_0_3px_rgba(255,72,0,0.15)]' : 'border-white/10'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase" style={{ background: theme.bg, color: theme.accent }}>
            #{String(step.ordem).padStart(2, '0')}
          </div>
          <div>
            <p className="font-dm text-[10px] uppercase tracking-widest text-zinc-500">{offsetLabel(step.offsetHours)}</p>
            <p className="font-bebas text-base tracking-wider text-white">{step.selo}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          className={`h-5 w-9 shrink-0 rounded-full transition-colors ${step.enabled ? 'bg-somma-orange' : 'bg-zinc-700'}`}
          aria-label={step.enabled ? 'Desativar' : 'Ativar'}
        >
          <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${step.enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
        </button>
      </div>

      <p className="mt-3 line-clamp-2 font-dm text-sm text-zinc-300">{step.subject}</p>

      <div className="mt-3 flex items-center gap-4 border-t border-white/5 pt-3 font-dm text-[11px] text-zinc-400">
        <span><span className="font-bold text-white">{step.enviados}</span> envios</span>
        <span><span className="font-bold text-white">{step.aberturas}</span> aberturas</span>
        <span><span className="font-bold text-white">{step.cliques}</span> cliques</span>
      </div>
    </div>
  )
}

function Connector() {
  return (
    <div className="my-1 flex h-8 items-center justify-center">
      <svg width="2" height="32" viewBox="0 0 2 32" className="text-white/15">
        <line x1="1" y1="0" x2="1" y2="32" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
      </svg>
    </div>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 font-dm text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block font-dm text-[11px] text-zinc-400">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-[#0a1018] px-3 py-2 font-dm text-sm text-white placeholder:text-zinc-600 focus:border-somma-orange focus:outline-none"
      />
    </div>
  )
}

function TextareaField({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="mb-1 block font-dm text-[11px] text-zinc-400">{label}</label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-md border border-white/10 bg-[#0a1018] px-3 py-2 font-dm text-sm text-white placeholder:text-zinc-600 focus:border-somma-orange focus:outline-none"
      />
    </div>
  )
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="mb-1 block font-dm text-[11px] text-zinc-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-[#0a1018] px-3 py-2 font-dm text-sm text-white focus:border-somma-orange focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="font-dm text-sm text-zinc-300">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-somma-orange' : 'bg-zinc-700'}`}
        aria-label={label}
      >
        <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
      </button>
    </label>
  )
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block font-dm text-[11px] text-zinc-400">{label}</label>
      <div className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 font-mono text-xs text-zinc-400">{value}</div>
    </div>
  )
}
