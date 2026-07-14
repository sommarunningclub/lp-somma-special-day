const ITENS = [
  { emoji: '👕', titulo: 'Leve roupa extra', desc: 'Depois do corre e das ativações, uma troca de roupa faz toda a diferença pra curtir o after seco e confortável.' },
  { emoji: '🚿', titulo: 'Duchas liberadas', desc: 'As duchas ficam à disposição pra você se refrescar quando quiser.' },
  { emoji: '🛁', titulo: 'Banheiro com chuveiro', desc: 'Estrutura de banheiro com chuveiro pra você tomar aquele banho e voltar novo pro rolê.' },
]

export default function DayUsePrepare() {
  return (
    <section className="bg-somma-yellow px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-black/70 sm:text-sm">
            Fica a dica
          </p>
          <h2 className="font-bebas text-5xl leading-none tracking-tight text-somma-black sm:text-6xl md:text-7xl">
            Se prepare pro dia inteiro
          </h2>
        </div>

        <div className="space-y-4">
          {ITENS.map((item) => (
            <div
              key={item.titulo}
              className="flex items-start gap-4 rounded-2xl border-4 border-somma-black bg-somma-cream p-6 shadow-[6px_6px_0_#0a0a0a]"
            >
              <span className="text-3xl leading-none">{item.emoji}</span>
              <div>
                <p className="font-bebas text-2xl tracking-wide text-somma-black">{item.titulo}</p>
                <p className="mt-1 font-dm text-sm leading-snug text-somma-black/65 sm:text-base">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
