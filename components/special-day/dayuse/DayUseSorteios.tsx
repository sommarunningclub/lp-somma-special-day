const SORTEIOS = [
  { emoji: '🎁', titulo: 'Brindes dos parceiros', desc: 'Kits e produtos das marcas presentes no evento.' },
  { emoji: '👟', titulo: 'Vouchers e experiências', desc: 'Prêmios sorteados ao longo do dia entre a galera presente.' },
  { emoji: '🍺', titulo: 'Combos do bar Somma', desc: 'Porque o after também é sobre celebrar junto.' },
]

export default function DayUseSorteios() {
  return (
    <section className="bg-somma-black px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-center font-dm text-xs uppercase tracking-[0.3em] text-somma-yellow sm:text-sm">
          Vai que é sua
        </p>
        <h2 className="mb-10 text-center font-bebas text-4xl tracking-tight text-somma-cream sm:text-6xl">
          Sorteios o dia inteiro
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {SORTEIOS.map((s) => (
            <div key={s.titulo} className="rounded-2xl border-4 border-somma-cream/20 bg-white/[0.04] p-6 text-center">
              <div className="mb-3 text-4xl">{s.emoji}</div>
              <p className="font-bebas text-2xl tracking-wide text-somma-cream">{s.titulo}</p>
              <p className="mt-2 font-dm text-sm leading-relaxed text-somma-cream/60">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border-4 border-somma-orange bg-somma-orange/10 p-5 text-center">
          <p className="font-dm text-sm leading-relaxed text-somma-cream/90">
            ⚠️ <strong className="text-somma-yellow">Atenção:</strong> o sorteio do
            <strong> Adidas Evo SL</strong> é exclusivo de quem comprou o <strong>kit do evento</strong>.
            O Day Use concorre a todos os outros sorteios, mas não a esse.
          </p>
        </div>
      </div>
    </section>
  )
}
