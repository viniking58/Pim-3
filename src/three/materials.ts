import type { MeshPhysicalMaterialParameters } from 'three'

/** Acabamentos de pintura oferecidos no configurador. */
export type FinishId = 'gloss' | 'satin' | 'metallic'

export type PaintProps = {
  paint: MeshPhysicalMaterialParameters
  accent: string
}

const FINISHES: Record<FinishId, Omit<MeshPhysicalMaterialParameters, 'color'>> = {
  // Verniz espesso, reflexo nítido.
  gloss: { roughness: 0.16, metalness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 },
  // Fosco acetinado: reflexo largo e difuso.
  satin: { roughness: 0.62, metalness: 0.08, clearcoat: 0.35, clearcoatRoughness: 0.55 },
  // Metálico com flocos: mais reflexo especular e brilho direcional.
  metallic: { roughness: 0.28, metalness: 0.82, clearcoat: 0.9, clearcoatRoughness: 0.12 },
}

/** Monta os parâmetros do material a partir da cor e do acabamento. */
export function buildPaint(color: string, finish: FinishId): MeshPhysicalMaterialParameters {
  return { color, ...FINISHES[finish] }
}
