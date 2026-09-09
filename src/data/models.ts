import type { VehicleType } from '../graphics/Vehicle'
import type { ModelId } from '../three/VehicleScene'

/* ==========================================================================
   Hierarquia espelhada do "Monte o Seu" oficial da BRP, que a própria URL do
   configurador entrega:

     ?platform=SEA_REC_LITE&package=SPARK_TRIXX&unitid=00067TD00

   plataforma → pacote → unidade. É esse encadeamento que o site inteiro usa:
   o índice lista pacotes, a página do modelo abre um pacote e o Build Yours
   percorre plataforma → pacote → motor → cor → acessórios.
   ========================================================================== */

export type PlatformId = 'nautica' | 'offroad' | 'onroad' | 'pontoon'

export type Platform = {
  id: PlatformId
  name: string
  brand: string
  tagline: string
  /* Cor da linha, usada em rótulos e no acento do palco 3D. */
  accentVar: string
}

export const PLATFORMS: Platform[] = [
  {
    id: 'nautica',
    name: 'Náutica',
    brand: 'Sea-Doo',
    tagline: 'Motos aquáticas para lazer, pesca e competição.',
    accentVar: 'var(--brand-marine)',
  },
  {
    id: 'offroad',
    name: 'Off-Road',
    brand: 'Can-Am',
    tagline: 'Side-by-sides e quadriciclos para trilha, duna e trabalho.',
    accentVar: 'var(--brand-terra)',
  },
  {
    id: 'onroad',
    name: 'On-Road',
    brand: 'Can-Am',
    tagline: 'Três rodas para a estrada, com estabilidade de sobra.',
    accentVar: 'var(--brand-terra)',
  },
  {
    id: 'pontoon',
    name: 'Pontoon',
    brand: 'Sea-Doo Switch',
    tagline: 'O convés modular com pilotagem de moto aquática.',
    accentVar: 'var(--brand-switch)',
  },
]

/** Opção de motor dentro de um pacote — a etapa "motor" do configurador. */
export type EngineOption = {
  id: string
  name: string
  power: number
  detail: string
}

export type SpecRow = { label: string; value: string }

export type Model = {
  slug: string
  name: string
  platform: PlatformId
  /** Geometria procedural usada no palco 3D. */
  scene: ModelId
  /** Ilustração vetorial usada nas listagens. */
  art: VehicleType
  headline: string
  blurb: string
  /** Um parágrafo editorial: por que este modelo existe. */
  story: string
  engines: EngineOption[]
  specs: SpecRow[]
  highlights: string[]
  badge?: string
}

export const MODELS: Model[] = [
  {
    slug: 'spark-trixx',
    name: 'Sea-Doo Spark Trixx',
    platform: 'nautica',
    scene: 'jetski',
    art: 'jetski',
    headline: 'Feito para fazer o que os outros não fazem',
    blurb: 'O mais leve da linha, com barra ajustável e bicos de manobra.',
    story:
      'O Trixx existe para uma coisa: manobra. A barra de guidão sobe, o apoio de pé desce e o sistema de manobra estendido deixa a popa afundar de propósito. É a moto aquática mais barata de entrar e a mais difícil de largar.',
    engines: [
      { id: 'ace-900-90', name: 'Rotax 900 ACE', power: 90, detail: '2 lugares, casco Polytec' },
      { id: 'ace-900-ho', name: 'Rotax 900 ACE HO', power: 110, detail: '3 lugares, iBR de série' },
    ],
    specs: [
      { label: 'Comprimento', value: '3,05 m' },
      { label: 'Boca', value: '1,17 m' },
      { label: 'Peso a seco', value: '191 kg' },
      { label: 'Combustível', value: '30 L' },
      { label: 'Casco', value: 'Polytec Gen 3' },
      { label: 'Ré', value: 'iBR' },
    ],
    highlights: [
      'Barra de guidão com três alturas',
      'Apoio de pé ajustável para pilotar em pé',
      'Sistema de manobra estendido',
    ],
    badge: 'Porta de entrada',
  },
  {
    slug: 'rxp-x',
    name: 'Sea-Doo RXP-X',
    platform: 'nautica',
    scene: 'jetski',
    art: 'jetski',
    headline: 'A moto aquática de corrida da BRP',
    blurb: 'Casco T3-R que morde a curva e não solta.',
    story:
      'O casco T3-R inclina o piloto para dentro da curva em vez de jogá-lo para fora. Somado ao Ergolock, que trava as pernas no assento, é o que permite manter o acelerador aberto onde outras motos exigem alívio.',
    engines: [{ id: 'ace-1630-325', name: 'Rotax 1630 ACE', power: 325, detail: 'Sobrealimentado' }],
    specs: [
      { label: 'Comprimento', value: '3,40 m' },
      { label: 'Boca', value: '1,25 m' },
      { label: 'Lugares', value: '1 a 2' },
      { label: 'Combustível', value: '70 L' },
      { label: 'Casco', value: 'T3-R' },
      { label: 'Ré', value: 'iBR' },
    ],
    highlights: ['Casco T3-R de competição', 'Ergolock com assento estreito', 'Painel colorido de 7,8"'],
    badge: 'Topo de linha',
  },
  {
    slug: 'gti-se',
    name: 'Sea-Doo GTI SE',
    platform: 'nautica',
    scene: 'jetski',
    art: 'jetski',
    headline: 'A que a família inteira consegue pilotar',
    blurb: 'Estabilidade, espaço para três e o melhor equilíbrio da linha.',
    story:
      'O casco GTI é largo e perdoa erro — é a moto que a pessoa aprende num sábado e continua usando cinco anos depois. O SE acrescenta suspensão de banco, ré e o painel maior.',
    engines: [
      { id: 'ace-1630-130', name: 'Rotax 1630 ACE', power: 130, detail: 'Aspirado' },
      { id: 'ace-1630-170', name: 'Rotax 1630 ACE', power: 170, detail: 'Aspirado, resposta mais forte' },
    ],
    specs: [
      { label: 'Comprimento', value: '3,45 m' },
      { label: 'Boca', value: '1,25 m' },
      { label: 'Lugares', value: '3' },
      { label: 'Combustível', value: '60 L' },
      { label: 'Casco', value: 'GTI' },
      { label: 'Ré', value: 'iBR' },
    ],
    highlights: ['Casco estável de três lugares', 'Porta-objetos de 60 L', 'Modo eco e modo esporte'],
  },
  {
    slug: 'fishpro',
    name: 'Sea-Doo FishPro',
    platform: 'nautica',
    scene: 'jetski',
    art: 'jetski',
    headline: 'Pescaria séria em cima de uma moto aquática',
    blurb: 'Live well, sonar Garmin e porta-varas de fábrica.',
    story:
      'Não é um acessório colado numa moto de lazer: o FishPro sai de fábrica com tanque de peixe vivo de 51 litros, sonar Garmin instalado e uma plataforma traseira estendida para pescar em pé.',
    engines: [{ id: 'ace-1630-170', name: 'Rotax 1630 ACE', power: 170, detail: 'Aspirado' }],
    specs: [
      { label: 'Comprimento', value: '3,66 m' },
      { label: 'Live well', value: '51 L' },
      { label: 'Sonar', value: 'Garmin ECHOMAP' },
      { label: 'Lugares', value: '3' },
      { label: 'Combustível', value: '60 L' },
      { label: 'Porta-varas', value: '6 posições' },
    ],
    highlights: ['Tanque de peixe vivo com aerador', 'Plataforma traseira estendida', 'Modo de pesca em marcha lenta'],
    badge: 'Feito para pescar',
  },
  {
    slug: 'maverick-r',
    name: 'Can-Am Maverick R',
    platform: 'offroad',
    scene: 'utv',
    art: 'utv',
    headline: 'O side-by-side mais potente da categoria',
    blurb: 'Rotax turbo, câmbio de dupla embreagem e curso de suspensão absurdo.',
    story:
      'O Maverick R foi projetado em torno do curso de suspensão: 635 mm na frente, com a caixa de transmissão elevada para deixar o semieixo trabalhar em ângulo menor. É o que permite atravessar o que quebra os concorrentes.',
    engines: [{ id: 'rotax-999t', name: 'Rotax 999T turbo', power: 240, detail: 'Câmbio DCT de 7 marchas' }],
    specs: [
      { label: 'Curso dianteiro', value: '635 mm' },
      { label: 'Curso traseiro', value: '660 mm' },
      { label: 'Bitola', value: '1,78 m' },
      { label: 'Vão livre', value: '381 mm' },
      { label: 'Lugares', value: '2' },
      { label: 'Câmbio', value: 'DCT 7 marchas' },
    ],
    highlights: ['Suspensão com braços em X invertidos', 'Modo de tração selecionável', 'Painel de 10,25"'],
    badge: 'Novidade',
  },
  {
    slug: 'maverick-x3',
    name: 'Can-Am Maverick X3',
    platform: 'offroad',
    scene: 'utv',
    art: 'utv',
    headline: 'O ícone das dunas',
    blurb: 'Chassi largo, turbo e o curso que fez a categoria existir.',
    story:
      'O X3 é o veículo que definiu o que um side-by-side esportivo deveria ser. Chassi baixo e largo, turbo Rotax e uma comunidade inteira de peças e preparações em volta dele.',
    engines: [
      { id: 'rotax-900t', name: 'Rotax 900 ACE turbo', power: 172, detail: 'Aspiração forçada' },
      { id: 'rotax-900tr', name: 'Rotax 900 ACE turbo RR', power: 200, detail: 'Intercooler maior' },
    ],
    specs: [
      { label: 'Curso dianteiro', value: '559 mm' },
      { label: 'Curso traseiro', value: '610 mm' },
      { label: 'Bitola', value: '1,72 m' },
      { label: 'Vão livre', value: '356 mm' },
      { label: 'Lugares', value: '2 a 4' },
      { label: 'Tração', value: '4x4' },
    ],
    highlights: ['Gaiola homologada', 'Modo esporte com controle de tração', 'Versão MAX de quatro lugares'],
  },
  {
    slug: 'defender',
    name: 'Can-Am Defender',
    platform: 'offroad',
    scene: 'utility',
    art: 'utvUtility',
    headline: 'O utilitário que trabalha o dia inteiro',
    blurb: 'Caçamba basculante, reboque e cabine para a fazenda e a obra.',
    story:
      'O Defender é medido em carga, não em potência: caçamba de 454 kg, capacidade de reboque de 1.134 kg e uma cabine que se fecha para o dia de chuva. É o veículo que a propriedade compra e usa até o fim.',
    engines: [
      { id: 'hd7', name: 'Rotax HD7', power: 52, detail: 'Monocilíndrico' },
      { id: 'hd10', name: 'Rotax HD10', power: 82, detail: 'V-twin, torque de reboque' },
    ],
    specs: [
      { label: 'Carga na caçamba', value: '454 kg' },
      { label: 'Reboque', value: '1.134 kg' },
      { label: 'Vão livre', value: '381 mm' },
      { label: 'Lugares', value: '2 a 6' },
      { label: 'Tração', value: '4x4 com bloqueio' },
      { label: 'Caixa', value: 'PRO-TORQ' },
    ],
    highlights: ['Caçamba basculante', 'Cabine com teto rígido', 'Modo de trabalho em baixa rotação'],
  },
  {
    slug: 'outlander',
    name: 'Can-Am Outlander',
    platform: 'offroad',
    scene: 'atv',
    art: 'atv',
    headline: 'A referência em quadriciclo',
    blurb: 'Torque, tração seletiva e bagageiros que aguentam serviço.',
    story:
      'O Outlander domina a categoria há anos pela mesma razão: chassi rígido, tração dianteira Visco-4Lok que engata sozinha e capacidade de carga que transforma o quadriciclo em ferramenta de trabalho.',
    engines: [
      { id: 'rotax-650', name: 'Rotax 650', power: 62, detail: 'V-twin' },
      { id: 'rotax-850', name: 'Rotax 850', power: 78, detail: 'V-twin' },
      { id: 'rotax-1000r', name: 'Rotax 1000R', power: 91, detail: 'V-twin, topo de linha' },
    ],
    specs: [
      { label: 'Bagageiro dianteiro', value: '54 kg' },
      { label: 'Bagageiro traseiro', value: '109 kg' },
      { label: 'Reboque', value: '750 kg' },
      { label: 'Vão livre', value: '279 mm' },
      { label: 'Tração', value: 'Visco-4Lok' },
      { label: 'Lugares', value: '1 a 2' },
    ],
    highlights: ['Tração dianteira automática', 'Suspensão traseira TTI', 'Freio a disco nas quatro rodas'],
  },
  {
    slug: 'ryker',
    name: 'Can-Am Ryker',
    platform: 'onroad',
    scene: 'atv',
    art: 'roadster',
    headline: 'Sobe e vai',
    blurb: 'Três rodas, câmbio automático e painéis que você troca.',
    story:
      'O Ryker tira a barreira de entrada da estrada: câmbio automático, sem embreagem, e uma postura que qualquer pessoa acerta na primeira. Os painéis de carroceria saem com um clique, então ele muda de cara sem passar por pintura.',
    engines: [
      { id: 'ace-600', name: 'Rotax 600 ACE', power: 50, detail: 'Bicilíndrico' },
      { id: 'ace-900', name: 'Rotax 900 ACE', power: 82, detail: 'Tricilíndrico' },
    ],
    specs: [
      { label: 'Rodas', value: '3' },
      { label: 'Câmbio', value: 'Automático CVT' },
      { label: 'Peso', value: '270 kg' },
      { label: 'Combustível', value: '20 L' },
      { label: 'Painéis', value: 'Intercambiáveis' },
      { label: 'Freio', value: 'Único pedal' },
    ],
    highlights: ['Sem embreagem e sem marchas', 'Painéis trocáveis sem ferramenta', 'Posição de pilotagem ajustável'],
  },
  {
    slug: 'switch',
    name: 'Sea-Doo Switch',
    platform: 'pontoon',
    scene: 'jetski',
    art: 'pontoon',
    headline: 'O convés que gira no próprio eixo',
    blurb: 'Pontoon com propulsão a jato e mobiliário modular.',
    story:
      'O Switch troca o motor de popa por propulsão a jato — sem hélice exposta, com giro no próprio eixo e água rasa deixando de ser problema. O convés é uma grade em que bancos e mesas encaixam e saem sem ferramenta.',
    engines: [
      { id: 'ace-1630-170', name: 'Rotax 1630 ACE', power: 170, detail: 'Aspirado' },
      { id: 'ace-1630-230', name: 'Rotax 1630 ACE', power: 230, detail: 'Sobrealimentado' },
    ],
    specs: [
      { label: 'Comprimento', value: '5,7 a 6,6 m' },
      { label: 'Lugares', value: 'Até 9' },
      { label: 'Convés', value: 'Modular em grade' },
      { label: 'Propulsão', value: 'Jato' },
      { label: 'Combustível', value: '114 L' },
      { label: 'Ré', value: 'iBR' },
    ],
    highlights: ['Mobiliário que encaixa na grade', 'Giro no próprio eixo', 'Sem hélice exposta'],
    badge: 'Convés modular',
  },
]

export function modelBySlug(slug?: string) {
  return MODELS.find((model) => model.slug === slug)
}

export function modelsByPlatform(platform: PlatformId) {
  return MODELS.filter((model) => model.platform === platform)
}

export function platformById(id: PlatformId) {
  return PLATFORMS.find((platform) => platform.id === id)!
}

/* ------------------------------------------------------------- Pintura ---- */

export const PAINTS = [
  { id: 'carbono', name: 'Preto Carbono', hex: '#0e1116' },
  { id: 'artico', name: 'Branco Ártico', hex: '#e9edf4' },
  { id: 'fogo', name: 'Vermelho Fogo', hex: '#d81a10' },
  { id: 'citrico', name: 'Amarelo Cítrico', hex: '#f5c400' },
  { id: 'abismo', name: 'Azul Abismo', hex: '#0a84c8' },
  { id: 'manta', name: 'Verde Manta', hex: '#2c6a4d' },
  { id: 'titanio', name: 'Cinza Titânio', hex: '#69707f' },
] as const

export const FINISHES = [
  { id: 'gloss', name: 'Brilhante', hint: 'Verniz espelhado' },
  { id: 'satin', name: 'Fosco', hint: 'Acetinado' },
  { id: 'metallic', name: 'Metálico', hint: 'Com flocos' },
] as const

export const ACCENTS = [
  { id: 'grafite', name: 'Grafite', hex: '#39404d' },
  { id: 'vermelho', name: 'Vermelho', hex: '#ff2d18' },
  { id: 'amarelo', name: 'Amarelo', hex: '#ffd100' },
  { id: 'laranja', name: 'Laranja', hex: '#ff7a18' },
  { id: 'prata', name: 'Prata', hex: '#c9d0dd' },
] as const

/* ----------------------------------------------------------- Acessórios ---- */

export type AccessoryCategory = 'conforto' | 'audio' | 'protecao' | 'transporte' | 'estetica'

export type Accessory = {
  id: string
  name: string
  category: AccessoryCategory
  description: string
  /** Plataformas em que o item é oferecido. */
  platforms: PlatformId[]
  /**
   * Chave que acende geometria real na cena 3D. É o que faz o configurador
   * parecer vivo: marcar o item aparece no veículo, não só na lista.
   */
  visual3d?: 'mirrors' | 'windshield' | 'lightbar' | 'roof' | 'rack'
}

export const ACCESSORY_CATEGORIES: { id: AccessoryCategory; name: string }[] = [
  { id: 'conforto', name: 'Conforto' },
  { id: 'audio', name: 'Áudio' },
  { id: 'protecao', name: 'Proteção' },
  { id: 'transporte', name: 'Transporte' },
  { id: 'estetica', name: 'Estética' },
]

export const ACCESSORIES: Accessory[] = [
  {
    id: 'retrovisores',
    name: 'Retrovisores',
    category: 'conforto',
    description: 'Par de retrovisores com haste, obrigatório em várias represas.',
    platforms: ['nautica', 'pontoon'],
    visual3d: 'mirrors',
  },
  {
    id: 'para-brisa',
    name: 'Para-brisa alto',
    category: 'conforto',
    description: 'Desvia o borrifo em navegação longa.',
    platforms: ['nautica'],
    visual3d: 'windshield',
  },
  {
    id: 'banco-premium',
    name: 'Banco premium',
    category: 'conforto',
    description: 'Espuma de densidade dupla e revestimento antiderrapante.',
    platforms: ['nautica', 'offroad', 'onroad', 'pontoon'],
  },
  {
    id: 'teto-rigido',
    name: 'Teto rígido',
    category: 'conforto',
    description: 'Fecha a cabine contra sol e chuva.',
    platforms: ['offroad'],
    visual3d: 'roof',
  },
  {
    id: 'som-brp',
    name: 'Sistema de som BRP Audio',
    category: 'audio',
    description: 'Alto-falantes marinizados com amplificador integrado.',
    platforms: ['nautica', 'offroad', 'pontoon'],
  },
  {
    id: 'caixa-portatil',
    name: 'Caixa de som portátil',
    category: 'audio',
    description: 'Encaixa no LinQ e sai junto com você.',
    platforms: ['nautica', 'offroad', 'pontoon'],
  },
  {
    id: 'capa',
    name: 'Capa de cobertura',
    category: 'protecao',
    description: 'Sob medida, com proteção UV para guarda ao ar livre.',
    platforms: ['nautica', 'offroad', 'onroad', 'pontoon'],
  },
  {
    id: 'protetor-casco',
    name: 'Protetor de casco',
    category: 'protecao',
    description: 'Faixa de sacrifício contra rampas e trailers.',
    platforms: ['nautica', 'pontoon'],
  },
  {
    id: 'para-choque',
    name: 'Para-choque dianteiro',
    category: 'protecao',
    description: 'Tubular, com ponto de fixação para guincho.',
    platforms: ['offroad'],
  },
  {
    id: 'carretinha',
    name: 'Carretinha rodoviária',
    category: 'transporte',
    description: 'Galvanizada, com documentação para emplacamento.',
    platforms: ['nautica', 'offroad', 'onroad', 'pontoon'],
  },
  {
    id: 'engate',
    name: 'Engate de reboque',
    category: 'transporte',
    description: 'Homologado para a capacidade de reboque do modelo.',
    platforms: ['offroad'],
  },
  {
    id: 'bagageiro-linq',
    name: 'Bagageiro LinQ',
    category: 'transporte',
    description: 'Sistema de encaixe rápido, sem ferramenta.',
    platforms: ['nautica', 'offroad', 'pontoon'],
    visual3d: 'rack',
  },
  {
    id: 'barra-led',
    name: 'Barra de LEDs',
    category: 'estetica',
    description: 'Iluminação auxiliar para trilha noturna.',
    platforms: ['offroad'],
    visual3d: 'lightbar',
  },
  {
    id: 'grafismo',
    name: 'Kit de grafismo',
    category: 'estetica',
    description: 'Adesivagem de fábrica, aplicada na concessionária.',
    platforms: ['nautica', 'offroad', 'onroad', 'pontoon'],
  },
  {
    id: 'rodas-liga',
    name: 'Rodas de liga leve',
    category: 'estetica',
    description: 'Mais leves que as de aço, com acabamento usinado.',
    platforms: ['offroad', 'onroad'],
  },
]

export function accessoriesFor(platform: PlatformId) {
  return ACCESSORIES.filter((item) => item.platforms.includes(platform))
}

/* -------------------------------------------------------------- Contato ---- */

export const CONTACT = {
  name: 'P1 Motorsports',
  role: 'Concessionária Autorizada BRP',
  address: 'Av. Eng. Florestan Fernandes, 520 — Jardim Aquarius',
  city: 'São José dos Campos — SP',
  zip: 'CEP 12242-012',
  hours: 'Segunda a sexta, das 9h às 19h',
  email: 'pecas@p1motorsports.com.br',
  emailWarranty: 'garantia@p1motorsports.com.br',
  instagram: 'https://www.instagram.com/p1motorsportsbr/',
  facebook: 'https://www.facebook.com/p1motorsportsbr/',
} as const

export const SERVICES = [
  {
    id: 'oficina',
    title: 'Oficina autorizada',
    text: 'Técnicos treinados pela fábrica, ferramentas especiais BRP e diagnóstico eletrônico oficial (B.U.D.S.).',
  },
  {
    id: 'pecas',
    title: 'Peças genuínas',
    text: 'Estoque de peças e acessórios originais Sea-Doo e Can-Am, com garantia de fábrica.',
  },
  {
    id: 'revisao',
    title: 'Revisão programada',
    text: 'Planos de revisão que preservam a garantia e o valor de revenda do veículo.',
  },
  {
    id: 'entrega',
    title: 'Entrega técnica',
    text: 'Treinamento de pilotagem, ajuste fino e primeiro contato guiado com o seu veículo.',
  },
  {
    id: 'garantia',
    title: 'Garantia e BEST',
    text: 'Ativação de garantia de fábrica e extensão BEST direto na concessionária.',
  },
  {
    id: 'financiamento',
    title: 'Financiamento',
    text: 'Simulação com as principais instituições e condições especiais da loja.',
  },
] as const

/** Sequência real — por isso é numerada. */
export const PROCESS = [
  {
    step: 1,
    title: 'Conversa sem pressa',
    text: 'Entendemos onde você pilota, com quem anda e qual é o seu nível antes de sugerir modelo.',
  },
  {
    step: 2,
    title: 'Demonstração no showroom',
    text: 'Você sobe, ajusta a posição e conhece cada comando com um consultor ao lado.',
  },
  {
    step: 3,
    title: 'Proposta transparente',
    text: 'Veículo, acessórios e revisões na mesma planilha. Sem surpresa depois da assinatura.',
  },
  {
    step: 4,
    title: 'Entrega técnica',
    text: 'Veículo preparado, briefing de segurança e acompanhamento no primeiro passeio.',
  },
] as const
