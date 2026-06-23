'use client'

import { useEffect, useState } from 'react'
import { ESQUENTA } from '@/lib/esquenta-constants'
import Reveal from './Reveal'
import EsquentaAddToCalendar from './EsquentaAddToCalendar'

type Evento = {
  id: string
  titulo: string
  data_evento: string
  tipo: 'corrida' | 'personalizado'
  checkin_status: 'aberto' | 'bloqueado' | 'encerrado'
  pelotoes?: string[] | null
}

function formatCPF(v: string) {
  return v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
function formatPhone(v: string) {
  return v.replace(/\D/g, '').slice(0, 11).replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Valida CPF (dígitos verificadores). Evita CPF incompleto/inventado na base.
function isValidCPF(value: string) {
  const cpf = value.replace(/\D/g, '')
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false // todos os dígitos iguais
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i], 10) * (10 - i)
  let d1 = (soma * 10) % 11
  if (d1 === 10) d1 = 0
  if (d1 !== parseInt(cpf[9], 10)) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i], 10) * (11 - i)
  let d2 = (soma * 10) % 11
  if (d2 === 10) d2 = 0
  return d2 === parseInt(cpf[10], 10)
}

const inputCls =
  'w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20'
const labelCls = 'mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70'

export default function EsquentaCheckin() {
  const [evento, setEvento] = useState<Evento | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '', sexo: '', pelotao: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    fetch(`/api/checkin/evento?id=${ESQUENTA.checkinEventoId}&t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setEvento(d))
      .catch(() => setEvento(null))
      .finally(() => setLoading(false))
  }, [])

  // Sem dado do evento (erro de fetch) caímos no formulário para não travar o usuário.
  const status = evento?.checkin_status ?? 'aberto'
  // Pelotões: usa os do evento (se houver) ou as distâncias padrão (mesmas do check-in oficial).
  const pelotoesList = evento?.pelotoes?.length
    ? evento.pelotoes.map((v) => ({ value: v, label: '', desc: '' }))
    : ESQUENTA.checkinPelotoes

  // Atualiza um campo e limpa o erro dele assim que o usuário corrige.
  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => (e[field] ? { ...e, [field]: '' } : e))
  }

  // Valida todos os campos obrigatórios e devolve os erros por campo.
  function validate() {
    const e: Record<string, string> = {}
    if (!form.pelotao) e.pelotao = 'Escolha a sua distância.'
    if (form.nome.trim().length < 3 || !form.nome.trim().includes(' ')) e.nome = 'Informe seu nome completo (nome e sobrenome).'
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Informe um e-mail válido.'
    const tel = form.telefone.replace(/\D/g, '')
    if (tel.length < 10 || tel.length > 11) e.telefone = 'Informe um telefone com DDD.'
    if (!form.sexo) e.sexo = 'Selecione uma opção.'
    if (!isValidCPF(form.cpf)) e.cpf = 'Informe um CPF válido.'
    return e
  }

  // Classe do input com destaque vermelho quando o campo tem erro.
  const fieldCls = (field: string) =>
    `${inputCls} ${errors[field] ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    const eMap = validate()
    setErrors(eMap)
    if (Object.keys(eMap).length > 0) {
      setErro('Confira os campos destacados. Todos são obrigatórios.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_completo: form.nome,
          email: form.email,
          telefone: form.telefone,
          cpf: form.cpf,
          sexo: form.sexo,
          pelotao: form.pelotao || null,
          evento_id: ESQUENTA.checkinEventoId,
          nome_do_evento: evento?.titulo ?? ESQUENTA.nome,
          data_do_evento: evento?.data_evento ?? '',
        }),
      })
      const data = await res.json()
      if (res.ok) setSucesso(true)
      else setErro(data.error ?? 'Não foi possível concluir o check-in.')
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="check-in" className="bg-somma-blue px-4 py-16 sm:py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        {/* Texto */}
        <div className="text-center lg:text-left">
          <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-cream/70 sm:text-sm">Check-in</p>
          <h2 className="font-bebas text-4xl leading-[0.95] tracking-tight text-somma-cream sm:text-6xl md:text-7xl">
            Garanta sua<br />presença no corre
          </h2>
          <p className="mx-auto mt-5 max-w-md font-dm text-base leading-relaxed text-somma-cream/80 lg:mx-0">
            Faz seu check-in pro Esquenta Somma Special Day. É rapidinho: preenche seus dados e pronto. Te esperamos no
            Eixão, {ESQUENTA.data}, concentração às {ESQUENTA.concentracao}.
          </p>
        </div>

        {/* Card */}
        <div className="w-full justify-self-center lg:justify-self-end">
          <div className="w-full max-w-lg rounded-2xl border-4 border-somma-cream bg-somma-cream shadow-[4px_4px_0_#FF4800] sm:rounded-3xl sm:shadow-[8px_8px_0_#FF4800]">
            <div className="p-5 sm:p-6 md:p-8 lg:p-10">
              {loading ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <span className="h-8 w-8 animate-spin rounded-full border-4 border-somma-black/15 border-t-somma-orange" />
                  <p className="mt-4 font-dm text-sm text-somma-black/50">Carregando check-in…</p>
                </div>
              ) : sucesso ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#1faa59]/15 px-4 py-2 font-dm text-xs font-bold uppercase tracking-widest text-[#1faa59]">
                    Check-in confirmado
                  </span>
                  <h3 className="font-bebas text-4xl uppercase leading-tight tracking-wide text-somma-black md:text-5xl">Tá feito!</h3>
                  <p className="mt-3 max-w-sm font-dm text-sm leading-relaxed text-somma-black/65">
                    Seu lugar no Esquenta tá garantido! Te esperamos no Eixão, {ESQUENTA.data}, às {ESQUENTA.concentracao}. Bora! 🧡
                  </p>
                  <EsquentaAddToCalendar />

                  {/* Oferta de cupom da corrida da Live */}
                  <div className="mt-6 w-full rounded-2xl border-2 border-dashed border-somma-orange/50 bg-somma-orange/[0.06] p-5 text-center">
                    <p className="font-bebas text-xl uppercase tracking-wide text-somma-black">{ESQUENTA.liveCupom.pergunta}</p>
                    <p className="mt-1 font-dm text-sm leading-snug text-somma-black/65">{ESQUENTA.liveCupom.descricao}</p>
                    <a
                      href={ESQUENTA.liveCupom.agendaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block w-full rounded-xl bg-somma-orange px-6 py-3 font-bebas text-base tracking-widest text-somma-cream transition-all hover:bg-somma-orange/90 sm:w-auto"
                    >
                      Sim, quero o cupom
                    </a>
                    <p className="mt-2 font-dm text-xs text-somma-black/55">
                      Salva a agenda e resgata o cupom <strong className="text-somma-orange">{ESQUENTA.liveCupom.cupom}</strong>.
                    </p>
                  </div>

                  <a href={ESQUENTA.siteUrl} className="mt-6 font-dm text-sm font-bold uppercase tracking-wide text-somma-orange underline-offset-2 hover:underline">
                    Conhecer o Somma Special Day
                  </a>
                </div>
              ) : status === 'bloqueado' ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-somma-yellow/20 px-4 py-2 font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70">
                    Check-in em breve
                  </span>
                  <h3 className="font-bebas text-3xl uppercase leading-tight tracking-wide text-somma-black md:text-4xl">Calma que já vai abrir</h3>
                  <p className="mt-3 max-w-sm font-dm text-sm leading-relaxed text-somma-black/60">
                    O check-in ainda não abriu. Dá um pulo aqui mais perto da data ({ESQUENTA.data}) pra garantir sua presença. 🧡
                  </p>
                </div>
              ) : status === 'encerrado' ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-somma-orange/15 px-4 py-2 font-dm text-xs font-bold uppercase tracking-widest text-somma-orange">
                    Check-in encerrado
                  </span>
                  <h3 className="font-bebas text-3xl uppercase leading-tight tracking-wide text-somma-black md:text-4xl">Check-in encerrado</h3>
                  <p className="mt-3 max-w-sm font-dm text-sm leading-relaxed text-somma-black/60">
                    O check-in do Esquenta já fechou. Fica de olho nas nossas redes que vem mais corre por aí. 🧡
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6 border-b-2 border-dashed border-somma-black/15 pb-5">
                    <p className="font-dm text-[11px] font-bold uppercase tracking-[0.25em] text-somma-orange">Check-in · Esquenta</p>
                    <h3 className="mt-1 font-bebas text-3xl leading-tight tracking-wide text-somma-black md:text-4xl">Bora fazer seu check-in</h3>
                    <p className="mt-2 font-dm text-sm text-somma-black/60">Preenche seus dados e garante sua presença. Todos os campos são obrigatórios.</p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div>
                      <label className={labelCls}>Distância <span className="text-somma-orange">*</span></label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {pelotoesList.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => update('pelotao', p.value)}
                            className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                              form.pelotao === p.value
                                ? 'border-somma-orange bg-somma-orange/10'
                                : errors.pelotao
                                  ? 'border-red-400 bg-white'
                                  : 'border-somma-black/15 bg-white hover:border-somma-black/30'
                            }`}
                          >
                            <span className="block font-bebas text-lg leading-none tracking-wide text-somma-black">{p.value}</span>
                            {p.label && <span className="mt-0.5 block font-dm text-[11px] leading-tight text-somma-black/55">{p.label}</span>}
                          </button>
                        ))}
                      </div>
                      {errors.pelotao && <p className="mt-1.5 font-dm text-xs font-semibold text-red-600">{errors.pelotao}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Nome completo <span className="text-somma-orange">*</span></label>
                      <input required aria-invalid={!!errors.nome} value={form.nome} onChange={(e) => update('nome', e.target.value)} placeholder="Nome e sobrenome" className={fieldCls('nome')} />
                      {errors.nome && <p className="mt-1.5 font-dm text-xs font-semibold text-red-600">{errors.nome}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>E-mail <span className="text-somma-orange">*</span></label>
                      <input type="email" required aria-invalid={!!errors.email} value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="seu@email.com" className={fieldCls('email')} />
                      {errors.email && <p className="mt-1.5 font-dm text-xs font-semibold text-red-600">{errors.email}</p>}
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>Telefone <span className="text-somma-orange">*</span></label>
                        <input required aria-invalid={!!errors.telefone} value={form.telefone} inputMode="numeric" onChange={(e) => update('telefone', formatPhone(e.target.value))} placeholder="(61) 99999-0000" className={fieldCls('telefone')} />
                        {errors.telefone && <p className="mt-1.5 font-dm text-xs font-semibold text-red-600">{errors.telefone}</p>}
                      </div>
                      <div>
                        <label className={labelCls}>Sexo <span className="text-somma-orange">*</span></label>
                        <select required aria-invalid={!!errors.sexo} value={form.sexo} onChange={(e) => update('sexo', e.target.value)} className={`${fieldCls('sexo')} cursor-pointer`}>
                          <option value="" disabled>Selecione</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                        </select>
                        {errors.sexo && <p className="mt-1.5 font-dm text-xs font-semibold text-red-600">{errors.sexo}</p>}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>CPF <span className="text-somma-orange">*</span></label>
                      <input required aria-invalid={!!errors.cpf} value={form.cpf} inputMode="numeric" onChange={(e) => update('cpf', formatCPF(e.target.value))} placeholder="000.000.000-00" className={fieldCls('cpf')} />
                      {errors.cpf && <p className="mt-1.5 font-dm text-xs font-semibold text-red-600">{errors.cpf}</p>}
                    </div>

                    {erro && (
                      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center font-dm text-sm text-red-600">{erro}</p>
                    )}

                    <button type="submit" disabled={submitting} className="mt-2 w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-4 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#0a0a0a] disabled:cursor-not-allowed disabled:opacity-60 sm:text-xl md:text-2xl md:shadow-[5px_5px_0_#0a0a0a]">
                      {submitting ? 'ENVIANDO...' : 'FAZER CHECK-IN'}
                    </button>
                    <p className="text-center font-dm text-xs text-somma-black/50">Seus dados estão seguros. Não fazemos spam.</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
