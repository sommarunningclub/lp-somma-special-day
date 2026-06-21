import PresaleSignupForm from '@/components/special-day/PresaleSignupForm'
import { PRESALE } from '@/lib/presale-constants'

/**
 * Seção de cadastro na home. Reusa o MESMO fluxo da Lista VIP:
 * cadastro → e-mail com cupom → /listavip/obrigado.
 * Quando a pré-venda encerra, vira CTA para comprar o 1º lote no app.
 */
export default function InscricaoSection({ closed = false }: { closed?: boolean }) {
  return (
    <section id="inscricao" className="relative overflow-hidden bg-somma-blue px-4 py-14 sm:py-16 md:py-24">
      <div className="relative mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        {/* Texto */}
        <div className="text-center lg:text-left">
          <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-cream/70 sm:text-sm">
            {closed ? 'Pré-venda encerrada' : 'Garanta sua vaga'}
          </p>
          <h2 className="font-bebas text-4xl leading-[0.95] tracking-tight text-somma-cream sm:text-6xl md:text-7xl">
            {closed ? (
              <>O 1º lote já<br />está no app</>
            ) : (
              <>Faça seu<br />cadastro</>
            )}
          </h2>
          <p className="mx-auto mt-5 max-w-md font-dm text-base leading-relaxed text-somma-cream/80 lg:mx-0">
            {closed
              ? 'A pré-venda terminou. Agora você garante o 1º lote por R$ 127,50 direto no app Track&Field — e o preço só sobe.'
              : 'Cadastre-se para garantir sua inscrição no Somma Special Day pelo menor preço. As vagas da pré-venda são limitadas e acabam domingo.'}
          </p>
        </div>

        {/* Form / CTA */}
        <div className="w-full justify-self-center lg:justify-self-end">
          <PresaleSignupForm
            closed={closed}
            eyebrow="Cadastro · Pré-venda"
            title="Garanta sua vaga"
            subtitle="Preencha seus dados e garanta o menor preço do evento."
            submitLabel="QUERO GARANTIR MINHA VAGA"
            closedContent={
              <div className="flex flex-col items-center py-6 text-center">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-somma-orange/15 px-4 py-2 font-dm text-xs font-bold uppercase tracking-widest text-somma-orange">
                  Pré-venda encerrada
                </span>
                <h2 className="font-bebas text-4xl leading-tight tracking-wide text-somma-black md:text-5xl">
                  Garanta o 1º lote
                </h2>
                <p className="mt-3 max-w-sm font-dm text-sm leading-relaxed text-somma-black/60">
                  A pré-venda (R$ 97) acabou. Agora a inscrição é o 1º lote por{' '}
                  <strong>R$ 127,50</strong>, direto no app Track&amp;Field.
                </p>
                <a
                  href={PRESALE.eventoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full rounded-2xl border-4 border-somma-black bg-somma-orange px-3 py-4 font-bebas text-lg tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] sm:w-auto sm:px-8"
                >
                  Comprar no app Track&amp;Field
                </a>
              </div>
            }
          />
        </div>
      </div>
    </section>
  )
}
