export default function DayUseGincana() {
  return (
    <section className="bg-somma-cream px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
          Zero seriedade
        </p>
        <h2 className="font-bebas text-4xl tracking-tight text-somma-black sm:text-6xl">
          Gincana Somma
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-dm text-base leading-relaxed text-somma-black/70 sm:text-lg">
          Competições insanas em equipe, muita zoeira e brindes pra galera. Com o
          Day Use você entra na disputa e vive a parte mais caótica (e divertida)
          do dia.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {['🎯 Provas em equipe', '🏆 Premiação', '😂 Muita zoeira'].map((tag) => (
            <span
              key={tag}
              className="rounded-xl border-4 border-somma-black bg-white px-5 py-2 font-bebas text-xl tracking-wide text-somma-black shadow-[4px_4px_0_#0a0a0a]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
