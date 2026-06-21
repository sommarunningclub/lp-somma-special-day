/**
 * Sequência de nutrição — 4 passos em 7 dias para leads capturados na home.
 * Offsets em HORAS contados a partir do `created_at` do lead.
 *
 * Lógica de branching: se o lead clicar no CTA de qualquer passo, ele pula
 * direto para o último (oferta_final). Veja lib/nutricao/dispatch.ts.
 */

export type NutricaoStepKey =
  | 'd0_boas_vindas'
  | 'd2_percurso'
  | 'd4_atracoes'
  | 'd6_oferta_final'

export interface NutricaoStep {
  step: NutricaoStepKey
  /** Quantas horas após o cadastro o e-mail deve ser disparado. */
  offsetHours: number
  /** Posição na sequência (1-indexed) para exibição no admin. */
  ordem: number
  subject: string
  kicker: string
  headline: string
  /** Selo grande acima do título (ex.: "Bem-vindo", "Spoiler #1"). */
  selo: string
  /** Parágrafo de corpo (1-3 frases). */
  message: string
  /** Texto do botão CTA. */
  cta: string
  /** Tema visual (afeta cor do banner topo). */
  theme: 'normal' | 'alerta' | 'final'
}

export const NUTRICAO_STEPS: NutricaoStep[] = [
  {
    step: 'd0_boas_vindas',
    offsetHours: 0,
    ordem: 1,
    subject: 'Bem-vindo ao Somma Special Day · 18.07',
    kicker: 'Boas-vindas',
    headline: 'VOCÊ ACABA DE ENTRAR NA COMUNIDADE QUE MAIS CRESCE EM BRASÍLIA.',
    selo: '#01 · Boas-vindas',
    message:
      'Que bom ter você aqui! No dia 18 de julho a gente vai celebrar 1 ano do Somma com o maior evento de corrida e comunidade do DF: 8 km de percurso fechado pelo COPMDF, café da manhã, drinks, samba ao vivo e DJ até a tarde. Nos próximos dias eu volto aqui pra te mostrar tudo o que vai rolar.',
    cta: 'Conhecer o evento',
    theme: 'normal',
  },
  {
    step: 'd2_percurso',
    offsetHours: 48,
    ordem: 2,
    subject: 'Spoiler #1 · o percurso passa por aqui 👀',
    kicker: 'Spoiler do evento',
    headline: '8 KM PELO CORAÇÃO DE BRASÍLIA — E NÃO É EM RUA QUALQUER.',
    selo: '#02 · Percurso',
    message:
      'A largada e a chegada são dentro do COPMDF, e o percurso passa pelas embaixadas, com vista pro Lago Paranoá. É um trecho fechado especialmente pro evento — não dá pra correr ali em dia normal. 8 km, ritmo livre, energia coletiva. Quem participou da primeira edição lembra: é onde a marca vira lembrança.',
    cta: 'Quero garantir minha vaga',
    theme: 'normal',
  },
  {
    step: 'd4_atracoes',
    offsetHours: 96,
    ordem: 3,
    subject: 'Spoiler #2 · o que tem depois da corrida',
    kicker: 'Spoiler do evento',
    headline: 'CORRER É SÓ O COMEÇO. DEPOIS COMEÇA A FESTA.',
    selo: '#03 · Atrações',
    message:
      'Café da manhã na Big Box, drink-assinatura, recovery lounge, fotos profissionais, samba ao vivo na manhã e DJ stage até a tarde. Camiseta oficial Thermodry no kit. 9 horas de evento, do nascer do sol ao fim da tarde. É a manhã (e a tarde) inteira em comunidade.',
    cta: 'Garantir minha inscrição',
    theme: 'normal',
  },
  {
    step: 'd6_oferta_final',
    offsetHours: 144,
    ordem: 4,
    subject: '🎉 Sua vaga no Somma Special Day · garanta agora',
    kicker: 'Última chamada',
    headline: 'CHEGOU A HORA DE GARANTIR SUA VAGA.',
    selo: '#04 · Oferta',
    message:
      'São 400 vagas no total — e elas acabam. A inscrição é feita pelo app TF Sports em poucos cliques. Clique no botão abaixo, baixe o app se ainda não tem e finalize sua inscrição. Te espero dia 18.07 no COPMDF.',
    cta: 'QUERO MINHA VAGA AGORA',
    theme: 'final',
  },
]

export function getNutricaoStep(step: string): NutricaoStep | undefined {
  return NUTRICAO_STEPS.find((s) => s.step === step)
}

export function getFinalStep(): NutricaoStep {
  return NUTRICAO_STEPS[NUTRICAO_STEPS.length - 1]
}
