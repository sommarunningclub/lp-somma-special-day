const ITENS = [
  { emoji: '🍢', nome: 'Churrasquinho', desc: 'Espetinho na brasa pra segurar a fome no meio do after.' },
  { emoji: '🍚', nome: 'Arroz Carreteiro', desc: 'O clássico que abraça — prato cheio pra repor a energia.' },
  { emoji: '🥤', nome: 'DOPAHMINA', desc: 'Smoothies e shakes proteicos pra recuperar e refrescar.' },
  { emoji: '🍧', nome: 'Açaí', desc: 'Geladinho, na medida certa pra recarregar as pilhas.' },
  { emoji: '🍹', nome: 'Bar de Bebidas Somma Club', desc: 'Drinks e bebidas geladas no ponto de encontro da comunidade.' },
  { emoji: '🥞', nome: 'Crepe', desc: 'Doce ou salgado, feito na hora pra fechar com chave de ouro.' },
]

export default function DayUseAlimentacao() {
  return (
    <section className="bg-somma-blue px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-3 font-dm text-xs uppercase tracking-[0.3em] text-somma-cream/80 sm:text-sm">
            Pra matar a fome
          </p>
          <h2 className="font-bebas text-5xl leading-none tracking-tight text-somma-cream sm:text-6xl md:text-7xl">
            Praça de Alimentação
          </h2>
          <p className="mt-3 font-dm text-sm text-somma-cream/75 sm:text-base">
            Tem de tudo no rolê — comida boa do salgado ao doce, sem sair do clima.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITENS.map((item) => (
            <div
              key={item.nome}
              className="rounded-2xl border-4 border-somma-black bg-somma-cream p-6 shadow-[6px_6px_0_#0a0a0a]"
            >
              <span className="text-3xl leading-none">{item.emoji}</span>
              <p className="mt-3 font-bebas text-2xl tracking-wide text-somma-black">{item.nome}</p>
              <p className="mt-1 font-dm text-sm leading-snug text-somma-black/65">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
