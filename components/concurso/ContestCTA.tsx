import Link from 'next/link'

// 3 CTAs do concurso. variant 'hero' = botões grandes; 'inline' = compacto.
export default function ContestCTA({ variant = 'hero' }: { variant?: 'hero' | 'inline' }) {
  const big = variant === 'hero'
  const base = big
    ? 'rounded-2xl border-4 border-somma-black px-6 py-4 text-center font-bebas text-lg tracking-widest shadow-[4px_4px_0_#0a0a0a] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#0a0a0a] sm:text-xl'
    : 'rounded-xl border-2 border-somma-black px-4 py-2.5 text-center font-bebas text-sm tracking-widest shadow-[2px_2px_0_#0a0a0a]'
  return (
    <div className={`flex flex-col gap-3 ${big ? 'sm:flex-row sm:flex-wrap' : 'sm:flex-row'}`}>
      <Link href="/esquenta-junino/concurso/participar" className={`${base} bg-somma-orange text-somma-cream`}>
        Participar do concurso
      </Link>
      <Link href="/esquenta-junino/concurso/looks" className={`${base} bg-somma-cream text-somma-black`}>
        Ver looks e votar
      </Link>
      <Link href="/esquenta-junino/concurso/ranking" className={`${base} bg-white text-somma-black`}>
        Acompanhar ranking
      </Link>
    </div>
  )
}
