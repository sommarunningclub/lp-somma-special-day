'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propostaSchema, type PropostaInput } from '@/lib/validations/proposta'
import { COTAS, AVULSAS, slugify, type CotaKey, type AvulsaKey } from '@/lib/proposta-data'
import { criarProposta, atualizarProposta, excluirProposta } from '@/actions/proposta'
import type { Proposta } from '@/lib/types/proposta'

interface Props {
  mode: 'create' | 'edit'
  initial?: Proposta
}

export default function PropostaForm({ mode, initial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverMsg, setServerMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropostaInput>({
    resolver: zodResolver(propostaSchema),
    defaultValues: {
      cliente_nome: initial?.cliente_nome ?? '',
      cliente_empresa: initial?.cliente_empresa ?? '',
      slug: initial?.slug ?? '',
      mensagem_abertura: initial?.mensagem_abertura ?? '',
      validade: initial?.validade ?? '',
      cota_recomendada: initial?.cota_recomendada ?? null,
      cotas_visiveis: initial?.cotas_visiveis ?? ['master', 'ouro', 'prata', 'apoio'],
      avulsas_visiveis: initial?.avulsas_visiveis ?? AVULSAS.map(a => a.key),
      valores_personalizados: initial?.valores_personalizados ?? {},
      whatsapp_telefone: initial?.whatsapp_telefone ?? '',
      contato_responsavel: initial?.contato_responsavel ?? '',
      ocultar_avulsas: initial?.ocultar_avulsas ?? false,
      ocultar_comparativo: initial?.ocultar_comparativo ?? false,
    },
  })

  const clienteNome = watch('cliente_nome')
  const slug = watch('slug')

  // Auto-gera slug a partir do nome (apenas em create e se slug está vazio ou ainda corresponde ao antigo)
  useEffect(() => {
    if (mode !== 'create') return
    setValue('slug', slugify(clienteNome || ''), { shouldValidate: false })
  }, [clienteNome, mode, setValue])

  function onSubmit(data: PropostaInput) {
    setServerMsg(null)
    startTransition(async () => {
      const result = mode === 'create'
        ? await criarProposta(data)
        : await atualizarProposta(initial!.id, data)

      if (result.success) {
        setServerMsg({ type: 'success', text: 'Proposta salva!' })
        if (mode === 'create') {
          router.push('/admin')
        }
      } else {
        setServerMsg({ type: 'error', text: result.error })
      }
    })
  }

  function onDelete() {
    if (!initial) return
    if (!confirm(`Excluir proposta de "${initial.cliente_nome}"? Esta ação não pode ser desfeita.`)) return
    startTransition(async () => {
      const result = await excluirProposta(initial.id)
      if (result.success) {
        router.push('/admin')
      } else {
        setServerMsg({ type: 'error', text: result.error })
      }
    })
  }

  function copiarLink() {
    if (!slug) return
    const url = `${window.location.origin}/proposta/${slug}`
    navigator.clipboard.writeText(url)
    setServerMsg({ type: 'success', text: 'Link copiado: ' + url })
  }

  const inputClass = 'w-full rounded-2xl border-4 border-somma-black bg-somma-cream px-4 py-3 font-dm text-sm text-somma-black shadow-[3px_3px_0_#005EFF] placeholder:text-somma-black/40 focus:shadow-[3px_3px_0_#FF4800] focus:outline-none transition-shadow'
  const labelClass = 'mb-2 block font-bebas text-sm tracking-widest text-somma-yellow'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {/* Cliente */}
      <section className="rounded-2xl border-4 border-somma-black bg-somma-black p-5 shadow-[4px_4px_0_#005EFF] sm:rounded-3xl sm:p-6 sm:shadow-[6px_6px_0_#005EFF]">
        <h2 className="mb-5 font-bebas text-2xl tracking-widest text-somma-orange sm:text-3xl">Cliente</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Nome do cliente *</label>
            <input {...register('cliente_nome')} className={inputClass} placeholder="Ex: Banco BV" />
            {errors.cliente_nome && <p className="mt-1.5 font-dm text-xs text-somma-pink">{errors.cliente_nome.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Empresa / Razão social</label>
            <input {...register('cliente_empresa')} className={inputClass} placeholder="Opcional" />
          </div>
          <div>
            <label className={labelClass}>Slug (URL pública) *</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="font-bebas text-sm tracking-wider text-somma-cream/60">/proposta/</span>
              <input {...register('slug')} className={inputClass} placeholder="banco-bv" />
            </div>
            {errors.slug && <p className="mt-1.5 font-dm text-xs text-somma-pink">{errors.slug.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Responsável</label>
            <input {...register('contato_responsavel')} className={inputClass} placeholder="Ex: Maria Silva" />
          </div>
          <div>
            <label className={labelClass}>WhatsApp (formato 5561999999999)</label>
            <input {...register('whatsapp_telefone')} className={inputClass} placeholder="5561995372477" />
          </div>
          <div>
            <label className={labelClass}>Validade da proposta</label>
            <input type="date" {...register('validade')} className={inputClass} />
          </div>
        </div>
        <div className="mt-5">
          <label className={labelClass}>Mensagem de abertura (opcional)</label>
          <textarea
            {...register('mensagem_abertura')}
            rows={3}
            className={`${inputClass} resize-y`}
            placeholder="Texto personalizado que aparece no topo da proposta..."
          />
        </div>
      </section>

      {/* Cotas */}
      <section className="rounded-2xl border-4 border-somma-black bg-somma-black p-5 shadow-[4px_4px_0_#FDB716] sm:rounded-3xl sm:p-6 sm:shadow-[6px_6px_0_#FDB716]">
        <h2 className="mb-5 font-bebas text-2xl tracking-widest text-somma-orange sm:text-3xl">Cotas exibidas</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {COTAS.map(cota => (
            <label key={cota.key} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-4 border-somma-black px-4 py-3 font-dm text-sm shadow-[3px_3px_0_#0a0a0a] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#0a0a0a] ${cota.fechada ? 'bg-somma-black/40' : 'bg-somma-cream'}`}>
              <input
                type="checkbox"
                value={cota.key}
                {...register('cotas_visiveis')}
                className="h-5 w-5 accent-somma-orange"
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-bebas text-lg tracking-wider text-somma-black">{cota.nome}</span>
                {cota.fechada && (
                  <span className="inline-block rounded-full bg-somma-pink px-2 py-0.5 font-dm text-[10px] font-bold uppercase tracking-widest text-white">
                    VAGAS ESGOTADAS
                  </span>
                )}
              </div>
            </label>
          ))}
        </div>

        <p className="mt-3 font-dm text-xs text-somma-cream/50">
          Para abrir ou fechar vagas de uma cota, edite o campo <code className="rounded bg-somma-black/40 px-1">fechada</code> em <code className="rounded bg-somma-black/40 px-1">lib/proposta-data.ts</code>.
        </p>

        <div className="mt-6">
          <label className={labelClass}>Cota recomendada (destaque)</label>
          <select {...register('cota_recomendada', { setValueAs: v => v === '' ? null : v })} className={`${inputClass} cursor-pointer`}>
            <option value="">Nenhuma</option>
            {COTAS.map(c => (
              <option key={c.key} value={c.key}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div className="mt-6">
          <p className={labelClass}>Valores personalizados (deixe em branco para usar o padrão)</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {COTAS.map(cota => (
              <div key={cota.key}>
                <label className="mb-1.5 block font-dm text-[11px] uppercase tracking-widest text-somma-cream/60">
                  {cota.nome} <span className="text-somma-cream/40">(R$ {cota.valor.toLocaleString('pt-BR')})</span>
                </label>
                <input
                  type="number"
                  step={100}
                  min={0}
                  {...register(`valores_personalizados.${cota.key}` as const, {
                    setValueAs: v => v === '' || v === null ? undefined : Number(v),
                  })}
                  className={inputClass}
                  placeholder={cota.valor.toString()}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seções da proposta */}
      <section className="rounded-2xl border-4 border-somma-black bg-somma-black p-5 shadow-[4px_4px_0_#FD6FDB] sm:rounded-3xl sm:p-6 sm:shadow-[6px_6px_0_#FD6FDB]">
        <h2 className="mb-2 font-bebas text-2xl tracking-widest text-somma-orange sm:text-3xl">Seções da proposta</h2>
        <p className="mb-5 font-dm text-xs text-somma-cream/50">Escolha quais blocos aparecem na proposta pública.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-4 border-somma-black bg-somma-cream px-4 py-3 font-dm text-sm shadow-[3px_3px_0_#0a0a0a] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#0a0a0a]">
            <input type="checkbox" {...register('ocultar_comparativo')} className="mt-0.5 h-5 w-5 accent-somma-pink" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bebas text-base tracking-wider text-somma-black">Ocultar "Comparativo · Resumo lado a lado"</span>
              <span className="font-dm text-[11px] text-somma-black/60">A tabela comparativa entre as cotas não será exibida.</span>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-4 border-somma-black bg-somma-cream px-4 py-3 font-dm text-sm shadow-[3px_3px_0_#0a0a0a] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#0a0a0a]">
            <input type="checkbox" {...register('ocultar_avulsas')} className="mt-0.5 h-5 w-5 accent-somma-pink" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bebas text-base tracking-wider text-somma-black">Ocultar "Cotas avulsas de experiência"</span>
              <span className="font-dm text-[11px] text-somma-black/60">A seção de entregas pontuais (camiseta, hidratação, café, etc.) não será exibida.</span>
            </div>
          </label>
        </div>
      </section>

      {/* Avulsas */}
      <section className="rounded-2xl border-4 border-somma-black bg-somma-black p-5 shadow-[4px_4px_0_#FF4800] sm:rounded-3xl sm:p-6 sm:shadow-[6px_6px_0_#FF4800]">
        <h2 className="mb-5 font-bebas text-2xl tracking-widest text-somma-orange sm:text-3xl">Cotas avulsas exibidas</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {AVULSAS.map(a => (
            <label key={a.key} className="flex cursor-pointer items-start gap-3 rounded-2xl border-4 border-somma-black bg-somma-cream px-4 py-3 font-dm text-sm shadow-[3px_3px_0_#0a0a0a] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#0a0a0a]">
              <input
                type="checkbox"
                value={a.key}
                {...register('avulsas_visiveis')}
                className="mt-0.5 h-5 w-5 accent-somma-orange"
              />
              <span className="leading-tight text-somma-black">{a.nome}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Mensagem servidor */}
      {serverMsg && (
        <div className={`rounded-2xl border-4 px-5 py-4 text-center font-dm text-sm ${
          serverMsg.type === 'success'
            ? 'border-somma-black bg-somma-cream text-somma-black shadow-[4px_4px_0_#005EFF]'
            : 'border-somma-black bg-somma-pink/20 text-somma-pink shadow-[4px_4px_0_#FD6FDB]'
        }`}>
          {serverMsg.text}
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="w-full rounded-full border-4 border-somma-cream/30 px-6 py-3 font-bebas tracking-widest text-somma-cream transition-all hover:border-somma-cream hover:bg-somma-cream/10 sm:w-auto"
        >
          Cancelar
        </button>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
          {mode === 'edit' && (
            <>
              <button
                type="button"
                onClick={copiarLink}
                className="w-full rounded-full border-4 border-somma-blue bg-somma-blue/20 px-6 py-3 font-bebas tracking-widest text-somma-blue shadow-[3px_3px_0_#005EFF] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#005EFF] sm:w-auto"
              >
                Copiar link público
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={isPending}
                className="w-full rounded-full border-4 border-somma-pink bg-somma-pink/20 px-6 py-3 font-bebas tracking-widest text-somma-pink shadow-[3px_3px_0_#FD6FDB] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#FD6FDB] disabled:opacity-50 sm:w-auto"
              >
                Excluir
              </button>
            </>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full border-4 border-somma-black bg-somma-orange px-8 py-3 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#0a0a0a] disabled:opacity-60 sm:w-auto sm:shadow-[5px_5px_0_#0a0a0a]"
          >
            {isPending ? 'Salvando...' : (mode === 'create' ? 'Criar proposta' : 'Salvar alterações')}
          </button>
        </div>
      </div>
    </form>
  )
}
