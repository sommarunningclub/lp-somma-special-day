import { LOTES, PRESALE } from '@/lib/presale-constants'

/**
 * Tabela de lotes do Somma Special Day.
 * - Pré-venda (R$ 97): ATIVA até o deadline → CTA rola para o cadastro (#inscricao).
 * - 1º Lote (R$ 127,50): "em breve" durante a pré-venda; ATIVO depois → compra no app.
 * - 2º Lote (R$ 135): bloqueado.
 *
 * `closed` = pré-venda encerrada (passou do prazo / admin fechou).
 */
export default function LotesSection({ closed = false }: { closed?: boolean }) {
  return (
    <section id="lotes" className="relative overflow-hidden bg-somma-black px-4 py-14 sm:py-16 md:py-24">
      <div className="relative mx-auto max-w-5xl">
        <p className="mb-3 text-center font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
          Valores dos ingressos
        </p>
        <h2 className="mb-3 text-center font-bebas text-4xl leading-[1.05] tracking-tight text-somma-cream sm:text-6xl md:text-7xl">
          Bora garantir seu ingresso!
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center font-dm text-sm leading-relaxed text-somma-cream/60 sm:text-base">
          {closed
            ? 'Acabou a pré-venda! Agora o 1º lote já tá no app Track&Field. E o preço só sobe, então corre.'
            : 'A pré-venda é o menor preço do evento e termina domingo. Cada lote que passa, o valor sobe. Não dá pra ficar de fora!'}
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch">
          {LOTES.map((lote) => {
            // Estados por lote conforme a pré-venda esteja aberta ou encerrada.
            const isPre = lote.key === 'pre'
            const isL1 = lote.key === 'l1'

            const ativo = isPre ? !closed : isL1 ? closed : false
            const encerrado = isPre && closed
            const bloqueado = lote.bloqueado || (isL1 && !closed) // L1 só abre depois da pré-venda

            const status = encerrado
              ? { label: 'Encerrada', cls: 'bg-somma-black/30 text-somma-cream/50' }
              : ativo
                ? { label: 'Disponível agora', cls: 'bg-somma-orange text-somma-cream' }
                : bloqueado && lote.key === 'l2'
                  ? { label: 'Bloqueado', cls: 'bg-somma-black/30 text-somma-cream/50' }
                  : { label: lote.quando, cls: 'bg-somma-yellow/20 text-somma-yellow' }

            return (
              <div
                key={lote.key}
                className={`flex flex-col rounded-3xl border-4 p-6 transition-all sm:p-7 ${
                  ativo
                    ? 'border-somma-orange bg-somma-cream shadow-[8px_8px_0_#FF4800]'
                    : 'border-somma-cream/15 bg-white/[0.04]'
                } ${encerrado || (bloqueado && lote.key === 'l2') ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`font-bebas text-2xl tracking-wide sm:text-3xl ${ativo ? 'text-somma-black' : 'text-somma-cream'}`}>
                    {lote.nome}
                  </h3>
                  {lote.desconto && (
                    <span className="rounded-full bg-[#1faa59]/15 px-2.5 py-1 font-dm text-[11px] font-bold uppercase tracking-wide text-[#1faa59]">
                      {lote.desconto}
                    </span>
                  )}
                </div>

                <div className="mt-5 flex items-end gap-2">
                  {lote.de && (
                    <span className={`font-dm text-sm line-through ${ativo ? 'text-somma-black/40' : 'text-somma-cream/40'}`}>
                      {lote.de}
                    </span>
                  )}
                  <span className={`font-bebas text-4xl leading-none tracking-tight sm:text-5xl ${ativo ? 'text-somma-orange' : 'text-somma-cream'}`}>
                    {lote.por}
                  </span>
                </div>

                <span className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 font-dm text-[11px] font-bold uppercase tracking-wide ${status.cls}`}>
                  {status.label}
                </span>

                <div className="mt-auto pt-6">
                  {isPre && !closed && (
                    <a
                      href="#inscricao"
                      className="block w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-3.5 text-center font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#0a0a0a]"
                    >
                      Garantir agora
                    </a>
                  )}
                  {isL1 && closed && (
                    <a
                      href={PRESALE.eventoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-3.5 text-center font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#0a0a0a]"
                    >
                      Comprar no app
                    </a>
                  )}
                  {((isL1 && !closed) || lote.key === 'l2' || encerrado) && (
                    <p className={`text-center font-dm text-xs ${ativo ? 'text-somma-black/50' : 'text-somma-cream/40'}`}>
                      {encerrado ? 'Prazo encerrado' : lote.key === 'l2' ? 'Ainda não liberado' : lote.quando}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
