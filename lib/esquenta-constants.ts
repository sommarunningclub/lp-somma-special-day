// Dados configuráveis do Esquenta SOMMA Special Day (Edição Especial Junina).
// Edite aqui data, horário, local, links de mapa, parceiros, programação, etc.

export const ESQUENTA = {
  nome: 'Esquenta Somma Special Day',
  edicao: 'Edição Especial Junina',
  data: 'Domingo, 28 de junho',
  dataCurta: '28 de junho',
  local: '106 Sul, Brasília DF',
  localCurto: '106 Sul',
  concentracao: '6h30',
  inicioCorre: '7h00',

  // CTA "Conhecer / Ver o Somma Special Day" → página principal
  siteUrl: 'https://specialday.sommaclub.com.br/',
  // CTA "Quero participar" → âncora (ou troque por um link de inscrição quando existir)
  participarHref: '#localizacao',

  // Localização (106 Sul, Brasília) — coordenadas e links de mapa configuráveis
  coords: { lat: -15.8140469, lng: -47.8968315 },
  maps: {
    abrirNoMaps:
      'https://www.google.com/maps/place//@-15.8140469,-47.8968315,17z/data=!3m1!1e3?hl=pt-BR',
    google: 'https://www.google.com/maps/dir/?api=1&destination=-15.8140469,-47.8968315',
    waze: 'https://waze.com/ul?ll=-15.8140469,-47.8968315&navigate=yes',
    apple: 'https://maps.apple.com/?daddr=-15.8140469,-47.8968315&dirflg=d',
  },
} as const

// Fotos reais da comunidade no corre do Eixão (otimizadas em /public/eixao_somma).
export const EIXAO_FOTOS: string[] = Array.from(
  { length: 11 },
  (_, i) => `/eixao_somma/eixao-${String(i + 1).padStart(2, '0')}.jpg`
)

export const EXPERIENCIAS = [
  { icone: 'corre', titulo: 'Corre no Eixão', texto: 'Um encontro especial para correr no ritmo da comunidade SOMMA.' },
  { icone: 'cafe', titulo: 'Café da manhã Big Box', texto: 'Um café da manhã especial para recuperar a energia depois do corre.' },
  { icone: 'milho', titulo: 'Comidas típicas', texto: 'Sabores de festa junina para completar a experiência.' },
  { icone: 'marca', titulo: 'Ativações de marcas', texto: 'Experiências, desafios, brindes e parceiros especiais.' },
  { icone: 'presente', titulo: 'Sorteios e surpresas', texto: 'Quem estiver presente poderá sair com presentes especiais.' },
  { icone: 'correio', titulo: 'Correio Elegante SOMMA', texto: 'Mensagens, convites, elogios e encontros entre pessoas da comunidade.' },
] as const

export const CONCURSO_PASSOS = [
  'Venha com sua caracterização junina.',
  'Faça o check-in no evento.',
  'Passe pelo ponto de avaliação.',
  'Aguarde o resultado durante a programação.',
  'A melhor produção recebe uma premiação especial.',
] as const

export const CORREIO_EXEMPLOS = [
  'Seu pace é bonito, mas seu sorriso é mais.',
  'Te vi correndo e perdi o fôlego.',
  'Vamos correr juntos no SOMMA Special Day?',
  'Você é meu PR favorito.',
] as const

export type ProgramaItem = { hora: string; titulo: string; texto: string; cor: string; destaque?: boolean }
export const PROGRAMACAO: ProgramaItem[] = [
  { hora: '06h30', titulo: 'Concentração & check-in', texto: 'Recepção e ativações para começar a manhã.', cor: '#FF4800' },
  { hora: '06h45', titulo: 'Aquecimento da comunidade', texto: 'Música, fotos, Correio Elegante e aquecimento.', cor: '#FDB716' },
  { hora: '07h00', titulo: 'Início do corre junino', texto: 'A largada do corre especial junino.', cor: '#FF4800', destaque: true },
  { hora: '07h45', titulo: 'Café da manhã Big Box', texto: 'Retorno do corre e abertura do café da manhã.', cor: '#005EFF' },
  { hora: '08h00', titulo: 'Arraiá & ativações', texto: 'Comidas típicas, ativações, fotos e Correio Elegante.', cor: '#FD6FDB' },
  { hora: '08h20', titulo: 'Sorteios & caracterização', texto: 'Sorteios e dinâmica da melhor caracterização junina.', cor: '#FDB716' },
  { hora: '08h45', titulo: 'Premiação do look junino', texto: 'Premiação do look junino mais criativo.', cor: '#FF4800', destaque: true },
  { hora: '09h00', titulo: 'Foto oficial & encerramento', texto: 'A foto oficial da comunidade e o encerramento.', cor: '#0a0a0a' },
]

// Parceiros — array configurável (adicione/remova/reordene à vontade).
// Use `logo` com o caminho do arquivo em /public quando tiver a arte; senão fica o nome.
export type Parceiro = { nome: string; logo?: string; destaque?: boolean; tag?: string }
export const PARCEIROS: Parceiro[] = [
  { nome: 'Big Box', destaque: true, tag: 'Café da manhã oficial' },
  { nome: 'Red Bull' },
  { nome: 'Evolve' },
  { nome: 'Estamina Recovery' },
]

export const FAQ = [
  {
    q: 'Preciso estar inscrito no SOMMA Special Day para participar?',
    a: 'Não necessariamente. O Esquenta é uma experiência especial da comunidade SOMMA e também uma oportunidade para conhecer melhor o clima do SOMMA Special Day.',
  },
  {
    q: 'Preciso correr para participar?',
    a: 'Não. Você pode caminhar, acompanhar a comunidade, participar das ativações e aproveitar o café da manhã.',
  },
  {
    q: 'A caracterização junina é obrigatória?',
    a: 'Não. Mas quem vier caracterizado participa do concurso de melhor look junino.',
  },
  {
    q: 'Posso levar amigos?',
    a: 'Sim. A ideia é trazer mais gente para viver a experiência SOMMA.',
  },
  {
    q: 'Onde será o encontro?',
    a: 'Na 106 Sul, em Brasília DF.',
  },
] as const
