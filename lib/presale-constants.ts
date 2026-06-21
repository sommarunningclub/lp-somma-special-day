// Constantes da pré-venda Somma Special Day (seguras para client e server).

export const PRESALE = {
  // Cupom fixo liberado pela TF Sports (até 100 usos no app deles).
  cupom: 'SOMMAVIP',

  // Preço da inscrição com o cupom
  precoDe: 'R$ 119,00',
  precoPor: 'R$ 97,00',
  economia: 'R$ 22,00',
  descontoPct: '18,49%',

  // Lote atual (a virada de lote é controlada no app da TF Sports).
  loteLabel: '1º lote',

  // Fim da pré-venda (R$ 97 / Lista VIP). Domingo 21/06/2026 23h59 (BRT, UTC-3).
  // Após esse instante, a Lista VIP e o cadastro da home fecham automaticamente.
  deadlineISO: '2026-06-21T23:59:59-03:00',

  // Link que abre direto a página do evento no app TF Sports.
  eventoUrl:
    'https://link-prod.tfsports.com.br/events/somma-day-aniversario-de-1-ano-02606022336',

  // Lojas de aplicativo
  appStoreUrl: 'https://apps.apple.com/br/app/tfsports/id1251078517',
  playStoreUrl:
    'https://play.google.com/store/apps/details?id=br.com.tfsports.customer&hl=pt_BR',
} as const

// Lotes de ingresso exibidos na home. A pré-venda (R$ 97) é capturada pelo
// cadastro (fluxo Lista VIP). Os lotes 1 e 2 são comprados direto no app TF Sports.
export type Lote = {
  key: 'pre' | 'l1' | 'l2'
  nome: string
  de: string | null
  por: string
  desconto: string | null
  quando: string
  bloqueado?: boolean
}

export const LOTES: Lote[] = [
  { key: 'pre', nome: 'Pré-venda', de: null, por: 'R$ 97,00', desconto: null, quando: 'Até domingo, 21/06 · 23h59' },
  { key: 'l1', nome: '1º Lote', de: 'R$ 150,00', por: 'R$ 127,50', desconto: '15% OFF', quando: 'A partir de segunda, 22/06' },
  { key: 'l2', nome: '2º Lote', de: 'R$ 150,00', por: 'R$ 135,00', desconto: '10% OFF', quando: 'Em breve', bloqueado: true },
]

// Passo a passo de como comprar com o cupom (usado no e-mail e na tela de obrigado).
// Fiel ao fluxo real do app TF Sports.
export const PRESALE_PASSOS = [
  {
    n: '1',
    titulo: 'Baixe o app TF Sports',
    texto: 'É gratuito. Disponível para iPhone (App Store) e Android (Google Play).',
  },
  {
    n: '2',
    titulo: 'Crie sua conta ou faça login',
    texto: 'Abra o app, toque em Entrar e, se ainda não tiver cadastro, selecione "Não tenho conta".',
  },
  {
    n: '3',
    titulo: 'Abra a página do evento',
    texto: 'Toque no botão "Comprar minha inscrição" deste e-mail ou procure por "Somma Special Day" dentro do app.',
  },
  {
    n: '4',
    titulo: 'Etapa Atletas',
    texto: 'Confirme você mesmo (Eu mesmo), marque o aceite do Regulamento e dos Termos e toque em Continuar.',
  },
  {
    n: '5',
    titulo: `Aplique o cupom ${PRESALE.cupom}`,
    texto: `Na etapa Preferências, toque em "Aplicar cupom" e digite ${PRESALE.cupom}. O valor cai de ${PRESALE.precoDe} para ${PRESALE.precoPor}.`,
  },
  {
    n: '6',
    titulo: 'Escolha turma, kit e tamanho',
    texto: 'Selecione a turma "Somma day", o Kit Experience e o tamanho da camiseta (Baby Look, P, M, G ou GG).',
  },
  {
    n: '7',
    titulo: 'Finalize o pagamento',
    texto: `Na confirmação aparece ${PRESALE.precoPor} + taxa de serviço. Pague com Pix ou cartão e pronto: sua vaga está garantida.`,
  },
] as const
