export default function CortesiaEsgotada() {
  return (
    <div className="w-full max-w-lg rounded-2xl border-4 border-somma-cream bg-somma-cream shadow-[4px_4px_0_#FF4800] sm:rounded-3xl sm:shadow-[8px_8px_0_#FF4800]">
      <div className="flex flex-col items-center p-5 text-center sm:p-6 md:p-8 lg:p-10">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-somma-orange/15 px-4 py-2 font-dm text-xs font-bold uppercase tracking-widest text-somma-orange">
          Cortesias esgotadas
        </span>
        <h2 className="font-bebas text-4xl leading-tight tracking-wide text-somma-black md:text-5xl">
          Todas as cortesias foram preenchidas
        </h2>
        <p className="mt-3 max-w-sm font-dm text-sm leading-relaxed text-somma-black/60">
          As vagas de cortesia do Somma Special Day já se esgotaram. Fique de olho nas
          nossas redes para as próximas oportunidades.
        </p>
      </div>
    </div>
  )
}
