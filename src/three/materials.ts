import type { MeshPhysicalMaterialParameters } from 'three'

/** Acabamentos de pintura oferecidos no configurador. */
export type FinishId = 'gloss' | 'satin' | 'metallic'

export type PaintProps = {
  paint: MeshPhysicalMaterialParameters
  accent: string
}

/*
 * `envMapIntensity` é o ajuste decisivo aqui. Sem ele, uma superfície lisa e
 * virada para cima espelha a softbox inteira e a cor escolhida vira um borrão
 * branco. Baixando o peso do mapa de ambiente, sobra um risco de brilho
 * estreito sobre a cor saturada — que é como a lataria aparece numa foto.
 */
const FINISHES: Record<FinishId, Omit<MeshPhysicalMaterialParameters, 'color'>> = {
  // Verniz espesso, reflexo nítido e estreito.
  gloss: {
    roughness: 0.28,
    metalness: 0.07,
    // Verniz forte demais soma uma segunda camada especular e lava a cor
    // numa superfície ampla virada para cima. Calibrado observando o render.
    clearcoat: 0.45,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.35,
  },
  // Fosco acetinado: reflexo largo e difuso.
  satin: {
    roughness: 0.62,
    metalness: 0.06,
    clearcoat: 0.3,
    clearcoatRoughness: 0.6,
    envMapIntensity: 0.4,
  },
  // Metálico com flocos: brilho direcional e mais resposta ao ambiente.
  metallic: {
    roughness: 0.3,
    metalness: 0.8,
    clearcoat: 0.75,
    clearcoatRoughness: 0.14,
    envMapIntensity: 0.6,
  },
}

/** Monta os parâmetros do material a partir da cor e do acabamento. */
export function buildPaint(color: string, finish: FinishId): MeshPhysicalMaterialParameters {
  return { color, ...FINISHES[finish] }
}
