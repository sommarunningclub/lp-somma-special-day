const NAO_INCLUI = [
  { titulo: 'Não dá direito ao kit', desc: 'Camiseta, gym bag e brindes são exclusivos de quem comprou o kit do evento.' },
  { titulo: 'Não dá direito ao corre', desc: 'A corrida (4 km e 8 km) não está inclusa no Day Use.' },
]

const INCLUI = [
  { titulo: 'Acesso a todo o after', desc: 'Você entra e curte tudo: samba ao vivo, DJ, gincana, sorteios, bar e ativações dos parceiros.' },
]

export default function DayUseInclui() {
  return (
    <section className="bg-somma-cream px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-10 text-center font-bebas text-4xl tracking-tight text-somma-black sm:text-6xl">
          O que o Day Use <span className="text-somma-orange">é</span> e o que <span className="text-somma-blue">não é</span>
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border-4 border-somma-black bg-white p-6 shadow-[6px_6px_0_#0a0a0a]">
            <p className="mb-4 font-bebas text-2xl tracking-wide text-somma-black">O que NÃO inclui</p>
            <ul className="space-y-4">
              {NAO_INCLUI.map((item) => (
                <li key={item.titulo} className="flex items-start gap-3">
                  <span className="text-2xl leading-none">❌</span>
                  <div>
                    <p className="font-bebas text-xl tracking-wide text-somma-black">{item.titulo}</p>
                    <p className="font-dm text-sm leading-snug text-somma-black/65">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border-4 border-somma-black bg-somma-yellow p-6 shadow-[6px_6px_0_#0a0a0a]">
            <p className="mb-4 font-bebas text-2xl tracking-wide text-somma-black">O que INCLUI</p>
            <ul className="space-y-4">
              {INCLUI.map((item) => (
                <li key={item.titulo} className="flex items-start gap-3">
                  <span className="text-2xl leading-none">✅</span>
                  <div>
                    <p className="font-bebas text-xl tracking-wide text-somma-black">{item.titulo}</p>
                    <p className="font-dm text-sm leading-snug text-somma-black/70">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
