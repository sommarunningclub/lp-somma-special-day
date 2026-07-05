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

export type EventoBase = 'lista_vip' | 'checkins' | 'cadastro_site'

export interface EventoStep {
  base: EventoBase
  /** Único dentro da base (usado no dedup). */
  step: string
  /** Momento programado de envio (ISO 8601, UTC). */
  sendAt: string
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

export const REGUAS_META: EventoReguaMeta[] = [
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
    descricao: 'Despertar a base antiga com o gancho do aniversário de 1 ano.',
    accent: '#FDB716',
  },
]

export const EVENTO_STEPS: EventoStep[] = [
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
  {
    base: 'cadastro_site',
    step: 's1',
    sendAt: '2026-07-05T13:00:00Z',
    subject: '1 ano de Somma 🧡 e essa história tem você',
    preheader: 'Bora comemorar correndo junto?',
    selo: '1 ano de Somma',
    headline: 'Essa história tem você',
    body: [
      'Oi, {{nome}}! Um tempo atrás você deixou seu cadastro com a gente, e a gente guardou isso com carinho. 🧡',
      'Agora tem um motivo especial pra te chamar de volta: o Somma Club tá completando 1 ano, e a festa vai ser do nosso jeito, correndo juntos.',
      'É o Somma Special Day, dia 18/07, em Brasília. Uma corrida, uma comunidade e um aniversário. A sua história com o Somma pode continuar aqui.',
    ],
    showPrice: false,
    cta: 'Quero participar',
    ctaUrl: SITE_URL,
    waText: 'Oi! Vi sobre o aniversário de 1 ano do Somma e quero participar',
  },
  {
    base: 'cadastro_site',
    step: 's2',
    sendAt: '2026-07-12T13:00:00Z',
    subject: 'Vem correr o aniversário de 1 ano do Somma 🎉',
    preheader: '4 ou 8 km, dia 18/07, em Brasília.',
    selo: 'Vem participar',
    headline: 'Bora fazer parte disso?',
    body: [
      'Oi, {{nome}}! Bora fazer parte dessa festa?',
      'No dia 18/07, o Somma Special Day comemora 1 ano do Somma Club com uma corrida em Brasília. Você escolhe a sua distância:',
      '• 4 km pra entrar no ritmo',
      '• 8 km pra ir mais longe',
      'Participar é fácil: o ingresso tá no 1º lote, no app Track&Field.',
      'Faz tempo que você pensa em voltar a correr? Esse é o empurrãozinho. 🧡',
    ],
    showPrice: true,
    cta: 'Quero entrar nessa',
    ctaUrl: BUY_URL,
    waText: 'Oi! Como faço pra participar do Somma Special Day?',
  },
  {
    base: 'cadastro_site',
    step: 's3',
    sendAt: '2026-07-17T21:00:00Z',
    subject: 'É esse fim de semana! 🏃 vem com a gente',
    preheader: 'Última chamada pro Special Day.',
    selo: 'É essa semana',
    headline: 'Vem com a gente',
    body: [
      'Oi, {{nome}}! É amanhã!',
      'O Somma Special Day acontece dia 18/07, no COPMDF, em Brasília. É o aniversário de 1 ano do Somma, e ainda dá tempo de você fazer parte.',
      '4 km ou 8 km, você escolhe. O ingresso tá no app Track&Field.',
      'Que tal transformar aquele cadastro antigo numa medalha no sábado? 🏅',
    ],
    showPrice: false,
    cta: 'Participar agora',
    ctaUrl: BUY_URL,
    waText: 'Oi! Ainda dá tempo de participar do Special Day?',
  },
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
