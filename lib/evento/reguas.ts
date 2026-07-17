/**
 * Réguas de e-mail do evento (aniversário de 1 ano · Somma Special Day).
 * Três bases, cada uma com sua sequência:
 *   lista_vip     -> conversão (fechar o ingresso)
 *   checkins      -> reativação (quem já correu com a gente)
 *   cadastro_site -> despertar a base antiga
 *
 * Horários em UTC. O Brasil não tem horário de verão em 2026, então BRT = UTC-3.
 * Ex.: 10h BRT = 13:00 UTC · 18h BRT = 21:00 UTC.
 *
 * A copy fica aqui de propósito: editar texto = editar este arquivo.
 */

export type EventoBase = 'lista_vip' | 'checkins' | 'cadastro_site' | 'dayuse'

export interface EventoStep {
  base: EventoBase
  /** Único dentro da base (usado no dedup). */
  step: string
  /** Momento programado de envio (ISO 8601, UTC). */
  sendAt: string
  /**
   * Se true, o passo já nasce ATIVO no agendamento (dispara sozinho no horário).
   * Default (undefined/false): nasce desativado e o admin precisa ligar na mão.
   */
  defaultEnabled?: boolean
  subject: string
  preheader: string
  /** Selo pequeno em cima do título. */
  selo: string
  /** Título grande (uppercase). */
  headline: string
  /** Parágrafos do corpo. Linha começando com "• " vira item de lista. */
  body: string[]
  /** Mostra o bloco de preço (1º lote R$ 127,50 · cupom SOMMA15). */
  showPrice: boolean
  cta: string
  ctaUrl: string
  /** Texto já preenchido no botão do WhatsApp. */
  waText: string
}

export interface EventoReguaMeta {
  base: EventoBase
  label: string
  descricao: string
  /** Cor de destaque (hex) usada no selo e detalhes. */
  accent: string
}

export const SITE_URL = 'https://specialday.sommaclub.com.br'
const BUY_URL = `${SITE_URL}/#tfsports`
const DAYUSE_URL = `${SITE_URL}/dayuse`

export const REGUAS_META: EventoReguaMeta[] = [
  {
    base: 'dayuse',
    label: 'Régua Day Use · Todas as bases',
    descricao: 'Push do ingresso Day Use (R$ 75) para VIP + Check-ins + Cadastro do site, sem enviar duplicado. 3 e-mails no dia 17/07 (12h30, 16h50 e 20h).',
    accent: '#1faa59',
  },
  {
    base: 'lista_vip',
    label: 'Régua 1 · Lista VIP',
    descricao: 'Conversão: quem entrou na pré-venda e ainda não fechou o ingresso.',
    accent: '#FF4800',
  },
  {
    base: 'checkins',
    label: 'Régua 2 · Check-ins',
    descricao: 'Reativação: quem já correu com a gente. Pegada "vem viver de novo".',
    accent: '#005EFF',
  },
  {
    base: 'cadastro_site',
    label: 'Régua 3 · Cadastro do site',
    descricao: 'Base antiga. Régua diária: 3 e-mails por dia (manhã, tarde e noite) de 06/07 a 17/07.',
    accent: '#FDB716',
  },
]

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Régua diária da base cadastro_site: 3 e-mails por dia (manhã 09h, tarde 14h,
 * noite 19h BRT) de 06/07 a 17/07 (véspera do evento). ~36 disparos no total.
 * A copy varia por slot, por dia e pela fase da contagem regressiva.
 */
function buildCadastroSteps(): EventoStep[] {
  const slots = [
    { s: 'm', utc: 12, saud: 'Bom dia', fecho: 'Que tal começar o dia decidindo isso? ☀️' },
    { s: 't', utc: 17, saud: 'Boa tarde', fecho: 'Bora resolver antes que o dia acabe? 🏃' },
    { s: 'n', utc: 22, saud: 'Boa noite', fecho: 'Fecha o dia com essa boa notícia. 🧡' },
  ] as const

  const subj = {
    m: [
      'Bom dia! Bora garantir sua vaga? ☀️',
      'Acordou? O Somma Special Day te chama 🏃',
      'Café da manhã com novidade boa ☕',
      'Bom dia! Que tal decidir correr hoje? 🧡',
      'Levanta que hoje dá pra garantir o 1º lote ☀️',
      'Bom dia! O dia 18/07 tá logo ali, bora?',
    ],
    t: [
      'Pausa da tarde: já garantiu sua vaga? 👀',
      'Boa tarde! O 1º lote continua te esperando',
      'Boa tarde! Bora fechar isso hoje?',
      'A tarde é sua pra entrar nessa 🏃',
      'Lembrete da tarde: 1 ano de Somma pra comemorar',
      'Garante agora e fica tranquilo o resto do dia 😌',
    ],
    n: [
      'Antes de dormir: sua vaga te espera 🌙',
      'Boa noite! O grande dia tá chegando',
      'Fecha o dia garantindo sua vaga 🧡',
      'Boa noite! O Special Day é 18/07 no COPMDF',
      'Última chance do dia de pegar o 1º lote 🌙',
      'Dorme pensando: 18/07 vai ser incrível ✨',
    ],
  } as const

  const headline = {
    m: ['Bom dia, corredor!', 'Começa o dia correndo', 'Bora pra cima hoje'],
    t: ['Boa tarde!', 'Ainda dá tempo', 'Sua vaga tá aí'],
    n: ['Fecha o dia com a gente', 'Boa noite!', 'Bora sonhar com a corrida'],
  } as const

  const steps: EventoStep[] = []
  let dayIdx = 0
  for (let day = 6; day <= 17; day++, dayIdx++) {
    const daysLeft = 18 - day
    const amanha = daysLeft === 1
    for (const slot of slots) {
      const pool = subj[slot.s]
      const subject = amanha
        ? `${slot.saud}! É AMANHÃ 🎉 vem com a gente`
        : pool[dayIdx % pool.length]
      const hPool = headline[slot.s]
      const head = amanha ? 'É amanhã!' : hPool[dayIdx % hPool.length]

      // Corpo por fase da contagem.
      let body: string[]
      if (amanha) {
        body = [
          `${slot.saud}, {{nome}}! É amanhã! 🎉`,
          'O Somma Special Day é dia 18/07, às 06h, no COPMDF, em Brasília. É o aniversário de 1 ano do Somma, e ainda dá tempo de você fazer parte.',
          '4 km ou 8 km, você escolhe. O ingresso tá no 1º lote, no app Track&Field.',
          slot.fecho,
        ]
      } else if (daysLeft >= 6) {
        body = [
          `${slot.saud}, {{nome}}! Você já faz parte da história do Somma, e o clube tá completando 1 ano. Bora comemorar correndo junto?`,
          `É o Somma Special Day, dia 18/07, em Brasília. 4 km ou 8 km, do seu jeito. Faltam ${daysLeft} dias!`,
          slot.fecho,
        ]
      } else {
        body = [
          `${slot.saud}, {{nome}}! O Somma Special Day tá chegando: faltam só ${daysLeft} dias.`,
          'São 4 km ou 8 km no COPMDF, dia 18/07, com muita gente boa e pagode ao vivo. O ingresso tá no 1º lote, no app Track&Field.',
          slot.fecho,
        ]
      }

      const buy = slot.s === 't' || daysLeft <= 3 || amanha
      steps.push({
        base: 'cadastro_site',
        step: `s_${pad2(day)}${slot.s}`,
        sendAt: `2026-07-${pad2(day)}T${pad2(slot.utc)}:00:00Z`,
        subject,
        preheader: amanha ? 'É amanhã! Bora garantir sua vaga.' : `Faltam ${daysLeft} dias pro Somma Special Day.`,
        selo: amanha ? 'É amanhã' : `Faltam ${daysLeft} dias`,
        headline: head,
        body,
        showPrice: buy,
        cta: buy ? 'Garantir minha vaga' : 'Quero participar',
        ctaUrl: buy ? BUY_URL : SITE_URL,
        waText: 'Oi! Quero participar do Somma Special Day dia 18/07',
      })
    }
  }
  return steps
}

/**
 * Burst do 5º dia útil (dia de pagamento, 07/07): 3 e-mails (manhã, tarde,
 * noite) para TODAS as bases, brincando com o tema "caiu o salário, paga o
 * cartão e vem garantir o ingresso". Mesma copy nas 3 bases.
 */
function buildPaydaySteps(): EventoStep[] {
  const variantes = [
    {
      s: 'pay_m',
      utc: 12, // 09h BRT
      subject: 'Caiu o salário? ☀️ separa um trocado pro que importa',
      preheader: 'Dia de pagamento é dia de garantir sua vaga.',
      selo: 'Dia de pagamento',
      headline: 'Caiu na conta!',
      body: [
        'Bom dia, {{nome}}! Hoje é aquele dia gostoso: o salário caiu. 🤑',
        'Antes que ele evapore em boleto, separa um cantinho pra você: sua vaga no Somma Special Day, o aniversário de 1 ano do Somma, dia 18/07.',
        'É o melhor investimento do mês: 4 km ou 8 km, comunidade animada e pagode ao vivo. 🥁',
      ],
      wa: 'Oi! Hoje é dia de pagamento e quero garantir minha vaga no Special Day 🤑',
    },
    {
      s: 'pay_t',
      utc: 16, // 13h BRT
      subject: 'Pagou o cartão? 💳 agora paga o que faz bem',
      preheader: 'Resolveu as contas? Guarda um pedacinho pra correr.',
      selo: 'Dia de pagamento',
      headline: 'Paga as contas e vem',
      body: [
        'Boa tarde, {{nome}}! Já pagou o cartão, matou os boletos e sobrou aquele respiro?',
        'Então bora usar um pedacinho com o que faz bem de verdade: correr. Sua vaga no Somma Special Day tá te esperando, dia 18/07.',
        '1º lote no app Track&Field. Depois o preço sobe, então hoje é o dia certo de garantir.',
      ],
      wa: 'Oi! Quero garantir minha vaga no Special Day hoje 💳',
    },
    {
      s: 'pay_n',
      utc: 22, // 19h BRT
      subject: 'Fecha o dia de pagamento com chave de ouro 🌙',
      preheader: 'Investe em você antes do dia acabar.',
      selo: 'Dia de pagamento',
      headline: 'Fecha o mês correndo',
      body: [
        'Boa noite, {{nome}}! O dia de pagamento tá acabando, e fica a pergunta: já garantiu sua vaga?',
        'Se ainda não, dá tempo. O Somma Special Day é dia 18/07, aniversário de 1 ano do Somma, com 4 km ou 8 km e muito pagode. 🥁',
        'Investe em você: garante o 1º lote antes que o preço suba.',
      ],
      wa: 'Oi! Quero fechar o dia garantindo minha vaga no Special Day 🌙',
    },
  ] as const

  const bases: EventoBase[] = ['lista_vip', 'checkins', 'cadastro_site']
  const steps: EventoStep[] = []
  for (const base of bases) {
    for (const v of variantes) {
      steps.push({
        base,
        step: v.s,
        sendAt: `2026-07-07T${pad2(v.utc)}:00:00Z`,
        subject: v.subject,
        preheader: v.preheader,
        selo: v.selo,
        headline: v.headline,
        body: [...v.body],
        showPrice: true,
        cta: 'Garantir minha vaga',
        ctaUrl: BUY_URL,
        waText: v.wa,
      })
    }
  }
  return steps
}

/**
 * Aviso de retirada de kit (sexta 17/07, véspera do evento): 3 disparos ao longo
 * do dia (12h, 16h, 20h BRT) para TODAS as bases, avisando que a entrega dos kits
 * está liberada na Loja Track&Field do Brasília Shopping, das 10h às 22h.
 * Mesma copy nas 3 bases; o tom sobe de urgência do meio-dia até a noite.
 */
function buildKitSteps(): EventoStep[] {
  // Busca por lugar (path-based, sem query param) evita quebrar o & de "Track&Field".
  const MAPS_URL = 'https://www.google.com/maps/search/Track+Field+Bras%C3%ADlia+Shopping'
  const KIT_WA = 'Oi! Tenho uma dúvida sobre a retirada do meu kit do Special Day'

  const variantes = [
    {
      s: 'kit1',
      utc: 15, // 12h BRT
      subject: 'ENTREGA DE KITS LIBERADA! 🧡',
      preheader: 'Retire seu kit hoje na Track&Field do Brasília Shopping, das 10h às 22h.',
      selo: 'Retirada de kits',
      headline: 'Seu kit já pode ser retirado',
      body: [
        'Chegou a hora, {{nome}}! 🧡',
        'A entrega dos kits do Somma Special Day está LIBERADA. É só passar na 📍 Loja Track&Field do Brasília Shopping pra pegar o seu.',
        'Hoje (sexta), das 10h às 22h.',
        'Amanhã é dia de correr — chega com o kit já em mãos. 🏃',
      ],
    },
    {
      s: 'kit2',
      utc: 19, // 16h BRT
      subject: 'Já pegou seu kit? 👀 Track&Field até 22h',
      preheader: 'Os kits estão sendo entregues hoje até as 22h. Não deixa pra depois.',
      selo: 'Retirada de kits',
      headline: 'Não deixa pra depois',
      body: [
        'Oi, {{nome}}! Lembrete rápido: 👀',
        'Os kits do Somma Special Day estão sendo entregues HOJE, das 10h às 22h, na 📍 Loja Track&Field do Brasília Shopping.',
        'Amanhã cedo é a largada — garanta o seu hoje e chegue tranquilo.',
      ],
    },
    {
      s: 'kit3',
      utc: 23, // 20h BRT
      subject: '⏰ Últimas horas pra retirar seu kit (até 22h)',
      preheader: 'A retirada de kits fecha às 22h de hoje. Corre que dá tempo!',
      selo: 'Últimas horas',
      headline: 'Corre que dá tempo!',
      body: [
        '{{nome}}, a retirada de kits fecha às 22h de HOJE! ⏰',
        'Se ainda não pegou o seu, dá um pulo na 📍 Loja Track&Field do Brasília Shopping antes de fechar.',
        'Amanhã tem Somma Special Day e a gente quer você com o kit em mãos. 🧡',
      ],
    },
  ] as const

  const bases: EventoBase[] = ['lista_vip', 'checkins', 'cadastro_site']
  const steps: EventoStep[] = []
  for (const base of bases) {
    for (const v of variantes) {
      steps.push({
        base,
        step: v.s,
        sendAt: `2026-07-17T${pad2(v.utc)}:00:00Z`,
        subject: v.subject,
        preheader: v.preheader,
        selo: v.selo,
        headline: v.headline,
        body: [...v.body],
        showPrice: false,
        cta: 'Como chegar',
        ctaUrl: MAPS_URL,
        waText: KIT_WA,
      })
    }
  }
  return steps
}

/**
 * Régua Day Use (17/07): 3 e-mails ao longo do dia (12h30, 16h50 e 20h BRT) para
 * a base unificada (VIP + check-ins + cadastro do site, deduplicada). Foco no
 * ingresso do after (R$ 75), pra quem não vai correr mas quer viver o dia.
 * Nasce ATIVA (defaultEnabled) porque é um disparo pontual já aprovado.
 */
function buildDayUseSteps(): EventoStep[] {
  const WA = 'Oi! Quero garantir meu Day Use do Special Day 🎟️'
  return [
    {
      base: 'dayuse',
      step: 'dayuse1',
      sendAt: '2026-07-17T15:30:00Z', // 12h30 BRT
      defaultEnabled: true,
      subject: 'É amanhã. E você ainda pode entrar 👀',
      preheader: 'Não vai correr? O after completo do Special Day é seu por R$ 75.',
      selo: 'É amanhã',
      headline: 'O after é seu',
      body: [
        'Bora ser sincero, {{nome}}: nem todo mundo quer acordar pra correr 8 km. 😅',
        'Mas ninguém quer ficar de fora do after mais insano de Brasília.',
        'Por isso existe o Day Use: você não corre, não pega kit — mas vive o dia inteiro do Special Day, com acesso a tudo:',
        '• Samba ao vivo com a Resenha do Sabino',
        '• DJ até o pôr do sol',
        '• Gincana Somma (competição, zoeira e premiação)',
        '• Sorteios o dia todo, bar e ativações dos parceiros',
        'É o aniversário de 1 ano do Somma, amanhã (18/07). Depois não tem "ah, eu queria ter ido".',
      ],
      showPrice: true,
      cta: 'Garantir meu Day Use',
      ctaUrl: DAYUSE_URL,
      waText: WA,
    },
    {
      base: 'dayuse',
      step: 'dayuse2',
      sendAt: '2026-07-17T19:50:00Z', // 16h50 BRT
      defaultEnabled: true,
      subject: 'Tudo que te espera no Special Day (com Day Use) 🥁',
      preheader: 'Samba, gincana, praça de alimentação, recovery e sorteios. O Day Use libera tudo.',
      selo: 'A experiência',
      headline: 'Do café ao pôr do sol',
      body: [
        'Você pediu, {{nome}}, a gente detalha. Esse é o rolê que o seu Day Use libera 👇',
        'A programação do dia:',
        '• 08h–09h · Fit Dance + café da manhã Big Box',
        '• 09h–12h · Roda de samba & ativações',
        '• 11h–13h30 · Gincana Somma (provas em equipe + premiação)',
        '• 13h30–15h · DJ & encerramento social',
        'Tem praça de alimentação com de tudo — churrasquinho, arroz carreteiro, açaí, crepe e os shakes da DOPAHMINA — e um recovery completo: banheiro de gelo, hidratação e mais.',
        'E sorteios o dia inteiro: brindes dos parceiros, vouchers e combos do bar Somma.',
        'Fica a dica: leve uma roupa extra. Tem duchas liberadas e banheiro com chuveiro pra você voltar novo pro after.',
        'Só um detalhe honesto: o sorteio do tênis Adidas Evo SL é exclusivo de quem comprou o kit. O Day Use concorre a todos os outros. 😉',
      ],
      showPrice: true,
      cta: 'Quero meu Day Use',
      ctaUrl: DAYUSE_URL,
      waText: WA,
    },
    {
      base: 'dayuse',
      step: 'dayuse3',
      sendAt: '2026-07-17T23:00:00Z', // 20h BRT
      defaultEnabled: true,
      subject: '⏰ Última chamada: o Special Day é amanhã',
      preheader: 'Depois de hoje, o "quero ir" vira "queria ter ido". R$ 75 e você tá dentro.',
      selo: 'Última chamada',
      headline: 'Última chamada',
      body: [
        'É agora ou o story dos outros amanhã, {{nome}}. 👀',
        'O Special Day é amanhã (18/07) e essa é a última chamada pro seu Day Use.',
        'Enquanto você lê isso, a galera já tá garantindo o lugar na roda de samba, no time da gincana e na fila dos sorteios.',
        'O que te espera:',
        '• Acesso a todo o after — samba ao vivo, DJ, gincana, bar e ativações',
        '• Sorteios o dia inteiro',
        '• Praça de alimentação e recovery completo',
        '• A melhor comunidade de Brasília reunida',
        'Sem correr, sem complicação. Só o melhor do dia, por R$ 75.',
      ],
      showPrice: true,
      cta: 'Garantir agora',
      ctaUrl: DAYUSE_URL,
      waText: WA,
    },
  ]
}

export const EVENTO_STEPS: EventoStep[] = [
  // ===================== RÉGUA DAY USE · todas as bases (dedup) =====================
  ...buildDayUseSteps(),

  // ===================== RÉGUA 1 · lista_vip =====================
  {
    base: 'lista_vip',
    step: 'e1',
    sendAt: '2026-07-03T13:00:00Z',
    subject: 'Sua vaga tá guardadinha 👀 falta só o ingresso',
    preheader: '1º lote por R$ 127,50 com o cupom SOMMA15. Bora?',
    selo: 'Bora garantir',
    headline: 'Falta só o ingresso',
    body: [
      'Oi, {{nome}}! Você entrou na pré-venda do Somma Special Day e a gente não ia deixar isso passar batido. 🧡',
      'A pré-venda fechou, mas relaxa: o 1º lote já tá no ar e a compra é rapidinha, direto no app Track&Field.',
      'É só seguir esses passos:',
      '• Abra o app Track&Field',
      '• Busque por "Somma Special Day"',
      '• Escolha 4 km ou 8 km e finalize',
      'Prontinho, sua vaga no aniversário de 1 ano do Somma tá garantida.',
    ],
    showPrice: true,
    cta: 'Garantir meu ingresso',
    ctaUrl: BUY_URL,
    waText: 'Oi! Quero garantir meu ingresso do Somma Special Day 🏃',
  },
  {
    base: 'lista_vip',
    step: 'e2',
    sendAt: '2026-07-07T13:00:00Z',
    subject: 'Deixa eu te contar como vai ser esse dia 🏃',
    preheader: '4 ou 8 km, comunidade animada e 1 ano de Somma pra comemorar.',
    selo: 'A experiência',
    headline: 'Vai ser inesquecível',
    body: [
      'Oi, {{nome}}! Bora imaginar o dia 18/07 juntos?',
      'A largada é logo cedo, num percurso lindo pela região das embaixadas, em Brasília. Você escolhe o seu desafio:',
      '• 4 km pra curtir no seu ritmo',
      '• 8 km pra ir com tudo',
      'E não é só corrida, não: é o aniversário de 1 ano do Somma Club, com a energia da nossa comunidade do começo ao fim.',
      'O ingresso tá no 1º lote e o preço só sobe daqui pra frente. Melhor garantir logo.',
    ],
    showPrice: true,
    cta: 'Quero fazer parte',
    ctaUrl: BUY_URL,
    waText: 'Oi! Quero saber mais sobre o Somma Special Day 🏃',
  },
  {
    base: 'lista_vip',
    step: 'e3',
    sendAt: '2026-07-11T13:00:00Z',
    subject: 'Segura essa: o preço só sobe daqui pra frente ⏳',
    preheader: '1º lote por R$ 127,50 com SOMMA15 e ainda leva o bônus Porto Seguro.',
    selo: 'Menor preço',
    headline: 'O preço só sobe',
    body: [
      'Um lembrete rapidinho e sincero, {{nome}}:',
      'O ingresso tá no 1º lote, que é o menor preço que vai rolar. A cada lote novo, ele sobe.',
      'E tem mais: fechando agora você ainda leva o bônus Porto Seguro junto.',
      'Faltam poucos dias pro dia 18/07. Garante o seu enquanto tá baratinho.',
    ],
    showPrice: true,
    cta: 'Garantir no 1º lote',
    ctaUrl: BUY_URL,
    waText: 'Oi! Tive um probleminha pra comprar o ingresso do Special Day, me ajudam?',
  },
  {
    base: 'lista_vip',
    step: 'e4',
    sendAt: '2026-07-15T13:00:00Z',
    subject: 'Faltam 3 dias 🏁 já é seu?',
    preheader: 'Checklist rapidinho pra você chegar 100% no dia.',
    selo: 'Faltam 3 dias',
    headline: 'Contagem regressiva',
    body: [
      'Oi, {{nome}}! A contagem começou: faltam só 3 dias pro Somma Special Day. 🏁',
      'Se você ainda não fechou o ingresso, é agora. 4 km ou 8 km, dia 18/07.',
      'Bora conferir o checklist?',
      '• Ingresso comprado no app Track&Field',
      '• Tênis e roupa já separados',
      '• Alarme pro sábado bem cedo 😅',
      '• Aquele amigo que vive falando "bora correr" convidado',
      'Faltou o primeiro item? Resolve agora mesmo.',
    ],
    showPrice: false,
    cta: 'Fechar meu ingresso',
    ctaUrl: BUY_URL,
    waText: 'Oi! Quero ajuda pra fechar meu ingresso do Special Day',
  },
  {
    base: 'lista_vip',
    step: 'e5',
    sendAt: '2026-07-17T13:00:00Z',
    subject: 'É amanhã! 📍 tudo que você precisa saber',
    preheader: 'Horário, local, largada e kit. Anota aí!',
    selo: 'É amanhã',
    headline: 'Amanhã é dia de correr',
    body: [
      'Amanhã é o grande dia, {{nome}}! 🧡 Anota tudo pra não errar:',
      '• Sábado, 18/07, às 06h (chega com folga)',
      '• COPMDF, em Brasília, com largada e chegada no mesmo lugar',
      '• 4 km ou 8 km, você escolhe na hora',
      '• Não esquece de retirar o seu kit',
      'Ainda não pegou seu ingresso? Dá tempo, o 1º lote tá no app Track&Field.',
    ],
    showPrice: false,
    cta: 'Ver os detalhes do dia',
    ctaUrl: BUY_URL,
    waText: 'Oi! Tenho uma dúvida sobre o Special Day de amanhã',
  },
  {
    base: 'lista_vip',
    step: 'e6',
    sendAt: '2026-07-18T07:30:00Z',
    subject: 'É HOJE! 🧡 bora Somma',
    preheader: 'A gente te espera na largada às 06h.',
    selo: 'É hoje',
    headline: 'Hoje a pista é nossa',
    body: [
      'É HOJE, {{nome}}! 🎉',
      'O aniversário de 1 ano do Somma acontece daqui a pouquinho. Largada às 06h, no COPMDF.',
      'Só uns lembretes finais:',
      '• Chega cedo pra pegar seu kit',
      '• Leva água e muita energia',
      '• Vem com a camiseta e o melhor sorriso',
      'A gente te espera lá. 🧡',
    ],
    showPrice: false,
    cta: 'Como chegar',
    ctaUrl: SITE_URL,
    waText: 'Oi! Tô indo pro Special Day, dúvida de última hora: ',
  },

  // ===================== RÉGUA 2 · checkins =====================
  {
    base: 'checkins',
    step: 'c1',
    sendAt: '2026-07-04T21:00:00Z',
    subject: 'Cadê você que sumiu da pista? 🧡',
    preheader: 'O Somma tá fazendo 1 ano e quer você de volta.',
    selo: 'Volta pra pista',
    headline: 'A gente sentiu sua falta',
    body: [
      'Oi, {{nome}}! Faz um tempinho que a gente não corre junto, e isso precisa mudar. 🧡',
      'O Somma Club tá completando 1 ano e a gente quer comemorar do jeito que mais gosta: correndo. No dia 18/07 tem o Somma Special Day, em Brasília, com 4 km ou 8 km do seu jeito.',
      'Você já conhece a energia da nossa comunidade. Que tal viver tudo isso de novo?',
    ],
    showPrice: false,
    cta: 'Quero voltar a correr',
    ctaUrl: SITE_URL,
    waText: 'Oi! Quero voltar a correr com o Somma no Special Day 🧡',
  },
  {
    base: 'checkins',
    step: 'c2',
    sendAt: '2026-07-10T21:00:00Z',
    subject: 'Já imaginou correr pela região das embaixadas?',
    preheader: '4 ou 8 km com a energia da comunidade Somma.',
    selo: 'Um convite',
    headline: 'Bora correr junto?',
    body: [
      'Oi, {{nome}}! Deixa a gente te fazer um convite.',
      'No dia 18/07, o Somma Special Day toma conta de um dos trajetos mais bonitos de Brasília, a região das embaixadas. Você escolhe: 4 km pra curtir ou 8 km pra desafiar.',
      'Se você já correu com a gente, sabe que não é só sobre a distância. É sobre a galera, o pós-corrida e aquela sensação boa de pertencer. E se faz tempo que você não aparece, esse é o convite perfeito pra reencontrar tudo isso.',
    ],
    showPrice: false,
    cta: 'Ver o evento',
    ctaUrl: SITE_URL,
    waText: 'Oi! Me ajuda a escolher entre 4km e 8km no Special Day?',
  },
  {
    base: 'checkins',
    step: 'c3',
    sendAt: '2026-07-16T21:00:00Z',
    subject: 'Última chamada 🏁 18/07 é logo ali',
    preheader: 'Bora fechar seu lugar nesse corre?',
    selo: 'Última chamada',
    headline: 'Seu lugar tá te esperando',
    body: [
      'Oi, {{nome}}! É essa semana. 🏁',
      'O Somma Special Day é dia 18/07, no COPMDF. Ainda dá tempo de entrar nessa com a gente, com 4 km ou 8 km.',
      'Um ano de Somma se comemora na pista, e o seu lugar tá guardado.',
    ],
    showPrice: false,
    cta: 'Entrar nessa',
    ctaUrl: SITE_URL,
    waText: 'Oi! Quero entrar na corrida do Special Day dia 18/07',
  },

  // ===================== RÉGUA 3 · cadastro_site =====================
  ...buildPaydaySteps(),
  ...buildCadastroSteps(),

  // ===================== Aviso de retirada de kit (17/07, todas as bases) =====================
  ...buildKitSteps(),
]

export function getEventoStep(base: string, step: string): EventoStep | undefined {
  return EVENTO_STEPS.find((s) => s.base === base && s.step === step)
}

export function stepsForBase(base: EventoBase): EventoStep[] {
  return EVENTO_STEPS.filter((s) => s.base === base)
}

export function accentForBase(base: EventoBase): string {
  return REGUAS_META.find((m) => m.base === base)?.accent ?? '#FF4800'
}
