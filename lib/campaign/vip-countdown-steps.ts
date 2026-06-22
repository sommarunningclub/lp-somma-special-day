/**
 * Campanha de escassez — fim do lote VIP (R$ 127,50 com cupom SOMMA15).
 * Sequência de contagem regressiva enviada à lista_vip de qua 17/06 a dom 21/06/2026.
 *
 * Horários em UTC. Brasil não tem horário de verão em 2026, então BRT = UTC-3:
 *   10h BRT = 13:00 UTC · 20h BRT = 23:00 UTC.
 */

export type CountdownStepKey =
  | 'd4_anuncio'
  | 'd3'
  | 'd2'
  | 'd1_amanha'
  | 'd0_hoje'
  | 'd0_noite'

export interface CountdownStep {
  /** Identificador único usado para dedup em vip_campaign_sends. */
  step: CountdownStepKey
  /** Momento programado de envio (ISO 8601, UTC). */
  sendAt: string
  /** Assunto do e-mail. */
  subject: string
  /** Rótulo pequeno acima do título (faixa de urgência). */
  kicker: string
  /** Título principal (grande). */
  headline: string
  /** Texto da contagem (ex.: "Faltam 3 dias"). */
  countdown: string
  /** Parágrafo de corpo. */
  message: string
  /** Texto do botão CTA. */
  cta: string
  /** Intensidade visual da faixa de urgência. */
  theme: 'normal' | 'alerta' | 'final'
}

export const COUNTDOWN_STEPS: CountdownStep[] = [
  {
    step: 'd4_anuncio',
    sendAt: '2026-06-17T23:00:00Z',
    subject: 'O valor VIP de R$ 127,50 acaba domingo',
    kicker: 'Aviso importante',
    headline: 'Seu valor VIP de R$ 127,50 acaba domingo',
    countdown: 'Faltam 4 dias',
    message:
      'Você está na Lista VIP, então tem o cupom SOMMA15 que deixa a inscrição do Somma Special Day por R$ 127,50. Mas atenção: esse valor vale só até domingo (21/06). Depois, o 1º lote vira e o preço sobe para R$ 150,00. Garanta a sua vaga agora com o melhor preço.',
    cta: 'Garantir minha vaga por R$ 127,50',
    theme: 'normal',
  },
  {
    step: 'd3',
    sendAt: '2026-06-18T13:00:00Z',
    subject: 'Faltam 3 dias pro fim do 1º lote (R$ 127,50)',
    kicker: 'Contagem regressiva',
    headline: 'Faltam 3 dias pro fim do 1º lote',
    countdown: 'Faltam 3 dias',
    message:
      'O cupom SOMMA15 ainda garante a inscrição por R$ 127,50, mas o tempo está acabando. No domingo o 1º lote encerra e o valor sobe para R$ 150,00. Não deixe pra última hora.',
    cta: 'Aplicar cupom e garantir R$ 127,50',
    theme: 'normal',
  },
  {
    step: 'd2',
    sendAt: '2026-06-19T13:00:00Z',
    subject: 'Só até domingo: R$ 127,50 com o cupom SOMMA15',
    kicker: 'Só até domingo',
    headline: 'Neste fim de semana o 1º lote encerra',
    countdown: 'Faltam 2 dias',
    message:
      'Quem garantir a vaga até domingo paga R$ 127,50 com o cupom SOMMA15. Depois disso, o valor passa a ser R$ 150,00. Aproveite o fim de semana para fechar a sua inscrição.',
    cta: 'Garantir R$ 127,50 agora',
    theme: 'normal',
  },
  {
    step: 'd1_amanha',
    sendAt: '2026-06-20T13:00:00Z',
    subject: '⏰ Amanhã o preço sobe — último dia de R$ 127,50',
    kicker: 'Último dia amanhã',
    headline: 'Amanhã o preço sobe',
    countdown: 'Falta 1 dia',
    message:
      'Amanhã (domingo) é o último dia do valor VIP de R$ 127,50. Na segunda, o 1º lote já era e a inscrição passa a R$ 150,00. Garanta hoje e não corra o risco de perder o melhor preço.',
    cta: 'Garantir antes que suba',
    theme: 'alerta',
  },
  {
    step: 'd0_hoje',
    sendAt: '2026-06-21T13:00:00Z',
    subject: '🚨 Últimas horas: R$ 127,50 vira R$ 150,00 hoje',
    kicker: 'É hoje',
    headline: 'Últimas horas do valor de R$ 127,50',
    countdown: 'Acaba hoje à meia-noite',
    message:
      'Hoje é o último dia do 1º lote. Até a meia-noite, o cupom SOMMA15 garante a inscrição por R$ 127,50. Depois disso, o valor sobe para R$ 150,00. É agora.',
    cta: 'Garantir meu R$ 127,50 agora',
    theme: 'final',
  },
  {
    step: 'd0_noite',
    sendAt: '2026-06-21T23:00:00Z',
    subject: '🎉 VOCÊ GANHOU! Sua vaga no Somma Special Day',
    kicker: 'Você foi selecionado',
    headline: 'VOCÊ GANHOU UM CUPOM EXCLUSIVO!',
    countdown: 'Cupom liberado · acaba domingo 21/06',
    message:
      'Pode comemorar: você está na lista que vai pagar R$ 127,50 no Somma Special Day em vez de R$ 150,00 — sim, R$ 22,50 a menos só pra você. Agora vem o spoiler: dia 18/07 no COPMDF, das 6h às 14h, você vai correr 8km por um percurso fechado passando pelas embaixadas, atravessar a faixa de chegada com música ao vivo, tomar café da manhã na Big Box, brindar com drink-assinatura, descansar no Recovery Lounge, dançar samba na manhã e fechar a tarde com DJ no stage. Camiseta Thermodry oficial, kit de boas-vindas, fotos profissionais e uma das experiências mais aguardadas do ano em Brasília. 400 vagas. R$ 127,50. Cupom SOMMA15. Só até domingo.',
    cta: 'QUERO MEU INGRESSO POR R$ 127,50',
    theme: 'final',
  },
]

export function getCountdownStep(step: string): CountdownStep | undefined {
  return COUNTDOWN_STEPS.find((s) => s.step === step)
}
