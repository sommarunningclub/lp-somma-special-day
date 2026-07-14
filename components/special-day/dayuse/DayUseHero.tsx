export default function DayUseHero() {
  return (
    <section className="relative overflow-hidden bg-somma-orange px-4 py-20 text-center sm:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-cream sm:text-sm">
          Special Day · 18 de julho · 2026
        </p>
        <h1 className="font-bebas text-6xl leading-[0.95] tracking-tight text-somma-cream sm:text-8xl md:text-9xl">
          Ingresso <span className="block text-somma-yellow">Day Use</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-dm text-base leading-relaxed text-somma-cream/90 sm:text-lg">
          Não vai correr, mas quer viver o after completo? Esse ingresso é seu.
          Um dia inteiro de samba, DJ, gincana, sorteios e a melhor comunidade de Brasília.
        </p>

        <div className="mt-8 inline-block rounded-2xl border-4 border-somma-black bg-somma-cream px-8 py-5 shadow-[6px_6px_0_#0a0a0a]">
          <p className="font-dm text-xs uppercase tracking-widest text-somma-black/60">Ingresso Day Use</p>
          <p className="font-bebas text-5xl leading-none tracking-tight text-somma-black sm:text-6xl">R$ 75</p>
        </div>

        <div className="mt-8">
          <a
            href="#dayuse-checkout"
            className="inline-block rounded-xl border-4 border-somma-black bg-somma-blue px-10 py-4 font-bebas text-2xl tracking-wide text-somma-cream shadow-[6px_6px_0_#0a0a0a] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_#0a0a0a]"
          >
            Garantir meu Day Use
          </a>
        </div>
      </div>
    </section>
  )
}
