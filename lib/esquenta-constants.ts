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

  // Foto de fundo do hero (troque por outra de /public/eixao_somma se quiser)
  heroFoto: '/eixao_somma/eixao-01.jpg',

  // Dados para "adicionar na agenda" (Google Calendar / .ics).
  // Horários em UTC (BRT = UTC-3): concentração 6h30 = 09:30Z, fim ~9h30 = 12:30Z.
  calendario: {
    titulo: 'Esquenta Somma Special Day · Edição Junina',
    descricao:
      'Corre no Eixão, café da manhã, ativações e muito arraiá. Concentração 6h30, corre começa 7h00. Cola lá: https://specialday.sommaclub.com.br/esquenta-junino',
    local: 'Eixão, Brasília DF',
    startUtc: '20260628T093000Z',
    endUtc: '20260628T123000Z',
  },

  // CTA "Conhecer / Ver o Somma Special Day" → página principal
  siteUrl: 'https://specialday.sommaclub.com.br/',

  // Oferta de cupom da corrida da Live (no fim do check-in)
  liveCupom: {
    pergunta: 'Bora correr na Live também?',
    descricao: 'Salva a agenda, resgata seu cupom e corre com 15% OFF na corrida da Live. Moleza.',
    cupom: 'SOMMALIVE15',
    agendaUrl: 'https://agenda.sommaclub.com.br/',
  },
  // CTA "Quero participar" → seção de check-in embutida
  participarHref: '#check-in',

  // Evento criado na gestão (admin). Os check-ins gravam neste evento_id.
  checkinEventoId: '83b744b2-e3a5-42fa-b5c4-09bdbcdf0d70',

  // Pelotões/distâncias do check-in (mesmas opções do check-in oficial).
  // Ajuste aqui se o Esquenta tiver distâncias diferentes.
  checkinPelotoes: [
    { value: '4km', label: 'No meu ritmo', desc: '4 km de boa' },
    { value: '6km', label: 'Pegando firme', desc: '6 km no embalo' },
    { value: '8km', label: 'Modo turbo', desc: '8 km com tudo' },
  ] as { value: string; label: string; desc: string }[],

  // Localização (106 Sul, Brasília). Coordenadas e links de mapa configuráveis.
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
  { icone: 'corre', titulo: 'Corre no Eixão', texto: 'A gente toma o Eixão e corre junto, no ritmo da galera. Bora?' },
  { icone: 'cafe', titulo: 'Café da Big Box', texto: 'Pós-corre merece café caprichado pra repor a energia. Por conta da Big Box.' },
  { icone: 'milho', titulo: 'Comidas típicas', texto: 'Pamonha, milho, canjica e os clássicos de arraiá pra fechar com chave de ouro.' },
  { icone: 'marca', titulo: 'Ativações das marcas', texto: 'Desafios, brindes e experiências dos parceiros que fazem essa festa rolar.' },
  { icone: 'presente', titulo: 'Sorteios e surpresas', texto: 'Quem aparece pode sair com brinde. A sorte sorri pra quem dá o pé na estrada.' },
  { icone: 'correio', titulo: 'Correio Elegante', texto: 'Manda aquele recado, elogio ou cantada. A gente entrega no dia. 💌' },
] as const

export const CONCURSO_PASSOS = [
  'Capricha no look junino e vem com tudo.',
  'Faz seu check-in quando chegar no evento.',
  'Dá um pulo no ponto de avaliação pra desfilar.',
  'Curte a programação enquanto a gente confere os looks.',
  'O visual mais arretado leva prêmio. Partiu?',
] as const

export const CORREIO_EXEMPLOS = [
  'Seu pace é bonito, mas seu sorriso é mais.',
  'Te vi correndo e perdi o fôlego.',
  'Bora correr juntos no Somma Special Day?',
  'Você é meu PR favorito.',
] as const

export type ProgramaItem = { hora: string; titulo: string; texto: string; cor: string; destaque?: boolean }
export const PROGRAMACAO: ProgramaItem[] = [
  { hora: '06h30', titulo: 'Chegada e check-in', texto: 'Cola cedo, faz o check-in e já entra no clima.', cor: '#FF4800' },
  { hora: '06h45', titulo: 'Esquenta da galera', texto: 'Música, fotos, Correio Elegante e aquecimento pra soltar o corpo.', cor: '#FDB716' },
  { hora: '07h00', titulo: 'Largada do corre', texto: 'A hora H. Todo mundo junto no Eixão.', cor: '#FF4800', destaque: true },
  { hora: '07h45', titulo: 'Café da Big Box', texto: 'Voltou do corre? Café caprichado te esperando.', cor: '#005EFF' },
  { hora: '08h00', titulo: 'Arraiá e ativações', texto: 'Comida típica, ativações, foto e os recados do Correio.', cor: '#FD6FDB' },
  { hora: '08h20', titulo: 'Sorteios e desfile junino', texto: 'Sorteio de brindes e a hora dos looks brilharem.', cor: '#FDB716' },
  { hora: '08h45', titulo: 'Premiação do look', texto: 'O visual mais arretado leva prêmio.', cor: '#FF4800', destaque: true },
  { hora: '09h00', titulo: 'Foto oficial e até a próxima', texto: 'A foto da comunidade e aquele até breve.', cor: '#0a0a0a' },
]

// Parceiros. Array configurável (adicione/remova/reordene à vontade).
// Use `logo` com o caminho do arquivo em /public quando tiver a arte; senão fica o nome.
export type Parceiro = { nome: string; logo?: string; destaque?: boolean; tag?: string; instagram?: string }
export const PARCEIROS: Parceiro[] = [
  { nome: 'Big Box', destaque: true, tag: 'Café da manhã é com eles', instagram: 'https://www.instagram.com/bigboxsupermercados/' },
  { nome: 'Red Bull', instagram: 'https://www.instagram.com/redbullbr/' },
  { nome: 'Evolve', instagram: 'https://www.instagram.com/academiaevolve/' },
  { nome: 'Estamina Recovery', instagram: 'https://www.instagram.com/estaminarecovery/' },
  { nome: 'Frooty Brasil', instagram: 'https://www.instagram.com/frootybrasil/' },
]

export const FAQ = [
  {
    q: 'Preciso estar inscrito no Somma Special Day pra participar?',
    a: 'Não! O Esquenta é da comunidade e tá aberto pra geral. É também a chance perfeita de sentir o clima do Somma Special Day antes de todo mundo.',
  },
  {
    q: 'Preciso correr pra participar?',
    a: 'De jeito nenhum. Pode caminhar, vir só pra acompanhar, curtir as ativações e atacar o café da manhã. Tá liberado.',
  },
  {
    q: 'A caracterização junina é obrigatória?',
    a: 'Não, mas é muito mais divertido com ela. E quem vem caracterizado concorre ao prêmio de melhor look. Capricha!',
  },
  {
    q: 'Posso levar a galera?',
    a: 'Pode e deve! Quanto mais gente, melhor. Chama os amigos e bora.',
  },
  {
    q: 'Onde é o encontro?',
    a: 'No Eixão, ali na altura da 106 Sul, em Brasília. Te esperamos lá!',
  },
] as const
