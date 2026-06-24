import Reveal from '@/components/esquenta/Reveal'

const PASSOS = [
  'Capriche no look junino.',
  'Faça sua inscrição e envie até duas fotos.',
  'Publique sua participação.',
  'Compartilhe com seus amigos.',
  'O público vota no look favorito.',
  'O look mais votado leva o prêmio.',
]

export default function ContestSteps() {
  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PASSOS.map((passo, i) => (
        <Reveal as="li" key={i} delay={i * 60} className="flex items-center gap-4 rounded-2xl border-4 border-somma-black bg-white p-4 shadow-[4px_4px_0_#0a0a0a]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-somma-orange font-bebas text-xl text-somma-cream">{i + 1}</span>
          <span className="font-dm text-sm font-medium leading-snug text-somma-black sm:text-base">{passo}</span>
        </Reveal>
      ))}
    </ol>
  )
}
