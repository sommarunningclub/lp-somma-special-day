export type CotaKey = 'master' | 'ouro' | 'prata' | 'apoio'
export type AvulsaKey =
  | 'logo-camiseta'
  | 'hidratacao'
  | 'cafe-manha'
  | 'bar-drink'
  | 'recovery'
  | 'dj-stage'

export interface CotaSection {
  title: string
  items: string[]
}

export interface Cota {
  key: CotaKey
  nome: string
  valor: number
  vagas: string
  cor: 'orange' | 'yellow' | 'blue' | 'pink'
  sections: CotaSection[]
}

export interface Avulsa {
  key: AvulsaKey
  nome: string
  valor: number
  entrega: string
}

export const COTAS: Cota[] = [
  {
    key: 'master',
    nome: 'MASTER',
    valor: 40000,
    vagas: '1 vaga · exclusividade por segmento',
    cor: 'orange',
    sections: [
      {
        title: 'Benefícios exclusivos',
        items: [
          'Naming co-branded: "Somma Special Day apresenta [SUA MARCA] dentro da ativação da gincana"',
          'Exclusividade total no seu segmento de atuação',
          'Marca em destaque máximo em todas as peças',
        ],
      },
      {
        title: 'Ativação da marca',
        items: [
          'Espaço para ativação (tenda, decoração e operação por conta da marca)',
          'Inserção de produto/brinde no kit oficial dos 400 atletas',
          'Distribuição livre de materiais durante o evento',
          '10 cortesias para uso de relacionamento',
        ],
      },
      {
        title: 'Participação institucional',
        items: [
          'Fala da marca na abertura do evento',
          'Entrega de premiação de uma das categorias',
          'Vídeo institucional de até 30s no telão durante o pós-corrida',
          'Menção pelo apresentador nos principais momentos',
        ],
      },
      {
        title: 'Inserção da marca nos materiais',
        items: [
          'Logo principal no site do evento',
          'Destaque em todas as peças digitais de divulgação',
          'Rodapé de todos os e-mails da campanha',
          'Camiseta oficial do atleta (Thermodry Track&Field)',
          'Backdrop principal',
          'Painel cenográfico de chegada',
          'Sinalização do percurso',
          'Entrada do evento',
          'Totens de retirada de kit',
        ],
      },
    ],
  },
  {
    key: 'ouro',
    nome: 'OURO',
    valor: 25000,
    vagas: 'Até 2 vagas',
    cor: 'yellow',
    sections: [
      {
        title: 'Benefícios exclusivos',
        items: [
          'Alta visibilidade em peças principais',
          'Presença forte na ativação experiencial',
        ],
      },
      {
        title: 'Ativação da marca',
        items: [
          'Espaço para ativação (tenda, decoração e operação por conta da marca)',
          'Inserção de produto/brinde no kit oficial dos 400 atletas',
          'Distribuição livre de materiais durante o evento',
          '05 cortesias para uso de relacionamento',
        ],
      },
      {
        title: 'Participação institucional',
        items: [
          'Entrega de premiação de uma das categorias',
          'Vídeo institucional de até 15s no telão',
        ],
      },
      {
        title: 'Inserção da marca nos materiais',
        items: [
          'Logo no site do evento',
          'Peças digitais de divulgação',
          'Camiseta oficial do atleta',
          'Backdrop principal',
          'Entrada do evento',
        ],
      },
    ],
  },
  {
    key: 'prata',
    nome: 'PRATA',
    valor: 12000,
    vagas: 'Até 4 vagas',
    cor: 'blue',
    sections: [
      {
        title: 'Benefícios exclusivos',
        items: [
          'Presença consistente em materiais selecionados',
          'Branding e relacionamento qualificado',
        ],
      },
      {
        title: 'Ativação da marca',
        items: [
          'Espaço para ativação (tenda, decoração e operação por conta da marca)',
          'Inserção de produto/brinde no kit oficial',
          'Distribuição livre de materiais durante o evento',
          '03 cortesias para relacionamento',
        ],
      },
      {
        title: 'Inserção da marca nos materiais',
        items: [
          'Logo no site do evento',
          'Peças digitais de divulgação',
          'Backdrop de fotos',
        ],
      },
    ],
  },
  {
    key: 'apoio',
    nome: 'APOIO',
    valor: 4000,
    vagas: 'Vagas ilimitadas',
    cor: 'pink',
    sections: [
      {
        title: 'Benefícios exclusivos',
        items: [
          'Presença institucional na comunidade Somma',
          'Branding e relacionamento',
        ],
      },
      {
        title: 'Ativação da marca',
        items: [
          'Espaço de 6m² para ativação (estrutura por conta da marca)',
          '03 cortesias para relacionamento',
          'Distribuição livre de materiais durante o evento',
        ],
      },
      {
        title: 'Inserção da marca nos materiais',
        items: [
          'Logo no site do evento',
          'Divulgação do apoio nas redes sociais Somma',
        ],
      },
    ],
  },
]

export const AVULSAS: Avulsa[] = [
  { key: 'logo-camiseta', nome: 'Logo na camiseta oficial do atleta', valor: 8000, entrega: 'Alta visibilidade (400 peças)' },
  { key: 'hidratacao', nome: 'Hidratação Oficial (pontos no percurso + chegada)', valor: 10000, entrega: 'Presença massiva durante a corrida' },
  { key: 'cafe-manha', nome: 'Café da Manhã Oficial (ativação com Big Box)', valor: 12000, entrega: 'Momento de maior consumo do dia' },
  { key: 'bar-drink', nome: 'Bar/Drink Oficial (naming de drink-assinatura)', valor: 8000, entrega: 'Toda a tarde de evento' },
  { key: 'recovery', nome: 'Recovery Lounge (espaço de descanso pós-corrida)', valor: 6000, entrega: 'Permanência alta dos atletas' },
  { key: 'dj-stage', nome: 'DJ Stage (naming do palco/horário do DJ)', valor: 5000, entrega: '4 horas de visibilidade musical' },
]

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
