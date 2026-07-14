// TODO: substituir os placeholders pelos parceiros reais do evento (nome + logo).
// Ex.: { nome: 'Marca X', logo: '/parceiros/marca-x.png' }
const PARCEIROS = [
  { nome: 'Parceiro' },
  { nome: 'Parceiro' },
  { nome: 'Parceiro' },
  { nome: 'Parceiro' },
  { nome: 'Parceiro' },
  { nome: 'Parceiro' },
]

export default function DayUseParceiros() {
  return (
    <section className="bg-somma-cream px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
            Quem faz acontecer
          </p>
          <h2 className="font-bebas text-5xl leading-none tracking-tight text-somma-black sm:text-6xl md:text-7xl">
            Parceiros do evento
          </h2>
          <p className="mt-3 font-dm text-sm text-somma-black/60 sm:text-base">
            As marcas que constroem o Special Day junto com a gente.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PARCEIROS.map((p, i) => (
            <div
              key={i}
              className="flex aspect-video items-center justify-center rounded-2xl border-4 border-somma-black bg-white p-6 shadow-[6px_6px_0_#0a0a0a]"
            >
              <span className="font-bebas text-xl uppercase tracking-wide text-somma-black/40">
                {p.nome}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
