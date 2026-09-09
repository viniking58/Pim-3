import type { ModelId } from '../three/VehicleScene'
import type { GltfSlots } from '../three/GltfVehicle'
import type { FinishId } from '../three/materials'
import type { EnvId } from '../three/Stage3D'

export type ModelOption = {
  id: ModelId
  name: string
  family: string
  blurb: string
  specs: { label: string; value: string }[]
  /**
   * Caminho de um .glb em `public/` — por exemplo `/models/rxp-x.glb`.
   * Com ele preenchido, o modelo real do fabricante entra no lugar da
   * geometria procedural, sem mais nenhuma mudança de código.
   */
  asset?: string
  /** Quais materiais do .glb recebem a pintura e a cor de destaque. */
  slots?: GltfSlots
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'jetski',
    name: 'Sea-Doo RXP-X',
    family: 'Linha náutica',
    blurb: 'Casco T3-R de competição, banco estreito e postura de ataque.',
    specs: [
      { label: 'Motor', value: 'Rotax 1630 ACE' },
      { label: 'Potência', value: 'até 325 hp' },
      { label: 'Lugares', value: '1 a 2' },
    ],
  },
  {
    id: 'utv',
    name: 'Can-Am Maverick R',
    family: 'Off-road esportivo',
    blurb: 'Gaiola alta, curso de suspensão longo e câmbio de dupla embreagem.',
    specs: [
      { label: 'Motor', value: 'Rotax turbo' },
      { label: 'Potência', value: 'até 240 hp' },
      { label: 'Lugares', value: '2' },
    ],
  },
  {
    id: 'utility',
    name: 'Can-Am Defender',
    family: 'Off-road utilitário',
    blurb: 'Teto reto, caçamba basculante e cabine pensada para o dia inteiro.',
    specs: [
      { label: 'Motor', value: 'Rotax HD10' },
      { label: 'Potência', value: 'até 82 hp' },
      { label: 'Lugares', value: '2 a 6' },
    ],
  },
  {
    id: 'atv',
    name: 'Can-Am Outlander',
    family: 'Quadriciclo',
    blurb: 'Tração 4x4 seletiva, bagageiros dianteiro e traseiro, torque de trilha.',
    specs: [
      { label: 'Motor', value: 'Rotax V-twin' },
      { label: 'Potência', value: 'até 91 hp' },
      { label: 'Lugares', value: '1 a 2' },
    ],
  },
]

export const PAINTS = [
  { id: 'carbono', name: 'Preto Carbono', hex: '#0e1116' },
  { id: 'artico', name: 'Branco Ártico', hex: '#e9edf4' },
  { id: 'p1', name: 'Vermelho P1', hex: '#d81a10' },
  { id: 'canam', name: 'Amarelo Can-Am', hex: '#f5c400' },
  { id: 'seadoo', name: 'Azul Sea-Doo', hex: '#0a84c8' },
  { id: 'manta', name: 'Verde Manta', hex: '#2c6a4d' },
  { id: 'titanio', name: 'Cinza Titânio', hex: '#69707f' },
] as const

export const FINISHES: { id: FinishId; name: string; hint: string }[] = [
  { id: 'gloss', name: 'Brilhante', hint: 'Verniz espelhado' },
  { id: 'satin', name: 'Fosco', hint: 'Acetinado' },
  { id: 'metallic', name: 'Metálico', hint: 'Com flocos' },
]

export const ACCENTS = [
  { id: 'grafite', name: 'Grafite', hex: '#39404d' },
  { id: 'vermelho', name: 'Vermelho', hex: '#ff2d18' },
  { id: 'amarelo', name: 'Amarelo', hex: '#ffd100' },
  { id: 'laranja', name: 'Laranja', hex: '#ff7a18' },
  { id: 'prata', name: 'Prata', hex: '#c9d0dd' },
] as const

export const ENVIRONMENTS: { id: EnvId; name: string }[] = [
  { id: 'catalog', name: 'Catálogo' },
  { id: 'studio', name: 'Estúdio' },
  { id: 'sunset', name: 'Pôr do sol' },
  { id: 'night', name: 'Noite' },
]
