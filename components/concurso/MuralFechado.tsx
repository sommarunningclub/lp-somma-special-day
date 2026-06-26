import Link from 'next/link'
import { muralReleaseLabel } from '@/lib/contest/gate'

interface Props {
  /** Texto curto que identifica a pagina ("looks", "ranking" etc) pro titulo. */
  origem?: string
}

export default function MuralFechado({ origem = 'Mural' }: Props) {
  return (
    <main className="min-h-[100svh] bg-somma-cream px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/esquenta-junino/concurso"
          className="font-dm text-sm font-bold uppercase tracking-wide text-somma-orange underline-offset-2 hover:underline"
        >
          ← Concurso Junino
        </Link>
        <div className="mt-8 rounded-3xl border-4 border-somma-black bg-white p-8 text-center shadow-[8px_8px_0_#FF4800] sm:p-10">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border-4 border-somma-black bg-somma-yellow font-bebas text-3xl text-somma-black">
            🌽
          </div>
          <h1 className="font-bebas text-4xl uppercase tracking-wide text-somma-black sm:text-5xl">
            {origem} ainda fechado
          </h1>
          <p className="mt-3 font-dm text-base leading-relaxed text-somma-black/70">
            O mural dos looks abre <strong>sábado, 28 de junho, às 06h30</strong> (Brasília). Até lá os looks ficam guardados
            a sete chaves. 🤫
          </p>
          <div className="mx-auto mt-6 inline-block rounded-2xl border-2 border-dashed border-somma-black/25 bg-somma-cream px-5 py-3 font-dm text-sm font-bold text-somma-black/70">
            Abre em <strong className="text-somma-orange">{muralReleaseLabel()}</strong>
          </div>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/esquenta-junino/concurso/participar"
              className="rounded-xl border-4 border-somma-black bg-somma-orange px-5 py-3 font-bebas text-base tracking-widest text-somma-cream shadow-[4px_4px_0_#0a0a0a]"
            >
              Participar do concurso
            </Link>
            <Link
              href="/esquenta-junino/concurso/minha-inscricao"
              className="rounded-xl border-4 border-somma-black bg-white px-5 py-3 font-bebas text-base tracking-widest text-somma-black"
            >
              Minha inscrição
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
