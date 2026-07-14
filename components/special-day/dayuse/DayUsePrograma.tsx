const PROGRAMACAO = [
  { hora: '07h às 08h', titulo: 'Treinão Corre Somma', desc: 'A corrida de 4 km e 8 km pela orla.', emoji: '🏃', cor: '#005EFF', incluso: false },
  { hora: '08h às 09h', titulo: 'Fit Dance + café da manhã', desc: 'Aula pra soltar o corpo e café da manhã Big Box.', emoji: '🥐', cor: '#FDB716', incluso: true },
  { hora: '09h às 12h', titulo: 'Roda de samba & ativações', desc: 'Samba ao vivo, parceiros ativando, bar abrindo e Day Use solto.', emoji: '🥁', cor: '#FD6FDB', incluso: true },
  { hora: '11h às 13h30', titulo: 'Gincana Somma', desc: 'Competições insanas com a galera e brindes de monte.', emoji: '🎯', cor: '#FF4800', incluso: true },
  { hora: '13h30 às 15h', titulo: 'DJ & encerramento social', desc: 'A festa continua. A gente fecha o dia juntos.', emoji: '🎧', cor: '#005EFF', incluso: true },
]

export default function DayUsePrograma() {
  return (
    <section className="bg-somma-blue px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-center font-dm text-xs uppercase tracking-[0.3em] text-somma-yellow sm:text-sm">
          Do café ao pôr do sol
        </p>
        <h2 className="mb-10 text-center font-bebas text-4xl tracking-tight text-somma-cream sm:text-6xl">
          A programação do dia
        </h2>

        <div className="flex flex-col gap-3 sm:gap-4">
          {PROGRAMACAO.map((item) => (
            <div
              key={item.hora}
              className={`flex flex-col gap-3 rounded-2xl border-4 border-somma-black bg-white p-4 shadow-[4px_4px_0_#0a0a0a] sm:flex-row sm:items-center sm:gap-5 sm:p-5 ${item.incluso ? '' : 'opacity-70'}`}
            >
              <div
                className="flex shrink-0 items-center justify-center rounded-xl border-2 border-somma-black px-4 py-2 sm:w-44"
                style={{ backgroundColor: item.cor }}
              >
                <span className="font-bebas text-xl tracking-wide text-somma-cream sm:text-2xl">{item.hora}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none sm:text-3xl">{item.emoji}</span>
                <div>
                  <h3 className="font-bebas text-xl tracking-wide text-somma-black sm:text-2xl">
                    {item.titulo}
                    {!item.incluso && (
                      <span className="ml-2 rounded-md border-2 border-somma-black bg-somma-orange px-2 py-0.5 align-middle font-dm text-[10px] uppercase tracking-wider text-somma-cream">
                        Não incluso no Day Use
                      </span>
                    )}
                  </h3>
                  <p className="font-dm text-sm leading-snug text-somma-black/65">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
