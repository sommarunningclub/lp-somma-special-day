'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Proposta } from '@/lib/types/proposta'

interface Props {
  proposta: Proposta
}

export default function PropostaTableRow({ proposta }: Props) {
  const [copied, setCopied] = useState(false)
  const validade = proposta.validade ? new Date(proposta.validade + 'T00:00:00') : null
  const expirada = validade ? validade < new Date(new Date().toDateString()) : false

  function copiar() {
    const url = `${window.location.origin}/proposta/${proposta.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <tr className="border-t-2 border-somma-cream/10 transition-colors hover:bg-somma-blue/5">
      <td className="px-5 py-4 font-dm">
        <div className="font-semibold text-somma-cream">{proposta.cliente_nome}</div>
        {proposta.cliente_empresa && (
          <div className="text-xs text-somma-cream/50">{proposta.cliente_empresa}</div>
        )}
      </td>
      <td className="px-5 py-4 font-dm text-sm">
        <code className="rounded-lg border-2 border-somma-black bg-somma-cream/10 px-2.5 py-1 text-xs font-bold text-somma-yellow">/{proposta.slug}</code>
      </td>
      <td className="px-5 py-4 font-dm text-sm">
        {proposta.cota_recomendada
          ? <span className="rounded-full border-2 border-somma-orange bg-somma-orange/20 px-3 py-1 font-bebas text-xs tracking-widest text-somma-orange">{proposta.cota_recomendada.toUpperCase()}</span>
          : <span className="text-somma-cream/40">—</span>
        }
      </td>
      <td className="px-5 py-4 font-dm text-xs">
        {validade
          ? <span className={expirada ? 'font-bold text-somma-pink' : 'text-somma-cream/80'}>
              {validade.toLocaleDateString('pt-BR')}{expirada && ' (expirada)'}
            </span>
          : <span className="text-somma-cream/40">—</span>
        }
      </td>
      <td className="px-5 py-4 text-right">
        <div className="flex flex-wrap justify-end gap-2">
          <button
            onClick={copiar}
            className="rounded-full border-2 border-somma-blue bg-somma-blue/10 px-4 py-1.5 font-bebas text-xs tracking-widest text-somma-blue shadow-[2px_2px_0_#005EFF] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#005EFF]"
          >
            {copied ? 'Copiado!' : 'Copiar link'}
          </button>
          <a
            href={`/proposta/${proposta.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-somma-cream/30 px-4 py-1.5 font-bebas text-xs tracking-widest text-somma-cream/80 transition-all hover:border-somma-cream hover:bg-somma-cream/10"
          >
            Visualizar
          </a>
          <Link
            href={`/admin/${proposta.id}/editar`}
            className="rounded-full border-2 border-somma-yellow bg-somma-yellow/10 px-4 py-1.5 font-bebas text-xs tracking-widest text-somma-yellow shadow-[2px_2px_0_#FDB716] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#FDB716]"
          >
            Editar
          </Link>
        </div>
      </td>
    </tr>
  )
}
