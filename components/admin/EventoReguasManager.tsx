'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateReguaSchedule, sendReguaTest, dispatchReguaNow } from '@/actions/evento'

export interface ReguaStepView {
  base: string
  step: string
  ordem: number
  dia: string
  sendAtLocal: string
  enabled: boolean
  subject: string
  status: 'pendente' | 'enviando' | 'enviado' | 'erro'
  enviados: number
  aberturas: number
  cliques: number
}

export interface ReguaGroup {
  base: string
  label: string
  descricao: string
  accent: string
  totalEligible: number
  steps: ReguaStepView[]
}

const STATUS_STYLE: Record<ReguaStepView['status'], string> = {
  pendente: 'bg-gray-100 text-gray-600',
  enviando: 'bg-yellow-100 text-yellow-700',
  enviado: 'bg-green-100 text-green-700',
  erro: 'bg-red-100 text-red-700',
}
const STATUS_LABEL: Record<ReguaStepView['status'], string> = {
  pendente: 'Agendado',
  enviando: 'Enviando…',
  enviado: 'Enviado',
  erro: 'Erro',
}

function GroupTable({
  group,
  testEmail,
  onMsg,
}: {
  group: ReguaGroup
  testEmail: string
  onMsg: (m: { type: 'ok' | 'err'; text: string } | null) => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [draft, setDraft] = useState<Record<string, { sendAtLocal: string; enabled: boolean }>>(
    Object.fromEntries(group.steps.map((s) => [s.step, { sendAtLocal: s.sendAtLocal, enabled: s.enabled }]))
  )
  const totalEnviado = group.steps.reduce((acc, s) => acc + s.enviados, 0)

  function patchDraft(step: string, patch: Partial<{ sendAtLocal: string; enabled: boolean }>) {
    setDraft((d) => ({ ...d, [step]: { ...d[step], ...patch } }))
  }

  function handleSave(step: string) {
    onMsg(null)
    const d = draft[step]
    startTransition(async () => {
      const res = await updateReguaSchedule(group.base, step, d.sendAtLocal, d.enabled)
      if (res.success) {
        onMsg({ type: 'ok', text: 'Agendamento salvo.' })
        router.refresh()
      } else onMsg({ type: 'err', text: res.error })
    })
  }

  function handleTest(step: string) {
    onMsg(null)
    if (!testEmail) {
      onMsg({ type: 'err', text: 'Digite um e-mail para o teste no topo do painel.' })
      return
    }
    startTransition(async () => {
      const res = await sendReguaTest(group.base, step, testEmail)
      onMsg(res.success ? { type: 'ok', text: `Teste enviado para ${testEmail}.` } : { type: 'err', text: res.error })
    })
  }

  function handleDispatch(step: string, subject: string) {
    onMsg(null)
    if (!confirm(`Disparar AGORA para os elegíveis de "${group.label}"?\n\n"${subject}"\n\nQuem já recebeu este passo será ignorado.`)) return
    startTransition(async () => {
      const res = await dispatchReguaNow(group.base, step)
      if (res.success) {
        onMsg({ type: 'ok', text: `Disparo concluído: ${res.data.sent} enviados, ${res.data.failed} falhas.` })
        router.refresh()
      } else onMsg({ type: 'err', text: res.error })
    })
  }

  return (
    <div className="mt-6 first:mt-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bebas text-xl tracking-wider" style={{ color: group.accent }}>
            {group.label}
          </h3>
          <p className="text-xs text-somma-black/55">{group.descricao}</p>
        </div>
        <div className="mt-1 flex flex-wrap gap-2 sm:mt-0">
          <span className="rounded-full bg-somma-blue/10 px-3 py-1 font-dm text-[11px] font-bold uppercase tracking-wide text-somma-blue">
            {group.totalEligible} elegíveis
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1 font-dm text-[11px] font-bold uppercase tracking-wide text-green-700">
            {totalEnviado} enviados
          </span>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-somma-black/10 font-dm text-[11px] uppercase tracking-wide text-somma-black/50">
              <th className="py-2 pr-3">#</th>
              <th className="py-2 pr-3">Dia</th>
              <th className="py-2 pr-3">Disparo (Brasília)</th>
              <th className="py-2 pr-3">Assunto</th>
              <th className="py-2 pr-3">Ativo</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3 text-center">Env.</th>
              <th className="py-2 pr-3 text-center">Abert.</th>
              <th className="py-2 pr-3 text-center">Cliq.</th>
              <th className="py-2 pr-3">Ações</th>
            </tr>
          </thead>
          <tbody className="font-dm text-sm">
            {group.steps.map((s) => {
              const d = draft[s.step]
              const dirty = d.sendAtLocal !== s.sendAtLocal || d.enabled !== s.enabled
              return (
                <tr key={s.step} className="border-b border-somma-black/5 align-top">
                  <td className="py-3 pr-3 font-bold text-somma-black/40">{s.ordem}</td>
                  <td className="py-3 pr-3 whitespace-nowrap">{s.dia}</td>
                  <td className="py-3 pr-3">
                    <input
                      type="datetime-local"
                      value={d.sendAtLocal}
                      onChange={(e) => patchDraft(s.step, { sendAtLocal: e.target.value })}
                      className="rounded-lg border border-somma-black/15 px-2 py-1.5 text-xs outline-none focus:border-somma-orange"
                    />
                  </td>
                  <td className="py-3 pr-3 max-w-[220px] text-xs text-somma-black/70">{s.subject}</td>
                  <td className="py-3 pr-3">
                    <input
                      type="checkbox"
                      checked={d.enabled}
                      onChange={(e) => patchDraft(s.step, { enabled: e.target.checked })}
                      className="h-4 w-4 accent-somma-orange"
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[s.status]}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-center font-bold">{s.enviados}</td>
                  <td className="py-3 pr-3 text-center text-somma-black/70">{s.aberturas}</td>
                  <td className="py-3 pr-3 text-center text-somma-black/70">{s.cliques}</td>
                  <td className="py-3 pr-3">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => handleSave(s.step)}
                        disabled={isPending || !dirty}
                        className="rounded-lg bg-somma-blue px-2.5 py-1 text-xs font-bold text-white disabled:opacity-40"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => handleTest(s.step)}
                        disabled={isPending}
                        className="rounded-lg border border-somma-black/20 px-2.5 py-1 text-xs font-bold text-somma-black disabled:opacity-40"
                      >
                        Teste
                      </button>
                      <button
                        onClick={() => handleDispatch(s.step, s.subject)}
                        disabled={isPending}
                        className="rounded-lg bg-somma-orange px-2.5 py-1 text-xs font-bold text-white disabled:opacity-40"
                      >
                        Disparar
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function EventoReguasManager({ groups }: { groups: ReguaGroup[] }) {
  const [testEmail, setTestEmail] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  return (
    <div className="mb-8 rounded-2xl border-4 border-somma-blue/30 bg-white p-5 md:p-6">
      <div>
        <h2 className="font-bebas text-2xl tracking-wider text-somma-blue">Réguas do Evento · Disparos por base</h2>
        <p className="mt-0.5 text-sm text-somma-black/60">
          Acompanhamento das três réguas do aniversário de 1 ano. Edite data/hora, envie teste ou dispare manualmente.
        </p>
      </div>

      {msg && (
        <p className={`mt-4 rounded-lg px-3 py-2 text-sm font-medium ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg.text}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 rounded-xl bg-somma-cream/60 p-3 sm:flex-row sm:items-center">
        <label className="font-dm text-xs font-bold uppercase tracking-wide text-somma-black/60">E-mail para teste</label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="voce@exemplo.com"
          className="flex-1 rounded-lg border border-somma-black/15 px-3 py-2 text-sm outline-none focus:border-somma-blue"
        />
        <span className="text-xs text-somma-black/50">Use os botões “Teste” de cada linha.</span>
      </div>

      {groups.map((g) => (
        <GroupTable key={g.base} group={g} testEmail={testEmail} onMsg={setMsg} />
      ))}

      <p className="mt-4 text-xs text-somma-black/45">
        O envio automático roda de hora em hora e dispara cada passo no horário agendado. “Disparar” força o envio agora
        (ignora quem já recebeu). O dedup é por e-mail, então os check-ins repetidos da mesma pessoa contam uma vez só.
        Aberturas/cliques vêm do tracking do Resend e podem levar alguns minutos para aparecer.
      </p>
    </div>
  )
}
