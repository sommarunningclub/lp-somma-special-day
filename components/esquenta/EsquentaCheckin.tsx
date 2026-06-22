'use client'

import { useEffect, useState } from 'react'
import { ESQUENTA } from '@/lib/esquenta-constants'
import Reveal from './Reveal'

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

const inputCls =
  'w-full rounded-xl border-2 border-somma-black/15 bg-white px-4 py-3 font-dm text-somma-black placeholder:text-somma-black/30 focus:border-somma-blue focus:outline-none focus:ring-2 focus:ring-somma-blue/20'
const labelCls = 'mb-1.5 block font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70'

export default function EsquentaCheckin() {
  const [evento, setEvento] = useState<Evento | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '', sexo: '', pelotao: '' })
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (!form.nome || !form.email || !form.telefone || !form.cpf || !form.sexo) {
      setErro('Preencha todos os campos.')
      return
    }
    if (!form.pelotao) {
      setErro('Escolha a sua distância.')
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
            Faça seu check-in para o Esquenta SOMMA Special Day. É rápido: preencha seus dados e pronto — te esperamos no
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
                    Seu check-in no Esquenta SOMMA Special Day está garantido. Te esperamos no Eixão, {ESQUENTA.data}, às {ESQUENTA.concentracao}. 🧡
                  </p>
                  <a href={ESQUENTA.siteUrl} className="mt-6 font-dm text-sm font-bold uppercase tracking-wide text-somma-orange underline-offset-2 hover:underline">
                    Conhecer o Somma Special Day
                  </a>
                </div>
              ) : status === 'bloqueado' ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-somma-yellow/20 px-4 py-2 font-dm text-xs font-bold uppercase tracking-widest text-somma-black/70">
                    Check-in em breve
                  </span>
                  <h3 className="font-bebas text-3xl uppercase leading-tight tracking-wide text-somma-black md:text-4xl">O check-in abre em breve</h3>
                  <p className="mt-3 max-w-sm font-dm text-sm leading-relaxed text-somma-black/60">
                    Ainda não liberamos o check-in do Esquenta. Volte aqui mais perto da data ({ESQUENTA.data}) para garantir sua presença.
                  </p>
                </div>
              ) : status === 'encerrado' ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-somma-orange/15 px-4 py-2 font-dm text-xs font-bold uppercase tracking-widest text-somma-orange">
                    Check-in encerrado
                  </span>
                  <h3 className="font-bebas text-3xl uppercase leading-tight tracking-wide text-somma-black md:text-4xl">Check-in encerrado</h3>
                  <p className="mt-3 max-w-sm font-dm text-sm leading-relaxed text-somma-black/60">
                    O check-in do Esquenta foi encerrado. Fique de olho nas nossas redes para os próximos corres.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6 border-b-2 border-dashed border-somma-black/15 pb-5">
                    <p className="font-dm text-[11px] font-bold uppercase tracking-[0.25em] text-somma-orange">Check-in · Esquenta</p>
                    <h3 className="mt-1 font-bebas text-3xl leading-tight tracking-wide text-somma-black md:text-4xl">Faça seu check-in</h3>
                    <p className="mt-2 font-dm text-sm text-somma-black/60">Preencha seus dados e garanta sua presença.</p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div>
                      <label className={labelCls}>Distância</label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {pelotoesList.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setForm({ ...form, pelotao: p.value })}
                            className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                              form.pelotao === p.value ? 'border-somma-orange bg-somma-orange/10' : 'border-somma-black/15 bg-white hover:border-somma-black/30'
                            }`}
                          >
                            <span className="block font-bebas text-lg leading-none tracking-wide text-somma-black">{p.value}</span>
                            {p.label && <span className="mt-0.5 block font-dm text-[11px] leading-tight text-somma-black/55">{p.label}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Nome completo</label>
                      <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Seu nome" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>E-mail</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>Telefone</label>
                        <input value={form.telefone} inputMode="numeric" onChange={(e) => setForm({ ...form, telefone: formatPhone(e.target.value) })} placeholder="(61) 99999-0000" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Sexo</label>
                        <select value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })} className={`${inputCls} cursor-pointer`}>
                          <option value="" disabled>Selecione</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>CPF</label>
                      <input value={form.cpf} inputMode="numeric" onChange={(e) => setForm({ ...form, cpf: formatCPF(e.target.value) })} placeholder="000.000.000-00" className={inputCls} />
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
