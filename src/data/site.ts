import type { VehicleType } from '../graphics/Vehicle'

/* --------------------------------------------------------------- Contato -- */

export const CONTACT = {
  name: 'P1 Motorsports',
  role: 'Concessionária Autorizada BRP',
  address: 'Av. Eng. Florestan Fernandes, 520 — Jardim Aquarius',
  city: 'São José dos Campos — SP',
  zip: 'CEP 12242-012',
  hours: 'Segunda a sexta, das 9h às 19h',
  emailParts: 'pecas@p1motorsports.com.br',
  emailWarranty: 'garantia@p1motorsports.com.br',
  site: 'p1motorsports.com.br',
  instagram: 'https://www.instagram.com/p1motorsportsbr/',
  facebook: 'https://www.facebook.com/p1motorsportsbr/',
} as const

/* --------------------------------------------------------------- Produtos -- */

export type Family = 'Sea-Doo' | 'Can-Am' | 'Switch'

export type Product = {
  id: string
  name: string
  family: Family
  /** Chave usada pelo filtro da vitrine. */
  category: 'nautica' | 'offroad' | 'onroad' | 'pontoon'
  type: VehicleType
  accent: string
  tagline: string
  /** Número em destaque, animado por contador. */
  hero: { value: number; suffix: string; label: string }
  specs: { label: string; value: string }[]
  badge?: string
}

const SEADOO = 'var(--brand-seadoo)'
const CANAM = 'var(--brand-canam)'
const SWITCH = 'var(--brand-switch)'

export const PRODUCTS: Product[] = [
  {
    id: 'rxp-x',
    name: 'Sea-Doo RXP-X',
    family: 'Sea-Doo',
    category: 'nautica',
    type: 'jetski',
    accent: SEADOO,
    tagline: 'O jet ski de corrida da BRP. Casco T3-R que morde a curva e não solta.',
    hero: { value: 325, suffix: 'hp', label: 'Rotax 1630 ACE' },
    specs: [
      { label: 'Lugares', value: '1 a 2' },
      { label: 'Casco', value: 'T3-R' },
      { label: 'Perfil', value: 'Competição' },
    ],
    badge: 'Topo de linha',
  },
  {
    id: 'gti-se',
    name: 'Sea-Doo GTI SE',
    family: 'Sea-Doo',
    category: 'nautica',
    type: 'jetski',
    accent: SEADOO,
    tagline: 'O equilíbrio perfeito entre estabilidade, espaço e diversão em família.',
    hero: { value: 170, suffix: 'hp', label: 'Rotax 1630 ACE' },
    specs: [
      { label: 'Lugares', value: '3' },
      { label: 'Casco', value: 'GTI' },
      { label: 'Perfil', value: 'Lazer' },
    ],
  },
  {
    id: 'fishpro',
    name: 'Sea-Doo FishPro',
    family: 'Sea-Doo',
    category: 'nautica',
    type: 'jetski',
    accent: SEADOO,
    tagline: 'Live well, sonar, porta-varas e casco estável: pescaria séria sobre a água.',
    hero: { value: 170, suffix: 'hp', label: 'Rotax 1630 ACE' },
    specs: [
      { label: 'Lugares', value: '3' },
      { label: 'Extra', value: 'Live well' },
      { label: 'Perfil', value: 'Pesca' },
    ],
    badge: 'Feito para pescar',
  },
  {
    id: 'explorer-pro',
    name: 'Sea-Doo Explorer Pro',
    family: 'Sea-Doo',
    category: 'nautica',
    type: 'jetski',
    accent: SEADOO,
    tagline: 'Autonomia, bagageiro e conforto para explorar longe da marina.',
    hero: { value: 170, suffix: 'hp', label: 'Rotax 1630 ACE' },
    specs: [
      { label: 'Lugares', value: '3' },
      { label: 'Extra', value: 'Bagageiro' },
      { label: 'Perfil', value: 'Aventura' },
    ],
  },
  {
    id: 'maverick-r',
    name: 'Can-Am Maverick R',
    family: 'Can-Am',
    category: 'offroad',
    type: 'utv',
    accent: CANAM,
    tagline: 'O UTV mais potente da categoria. Suspensão de curso longo e câmbio DCT.',
    hero: { value: 240, suffix: 'hp', label: 'Rotax turbo' },
    specs: [
      { label: 'Lugares', value: '2' },
      { label: 'Câmbio', value: 'DCT 7 marchas' },
      { label: 'Perfil', value: 'Alta performance' },
    ],
    badge: 'Novidade',
  },
  {
    id: 'maverick-x3',
    name: 'Can-Am Maverick X3',
    family: 'Can-Am',
    category: 'offroad',
    type: 'utv',
    accent: CANAM,
    tagline: 'Ícone das dunas: turbo, chassi largo e curso de suspensão generoso.',
    hero: { value: 200, suffix: 'hp', label: 'Rotax ACE turbo' },
    specs: [
      { label: 'Lugares', value: '2 a 4' },
      { label: 'Tração', value: '4x4' },
      { label: 'Perfil', value: 'Duna e trilha' },
    ],
  },
  {
    id: 'defender',
    name: 'Can-Am Defender',
    family: 'Can-Am',
    category: 'offroad',
    type: 'utvUtility',
    accent: CANAM,
    tagline: 'Utilitário de trabalho pesado: caçamba, reboque e cabine para o dia inteiro.',
    hero: { value: 82, suffix: 'hp', label: 'Rotax HD10' },
    specs: [
      { label: 'Lugares', value: '2 a 6' },
      { label: 'Uso', value: 'Fazenda e obra' },
      { label: 'Perfil', value: 'Trabalho' },
    ],
  },
  {
    id: 'outlander',
    name: 'Can-Am Outlander',
    family: 'Can-Am',
    category: 'offroad',
    type: 'atv',
    accent: CANAM,
    tagline: 'O quadriciclo que virou referência em torque, tração e capacidade de carga.',
    hero: { value: 91, suffix: 'hp', label: 'Rotax V-twin' },
    specs: [
      { label: 'Lugares', value: '1 a 2' },
      { label: 'Tração', value: '4x4 seletiva' },
      { label: 'Perfil', value: 'Trilha e trabalho' },
    ],
  },
  {
    id: 'renegade',
    name: 'Can-Am Renegade',
    family: 'Can-Am',
    category: 'offroad',
    type: 'atv',
    accent: CANAM,
    tagline: 'Quadriciclo esportivo, centro de gravidade baixo e resposta imediata.',
    hero: { value: 91, suffix: 'hp', label: 'Rotax V-twin' },
    specs: [
      { label: 'Lugares', value: '1' },
      { label: 'Tração', value: '4x4' },
      { label: 'Perfil', value: 'Esportivo' },
    ],
  },
  {
    id: 'ryker',
    name: 'Can-Am Ryker',
    family: 'Can-Am',
    category: 'onroad',
    type: 'roadster',
    accent: CANAM,
    tagline: 'Três rodas, câmbio automático e painéis intercambiáveis. Sobe e vai.',
    hero: { value: 82, suffix: 'hp', label: 'Rotax 900 ACE' },
    specs: [
      { label: 'Rodas', value: '3' },
      { label: 'Câmbio', value: 'Automático' },
      { label: 'Perfil', value: 'Urbano' },
    ],
  },
  {
    id: 'spyder-f3',
    name: 'Can-Am Spyder F3',
    family: 'Can-Am',
    category: 'onroad',
    type: 'roadster',
    accent: CANAM,
    tagline: 'Roadster de estrada com postura cruiser e estabilidade das três rodas.',
    hero: { value: 115, suffix: 'hp', label: 'Rotax 1330 ACE' },
    specs: [
      { label: 'Rodas', value: '3' },
      { label: 'Câmbio', value: 'Semiautomático' },
      { label: 'Perfil', value: 'Viagem' },
    ],
  },
  {
    id: 'switch',
    name: 'Sea-Doo Switch',
    family: 'Switch',
    category: 'pontoon',
    type: 'pontoon',
    accent: SWITCH,
    tagline: 'O pontoon com pilotagem de jet ski: convés modular e giro no próprio eixo.',
    hero: { value: 230, suffix: 'hp', label: 'Rotax 1630 ACE' },
    specs: [
      { label: 'Lugares', value: 'Até 9' },
      { label: 'Convés', value: 'Modular' },
      { label: 'Perfil', value: 'Família' },
    ],
    badge: 'Convés modular',
  },
]

export const CATEGORIES = [
  { id: 'todos', label: 'Toda a linha' },
  { id: 'nautica', label: 'Sea-Doo' },
  { id: 'offroad', label: 'Can-Am Off-Road' },
  { id: 'onroad', label: 'Can-Am On-Road' },
  { id: 'pontoon', label: 'Switch' },
] as const

/* --------------------------------------------------------------- Serviços -- */

export const SERVICES = [
  {
    id: 'oficina',
    title: 'Oficina autorizada',
    text: 'Técnicos treinados pela fábrica, ferramentas especiais BRP e diagnóstico eletrônico oficial.',
    tag: 'Manutenção',
  },
  {
    id: 'pecas',
    title: 'Peças genuínas',
    text: 'Estoque de peças e acessórios originais Sea-Doo e Can-Am, com garantia de fábrica.',
    tag: 'Reposição',
  },
  {
    id: 'revisao',
    title: 'Revisão programada',
    text: 'Planos de revisão que preservam a garantia e o valor de revenda do seu veículo.',
    tag: 'Preventiva',
  },
  {
    id: 'entrega',
    title: 'Entrega técnica',
    text: 'Treinamento de pilotagem, ajuste fino e primeiro contato guiado com o seu veículo.',
    tag: 'Pós-venda',
  },
  {
    id: 'financiamento',
    title: 'Financiamento',
    text: 'Simulação com as principais instituições e condições especiais direto da concessionária.',
    tag: 'Crédito',
  },
  {
    id: 'seminovos',
    title: 'Seminovos revisados',
    text: 'Unidades avaliadas item a item pela nossa oficina antes de entrarem no showroom.',
    tag: 'Estoque',
  },
] as const

/* ------------------------------------------------------------------ Provas -- */

export const STATS = [
  { value: 800, suffix: ' m²', label: 'de showroom no Jardim Aquarius' },
  { value: 100, suffix: '%', label: 'peças genuínas com garantia de fábrica' },
  { value: 1, suffix: 'ª', label: 'concessionária BRP do Vale do Paraíba' },
  { value: 12, suffix: '', label: 'linhas Sea-Doo, Can-Am e Switch em showroom' },
] as const

export const TESTIMONIALS = [
  {
    quote:
      'Comprei meu primeiro jet ski aqui e saí da loja sabendo pilotar. A entrega técnica fez toda a diferença.',
    author: 'Rodrigo M.',
    detail: 'Sea-Doo GTI SE',
  },
  {
    quote:
      'Levo o Maverick para revisão e sempre volta melhor do que entrou. Time que entende de off-road de verdade.',
    author: 'Camila F.',
    detail: 'Can-Am Maverick X3',
  },
  {
    quote:
      'Showroom impecável e atendimento sem enrolação. Explicaram cada diferença entre os modelos com paciência.',
    author: 'Eduardo S.',
    detail: 'Can-Am Outlander',
  },
  {
    quote:
      'O Switch mudou nossos fins de semana na represa. A loja cuidou de tudo, da documentação ao transporte.',
    author: 'Patrícia L.',
    detail: 'Sea-Doo Switch',
  },
]

export const PROCESS = [
  {
    step: '01',
    title: 'Conversa sem pressa',
    text: 'Entendemos onde você pilota, com quem anda e qual é o seu nível antes de sugerir qualquer modelo.',
  },
  {
    step: '02',
    title: 'Demonstração no showroom',
    text: 'Você sobe, ajusta a posição e conhece cada comando com um consultor ao lado.',
  },
  {
    step: '03',
    title: 'Proposta transparente',
    text: 'Condições, acessórios e revisões na mesma planilha. Sem surpresa depois da assinatura.',
  },
  {
    step: '04',
    title: 'Entrega técnica',
    text: 'Veículo preparado, briefing de segurança e acompanhamento no primeiro passeio.',
  },
]
