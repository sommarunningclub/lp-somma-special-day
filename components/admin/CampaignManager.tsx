'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateCampaignSchedule, sendCampaignTest, dispatchCampaignNow } from '@/actions/campaign'

export interface StepView {
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

type Props = {
  steps: StepView[]
  totalEligible: number
}

const STATUS_STYLE: Record<StepView['status'], string> = {
  pendente: 'bg-gray-100 text-gray-600',
  enviando: 'bg-yellow-100 text-yellow-700',
  enviado: 'bg-green-100 text-green-700',
  erro: 'bg-red-100 text-red-700',
}

const STATUS_LABEL: Record<StepView['status'], string> = {
  pendente: 'Agendado',
  enviando: 'Enviando…',
  enviado: 'Enviado',
  erro: 'Erro',
}

export default function CampaignManager({ steps, totalEligible }: Props) {
  const router = useRouter()
  const [testEmail, setTestEmail] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  // rascunho editável por passo
  const [draft, setDraft] = useState<Record<string, { sendAtLocal: string; enabled: boolean }>>(
    Object.fromEntries(steps.map((s) => [s.step, { sendAtLocal: s.sendAtLocal, enabled: s.enabled }]))
  )

  const totalEnviado = steps.reduce((acc, s) => acc + s.enviados, 0)

  function patchDraft(step: string, patch: Partial<{ sendAtLocal: string; enabled: boolean }>) {
    setDraft((d) => ({ ...d, [step]: { ...d[step], ...patch } }))
  }

  function handleSave(step: string) {
    setMsg(null)
    const d = draft[step]
    startTransition(async () => {
      const res = await updateCampaignSchedule(step, d.sendAtLocal, d.enabled)
      if (res.success) {
        setMsg({ type: 'ok', text: 'Agendamento salvo.' })
        router.refresh()
      } else setMsg({ type: 'err', text: res.error })
    })
  }

  function handleTest(step: string) {
    setMsg(null)
    if (!testEmail) {
      setMsg({ type: 'err', text: 'Digite um e-mail para o teste.' })
      return
    }
    startTransition(async () => {
      const res = await sendCampaignTest(step, testEmail)
      setMsg(res.success ? { type: 'ok', text: `Teste enviado para ${testEmail}.` } : { type: 'err', text: res.error })
    })
  }

  function handleDispatch(step: string, subject: string) {
    setMsg(null)
    if (!confirm(`Disparar AGORA para todos os elegíveis?\n\n"${subject}"\n\nQuem já recebeu este passo será ignorado.`)) return
    startTransition(async () => {
      const res = await dispatchCampaignNow(step)
      if (res.success) {
        setMsg({ type: 'ok', text: `Disparo concluído: ${res.data.sent} enviados, ${res.data.failed} falhas.` })
        router.refresh()
      } else setMsg({ type: 'err', text: res.error })
    })
  }

  return (
    <div className="mb-8 rounded-2xl border-4 border-somma-orange/30 bg-white p-5 md:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bebas text-2xl tracking-wider text-somma-orange">Campanha de Escassez · Fim do lote</h2>
          <p className="mt-0.5 text-sm text-somma-black/60">
            Sequência de e-mails até o fim do 1º lote (R$ 97). Edite data/hora, envie teste ou dispare manualmente.
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 sm:mt-0">
          <span className="rounded-full bg-somma-blue/10 px-3 py-1.5 font-dm text-xs font-bold uppercase tracking-wide text-somma-blue">
            {totalEligible} elegíveis
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1.5 font-dm text-xs font-bold uppercase tracking-wide text-green-700">
            {totalEnviado} enviados
          </span>
        </div>
      </div>

      {msg && (
        <p className={`mt-4 rounded-lg px-3 py-2 text-sm font-medium ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg.text}
        </p>
      )}

      {/* E-mail de teste (compartilhado) */}
      <div className="mt-4 flex flex-col gap-2 rounded-xl bg-somma-cream/60 p-3 sm:flex-row sm:items-center">
        <label className="font-dm text-xs font-bold uppercase tracking-wide text-somma-black/60">E-mail para teste</label>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="voce@exemplo.com"
          className="flex-1 rounded-lg border border-somma-black/15 px-3 py-2 text-sm outline-none focus:border-somma-orange"
        />
        <span className="text-xs text-somma-black/50">Use os botões “Teste” de cada linha.</span>
      </div>

      {/* Tabela de passos */}
      <div className="mt-4 overflow-x-auto">
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
            {steps.map((s) => {
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

      <p className="mt-3 text-xs text-somma-black/45">
        O envio automático roda de hora em hora e dispara cada passo no horário agendado. “Disparar” força o envio agora
        (ignora quem já recebeu). Aberturas/cliques são do tracking do Resend e podem levar alguns minutos para aparecer.
      </p>
    </div>
  )
}
