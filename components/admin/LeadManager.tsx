'use client'

import { useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { criarLeadListaVip, atualizarLeadListaVip } from '@/actions/admin-leads'
import { codeFromLeadId } from '@/lib/lista-vip-code'
import { listaVipSchema, type ListaVipInput } from '@/lib/validations/lista-vip'

export interface ListaVipLead {
  id: string
  nome: string
  email: string
  cpf: string
  telefone: string
  sexo: 'M' | 'F' | 'Outro'
  codigo_unico?: string
  status_cupom?: 'ativo' | 'usado' | 'expirado' | 'cancelado'
  quantidade_usos?: number
  data_expiracao?: string | null
  created_at: string
}

interface Props {
  leads: ListaVipLead[]
}

const emptyValues: ListaVipInput = {
  nome: '',
  email: '',
  cpf: '',
  telefone: '',
  sexo: 'Outro',
}

function formatCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function formatPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

function valuesFromLead(lead: ListaVipLead): ListaVipInput {
  return {
    nome: lead.nome,
    email: lead.email,
    cpf: lead.cpf,
    telefone: lead.telefone,
    sexo: lead.sexo,
  }
}

export default function LeadManager({ leads }: Props) {
  const [editingLead, setEditingLead] = useState<ListaVipLead | null>(null)
  const [serverMsg, setServerMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ListaVipInput>({
    resolver: zodResolver(listaVipSchema),
    defaultValues: emptyValues,
  })

  const orderedLeads = useMemo(() => leads, [leads])

  function startCreate() {
    setEditingLead(null)
    setServerMsg(null)
    reset(emptyValues)
  }

  function startEdit(lead: ListaVipLead) {
    setEditingLead(lead)
    setServerMsg(null)
    reset(valuesFromLead(lead))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function onSubmit(data: ListaVipInput) {
    setServerMsg(null)
    startTransition(async () => {
      const result = editingLead
        ? await atualizarLeadListaVip(editingLead.id, data)
        : await criarLeadListaVip(data)

      if (result.success) {
        setServerMsg({
          type: 'success',
          text: editingLead ? 'Lead atualizado com sucesso.' : 'Lead adicionado com sucesso.',
        })
        setEditingLead(null)
        reset(emptyValues)
      } else {
        setServerMsg({ type: 'error', text: result.error })
      }
    })
  }

  const inputClass = 'w-full rounded-2xl border-4 border-somma-black bg-somma-cream px-4 py-3 font-dm text-sm text-somma-black shadow-[3px_3px_0_#005EFF] placeholder:text-somma-black/40 focus:shadow-[3px_3px_0_#FF4800] focus:outline-none transition-shadow'
  const labelClass = 'mb-2 block font-bebas text-sm tracking-widest text-somma-yellow'

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-2xl border-4 border-somma-black bg-somma-black p-5 shadow-[4px_4px_0_#FF4800] md:rounded-3xl md:p-6 md:shadow-[6px_6px_0_#FF4800]"
      >
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-dm text-xs font-bold uppercase tracking-[0.22em] text-somma-orange">
              {editingLead ? 'Editando lead' : 'Novo lead'}
            </p>
            <h2 className="break-words font-bebas text-2xl tracking-widest text-somma-yellow sm:text-3xl">
              {editingLead ? editingLead.nome : 'Adicionar na Lista VIP'}
            </h2>
          </div>
          {editingLead && (
            <button
              type="button"
              onClick={startCreate}
              className="w-full rounded-full border-4 border-somma-cream/30 px-5 py-2.5 font-bebas tracking-widest text-somma-cream transition-all hover:border-somma-cream hover:bg-somma-cream/10 sm:w-auto"
            >
              Cancelar edição
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Nome completo *</label>
            <input {...register('nome')} className={inputClass} placeholder="Nome do lead" />
            {errors.nome && <p className="mt-1.5 font-dm text-xs text-somma-pink">{errors.nome.message}</p>}
          </div>

          <div>
            <label className={labelClass}>E-mail *</label>
            <input {...register('email')} type="email" className={inputClass} placeholder="lead@email.com" />
            {errors.email && <p className="mt-1.5 font-dm text-xs text-somma-pink">{errors.email.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Telefone *</label>
            <input
              {...register('telefone')}
              inputMode="numeric"
              className={inputClass}
              placeholder="(61) 99999-0000"
              onChange={(event) => {
                const formatted = formatPhone(event.target.value)
                event.target.value = formatted
                setValue('telefone', formatted, { shouldValidate: false })
              }}
            />
            {errors.telefone && <p className="mt-1.5 font-dm text-xs text-somma-pink">{errors.telefone.message}</p>}
          </div>

          <div>
            <label className={labelClass}>CPF *</label>
            <input
              {...register('cpf')}
              inputMode="numeric"
              className={inputClass}
              placeholder="000.000.000-00"
              onChange={(event) => {
                const formatted = formatCPF(event.target.value)
                event.target.value = formatted
                setValue('cpf', formatted, { shouldValidate: false })
              }}
            />
            {errors.cpf && <p className="mt-1.5 font-dm text-xs text-somma-pink">{errors.cpf.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Sexo *</label>
            <select {...register('sexo')} className={`${inputClass} cursor-pointer`}>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
            {errors.sexo && <p className="mt-1.5 font-dm text-xs text-somma-pink">{errors.sexo.message}</p>}
          </div>
        </div>

        {serverMsg && (
          <div className={`mt-5 rounded-2xl border-4 px-5 py-4 text-center font-dm text-sm ${
            serverMsg.type === 'success'
              ? 'border-somma-black bg-somma-cream text-somma-black shadow-[4px_4px_0_#005EFF]'
              : 'border-somma-black bg-somma-pink/20 text-somma-pink shadow-[4px_4px_0_#FD6FDB]'
          }`}>
            {serverMsg.text}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full border-4 border-somma-black bg-somma-orange px-8 py-3 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#0a0a0a] disabled:opacity-60 sm:w-auto sm:shadow-[5px_5px_0_#0a0a0a]"
          >
            {isPending ? 'Salvando...' : editingLead ? 'Salvar alterações' : 'Adicionar lead'}
          </button>
        </div>
      </form>

      <div className="grid gap-4 md:hidden">
        {orderedLeads.map((lead) => (
          <article key={lead.id} className="rounded-2xl border-4 border-somma-black bg-somma-black/70 p-5 shadow-[4px_4px_0_#005EFF]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words font-bebas text-2xl tracking-wider text-somma-cream">{lead.nome}</h3>
                <p className="mt-1 break-all text-xs text-somma-cream/60">{lead.email}</p>
              </div>
              <span className="shrink-0 rounded-full border-2 border-somma-yellow bg-somma-yellow/10 px-3 py-1 font-bebas text-xs tracking-widest text-somma-yellow">
                {lead.status_cupom ?? 'ativo'}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-somma-cream/65">
              <div>
                <span className="block font-bold uppercase tracking-widest text-somma-cream/35">CPF</span>
                <span>{lead.cpf}</span>
              </div>
              <div>
                <span className="block font-bold uppercase tracking-widest text-somma-cream/35">Telefone</span>
                <span>{lead.telefone}</span>
              </div>
              <div className="col-span-2">
                <span className="block font-bold uppercase tracking-widest text-somma-cream/35">Código</span>
                <span className="font-bebas text-2xl tracking-widest text-somma-yellow">{lead.codigo_unico ?? codeFromLeadId(lead.id)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => startEdit(lead)}
              className="mt-4 w-full rounded-full border-4 border-somma-yellow bg-somma-yellow/10 px-5 py-2 font-bebas tracking-widest text-somma-yellow transition-all hover:bg-somma-yellow hover:text-somma-black"
            >
              Editar
            </button>
          </article>
        ))}
        {orderedLeads.length === 0 && (
          <div className="rounded-2xl border-4 border-somma-black bg-somma-black/70 px-5 py-12 text-center text-somma-cream/50 shadow-[4px_4px_0_#005EFF]">
            Nenhum lead ainda.
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-3xl border-4 border-somma-black shadow-[6px_6px_0_#005EFF] md:block">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-somma-blue font-bebas text-base tracking-widest text-somma-cream">
            <tr>
              {['Nome', 'E-mail', 'CPF', 'Telefone', 'Sexo', 'Código', 'Status', 'Usos', 'Data', 'Ações'].map((heading) => (
                <th key={heading} className={`px-5 py-4 text-left ${heading === 'Ações' ? 'text-right' : ''}`}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-somma-black/80">
            {orderedLeads.map((lead, index) => (
              <tr key={lead.id} className={index % 2 === 0 ? 'bg-somma-black' : 'bg-somma-blue/10'}>
                <td className="px-5 py-4 font-semibold text-somma-cream">{lead.nome}</td>
                <td className="px-5 py-4 text-somma-cream/75">{lead.email}</td>
                <td className="px-5 py-4 text-somma-cream/75">{lead.cpf}</td>
                <td className="px-5 py-4 text-somma-cream/75">{lead.telefone}</td>
                <td className="px-5 py-4 text-somma-cream/75">{lead.sexo}</td>
                <td className="px-5 py-4 font-bebas text-lg tracking-widest text-somma-yellow">{lead.codigo_unico ?? codeFromLeadId(lead.id)}</td>
                <td className="px-5 py-4 text-somma-cream/75">{lead.status_cupom ?? 'ativo'}</td>
                <td className="px-5 py-4 text-somma-cream/75">{lead.quantidade_usos ?? 0}</td>
                <td className="px-5 py-4 text-somma-cream/50">{new Date(lead.created_at).toLocaleString('pt-BR')}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => startEdit(lead)}
                    className="rounded-full border-4 border-somma-yellow bg-somma-yellow/10 px-5 py-2 font-bebas tracking-widest text-somma-yellow transition-all hover:bg-somma-yellow hover:text-somma-black"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {orderedLeads.length === 0 && (
              <tr>
                <td colSpan={10} className="px-5 py-16 text-center text-somma-cream/40">
                  Nenhum lead ainda. Use o formulário acima para adicionar o primeiro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
