import Image from 'next/image'

type Parceiro = {
  nome: string
  src: string
  href: string
  className: string
  light?: boolean // logo com fundo claro proprio -> recebe cartao claro
}

// Mesmas marcas da seção "Quem vem com a gente nesse dia" da home do Special Day.
const PARCEIROS: Parceiro[] = [
  { nome: 'Red Bull', src: '/logo-redbull.png', href: 'https://www.redbull.com/br-pt', className: 'h-20 sm:h-24', light: true },
  { nome: 'Dobro', src: '/logo-dobro.png', href: 'https://soudobro.com.br/', className: 'h-9 sm:h-11' },
  { nome: 'Evolve', src: '/logo-evolve.svg', href: 'https://www.academiaevolve.com.br/', className: 'h-8 sm:h-10' },
  { nome: 'Big Box', src: '/logo-bigbox.png', href: 'https://www.bigbox.com.br/', className: 'h-8 sm:h-10' },
  { nome: 'Track&Field', src: '/logo-track.png', href: 'https://www.tf.com.br/', className: 'h-5 sm:h-6 invert' },
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
            As marcas que vêm com a gente nesse dia.
          </p>
        </div>

        <div className="rounded-3xl bg-somma-black px-6 py-10 sm:py-12">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-16">
            {PARCEIROS.map((marca) => (
              <a
                key={marca.nome}
                href={marca.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={marca.nome}
                className={`flex items-center justify-center opacity-90 transition-opacity hover:opacity-100 ${
                  marca.light ? 'rounded-xl bg-somma-cream px-4 py-2' : ''
                }`}
              >
                <Image
                  src={marca.src}
                  alt={marca.nome}
                  width={240}
                  height={120}
                  className={`${marca.className} w-auto object-contain`}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
