import PresaleSignupForm from '@/components/special-day/PresaleSignupForm'
import InscricaoLoteForm from '@/components/special-day/InscricaoLoteForm'

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
              <>O 1º lote<br />já tá no app!</>
            ) : (
              <>Bora se<br />cadastrar?</>
            )}
          </h2>
          <p className="mx-auto mt-5 max-w-md font-dm text-base leading-relaxed text-somma-cream/80 lg:mx-0">
            {closed
              ? 'A pré-venda acabou! Agora seu ingresso é R$ 127,50 no 1º lote, direto no app Track&Field. E o preço só sobe daqui pra frente.'
              : 'Cadastra aqui e garante o menor preço do evento. Vaga da pré-venda é limitada e acaba domingo. Não vai bobear, hein?'}
          </p>
        </div>

        {/* Form / CTA */}
        <div className="w-full justify-self-center lg:justify-self-end">
          {closed ? (
            <InscricaoLoteForm />
          ) : (
            <PresaleSignupForm
              closed={false}
              eyebrow="Cadastro · Pré-venda"
              title="Garanta sua vaga"
              subtitle="Preencha seus dados e garanta o menor preço do evento."
              submitLabel="QUERO GARANTIR MINHA VAGA"
            />
          )}
        </div>
      </div>
    </section>
  )
}
