/**
 * Campanha de escassez — fim do lote VIP (R$ 97 com cupom SOMMAVIP).
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
    subject: 'O valor VIP de R$ 97 acaba domingo',
    kicker: 'Aviso importante',
    headline: 'Seu valor VIP de R$ 97 acaba domingo',
    countdown: 'Faltam 4 dias',
    message:
      'Você está na Lista VIP, então tem o cupom SOMMAVIP que deixa a inscrição do Somma Special Day por R$ 97. Mas atenção: esse valor vale só até domingo (21/06). Depois, o 1º lote vira e o preço sobe para R$ 119. Garanta a sua vaga agora com o melhor preço.',
    cta: 'Garantir minha vaga por R$ 97',
    theme: 'normal',
  },
  {
    step: 'd3',
    sendAt: '2026-06-18T13:00:00Z',
    subject: 'Faltam 3 dias pro fim do 1º lote (R$ 97)',
    kicker: 'Contagem regressiva',
    headline: 'Faltam 3 dias pro fim do 1º lote',
    countdown: 'Faltam 3 dias',
    message:
      'O cupom SOMMAVIP ainda garante a inscrição por R$ 97, mas o tempo está acabando. No domingo o 1º lote encerra e o valor sobe para R$ 119. Não deixe pra última hora.',
    cta: 'Aplicar cupom e garantir R$ 97',
    theme: 'normal',
  },
  {
    step: 'd2',
    sendAt: '2026-06-19T13:00:00Z',
    subject: 'Só até domingo: R$ 97 com o cupom SOMMAVIP',
    kicker: 'Só até domingo',
    headline: 'Neste fim de semana o 1º lote encerra',
    countdown: 'Faltam 2 dias',
    message:
      'Quem garantir a vaga até domingo paga R$ 97 com o cupom SOMMAVIP. Depois disso, o valor passa a ser R$ 119. Aproveite o fim de semana para fechar a sua inscrição.',
    cta: 'Garantir R$ 97 agora',
    theme: 'normal',
  },
  {
    step: 'd1_amanha',
    sendAt: '2026-06-20T13:00:00Z',
    subject: '⏰ Amanhã o preço sobe — último dia de R$ 97',
    kicker: 'Último dia amanhã',
    headline: 'Amanhã o preço sobe',
    countdown: 'Falta 1 dia',
    message:
      'Amanhã (domingo) é o último dia do valor VIP de R$ 97. Na segunda, o 1º lote já era e a inscrição passa a R$ 119. Garanta hoje e não corra o risco de perder o melhor preço.',
    cta: 'Garantir antes que suba',
    theme: 'alerta',
  },
  {
    step: 'd0_hoje',
    sendAt: '2026-06-21T13:00:00Z',
    subject: '🚨 Últimas horas: R$ 97 vira R$ 119 hoje',
    kicker: 'É hoje',
    headline: 'Últimas horas do valor de R$ 97',
    countdown: 'Acaba hoje à meia-noite',
    message:
      'Hoje é o último dia do 1º lote. Até a meia-noite, o cupom SOMMAVIP garante a inscrição por R$ 97. Depois disso, o valor sobe para R$ 119. É agora.',
    cta: 'Garantir meu R$ 97 agora',
    theme: 'final',
  },
  {
    step: 'd0_noite',
    sendAt: '2026-06-21T23:00:00Z',
    subject: 'Acaba à meia-noite: garanta R$ 97 agora',
    kicker: 'Última chamada',
    headline: 'Acaba à meia-noite',
    countdown: 'Últimas horas',
    message:
      'Faltam poucas horas para o fim do valor VIP. Depois da meia-noite, o cupom SOMMAVIP não vale mais e a inscrição passa a R$ 119. Garanta o seu R$ 97 enquanto dá tempo.',
    cta: 'Garantir antes da meia-noite',
    theme: 'final',
  },
]

export function getCountdownStep(step: string): CountdownStep | undefined {
  return COUNTDOWN_STEPS.find((s) => s.step === step)
}
