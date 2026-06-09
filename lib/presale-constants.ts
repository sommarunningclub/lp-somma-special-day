// Constantes da pré-venda Somma Special Day (seguras para client e server).

export const PRESALE = {
  // Cupom fixo liberado pela TF Sports (até 100 usos no app deles).
  cupom: 'SOMMAVIP',

  // Preço da inscrição com o cupom
  precoDe: 'R$ 119,00',
  precoPor: 'R$ 97,00',
  economia: 'R$ 22,00',
  descontoPct: '18,49%',

  // Vagas mostradas ao público (a folga real fica no admin, oculta).
  vagasPublicas: 100,

  // Link que abre direto a página do evento no app TF Sports.
  eventoUrl:
    'https://link-prod.tfsports.com.br/events/somma-day-aniversario-de-1-ano-02606022336',

  // Lojas de aplicativo
  appStoreUrl: 'https://apps.apple.com/br/app/tfsports/id1251078517',
  playStoreUrl:
    'https://play.google.com/store/apps/details?id=br.com.tfsports.customer&hl=pt_BR',
} as const

// Passo a passo de como comprar com o cupom (usado no e-mail e na tela de obrigado).
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
    texto: 'Toque no botão "Comprar minha inscrição" deste e-mail ou procure pelo Somma Special Day dentro do app.',
  },
  {
    n: '4',
    titulo: 'Escolha sua inscrição',
    texto: 'Selecione a modalidade, o kit e o tamanho da camiseta.',
  },
  {
    n: '5',
    titulo: `Aplique o cupom ${PRESALE.cupom}`,
    texto: `Na tela de pagamento, toque em "Inserir cupom" e digite ${PRESALE.cupom}. O valor cai de ${PRESALE.precoDe} para ${PRESALE.precoPor}.`,
  },
  {
    n: '6',
    titulo: 'Finalize o pagamento',
    texto: 'Pague com Pix ou cartão e pronto: sua vaga na pré-venda está garantida.',
  },
] as const
