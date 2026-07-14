const ITENS = [
  { emoji: '💧', nome: 'Estamina', desc: 'Hidratação e reposição pra você voltar ao rolê renovado.' },
  { emoji: '🧊', nome: 'Banheiro de gelo', desc: 'Imersão gelada pra acelerar a recuperação do corpo.' },
  { emoji: '✨', nome: 'E muito mais', desc: 'Uma estrutura completa de recovery pensada pra comunidade.' },
]

export default function DayUseRecovery() {
  return (
    <section className="bg-somma-pink px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-black/70 sm:text-sm">
          Pra se recuperar
        </p>
        <h2 className="font-bebas text-5xl leading-none tracking-tight text-somma-black sm:text-6xl md:text-7xl">
          Recovery completo
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-dm text-base leading-relaxed text-somma-black/75 sm:text-lg">
          Depois do corre e da festa, o corpo pede cuidado. Nossa área de recovery
          tem tudo pra você se recuperar e curtir o dia inteiro.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {ITENS.map((item) => (
            <div
              key={item.nome}
              className="rounded-2xl border-4 border-somma-black bg-somma-cream p-6 shadow-[6px_6px_0_#0a0a0a]"
            >
              <span className="text-3xl leading-none">{item.emoji}</span>
              <p className="mt-3 font-bebas text-2xl tracking-wide text-somma-black">{item.nome}</p>
              <p className="mt-1 font-dm text-sm leading-snug text-somma-black/65">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
