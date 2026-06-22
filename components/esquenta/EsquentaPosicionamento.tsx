import Reveal from './Reveal'
import { JuninoIcon } from './JuninoIcons'

export default function EsquentaPosicionamento() {
  return (
    <section className="bg-somma-cream px-4 py-16 sm:py-20 md:py-28">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div>
          <Reveal as="p" className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-orange sm:text-sm">
            O Esquenta
          </Reveal>
          <Reveal as="h2" delay={60} className="font-bebas text-4xl leading-[1.02] tracking-tight text-somma-black sm:text-6xl md:text-7xl">
            Não é só um corre.<br /><span className="text-somma-orange">É uma manhã para viver.</span>
          </Reveal>
          <Reveal as="p" delay={120} className="mt-5 max-w-xl font-dm text-base leading-relaxed text-somma-black/70 sm:text-lg">
            Antes do grande SOMMA Special Day, a comunidade se encontra para correr, celebrar e entrar no clima de festa
            junina do nosso jeito. Pode vir para correr, caminhar, encontrar amigos, aproveitar as ativações ou
            simplesmente viver uma manhã diferente em Brasília.
          </Reveal>
        </div>

        {/* Composição gráfica */}
        <Reveal delay={120} className="relative">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'corre', label: 'Corre', cor: 'bg-somma-orange text-somma-cream' },
              { icon: 'cafe', label: 'Café', cor: 'bg-somma-black text-somma-cream' },
              { icon: 'fogueira', label: 'Arraiá', cor: 'bg-somma-blue text-somma-cream' },
              { icon: 'correio', label: 'Comunidade', cor: 'bg-somma-yellow text-somma-black' },
            ].map((b) => (
              <div key={b.label} className={`flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border-4 border-somma-black ${b.cor} shadow-[6px_6px_0_#0a0a0a]`}>
                <JuninoIcon name={b.icon} className="h-10 w-10" />
                <span className="font-bebas text-xl uppercase tracking-widest">{b.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
