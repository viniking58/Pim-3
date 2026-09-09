import * as THREE from 'three'

/** Uma "caverna" do casco: um contorno 2D (z, y) posicionado ao longo do eixo X. */
export type Section = { x: number; points: THREE.Vector2[] }

/**
 * Constrói a malha ligando seções consecutivas — a mesma técnica de lofting
 * usada em projeto naval. Todas as seções precisam ter o mesmo número de
 * pontos, na mesma ordem.
 */
export function loft(input: Section[], { capStart = true, capEnd = true } = {}) {
  // Os geradores de seção percorrem o contorno em sentidos diferentes, e o
  // sentido decide para que lado as normais apontam. Normalizamos tudo para
  // horário no plano (z, y), que é o que produz normais apontando para fora.
  const sections = signedArea(input[0].points) > 0
    ? input.map((section) => ({ x: section.x, points: [...section.points].reverse() }))
    : input

  const ringSize = sections[0].points.length
  const positions: number[] = []
  const indices: number[] = []

  for (const section of sections) {
    for (const point of section.points) {
      positions.push(section.x, point.y, point.x)
    }
  }

  for (let i = 0; i < sections.length - 1; i++) {
    for (let j = 0; j < ringSize; j++) {
      const next = (j + 1) % ringSize
      const a = i * ringSize + j
      const b = i * ringSize + next
      const c = (i + 1) * ringSize + next
      const d = (i + 1) * ringSize + j
      indices.push(a, b, c, a, c, d)
    }
  }

  // Tampas: leque de triângulos a partir do centroide de cada extremidade.
  const cap = (sectionIndex: number, flip: boolean) => {
    const section = sections[sectionIndex]
    const center = new THREE.Vector2()
    for (const point of section.points) center.add(point)
    center.divideScalar(ringSize)

    const centerIndex = positions.length / 3
    positions.push(section.x, center.y, center.x)

    for (let j = 0; j < ringSize; j++) {
      const a = sectionIndex * ringSize + j
      const b = sectionIndex * ringSize + ((j + 1) % ringSize)
      if (flip) indices.push(centerIndex, b, a)
      else indices.push(centerIndex, a, b)
    }
  }

  if (capStart) cap(0, true)
  if (capEnd) cap(sections.length - 1, false)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

/**
 * Faixa aberta (sem tampas) seguindo apenas parte do contorno das seções,
 * deslocada para fora — usada nos grafismos que correm pelo flanco.
 */
export function loftStrip(sections: Section[], from: number, to: number, offset: number) {
  const positions: number[] = []
  const indices: number[] = []
  const span = to - from + 1

  for (const section of sections) {
    const ring = section.points
    for (let j = from; j <= to; j++) {
      const point = ring[j]
      const prev = ring[(j - 1 + ring.length) % ring.length]
      const next = ring[(j + 1) % ring.length]
      // Normal 2D aproximada pela tangente entre os vizinhos.
      const tangent = new THREE.Vector2().subVectors(next, prev).normalize()
      // Perpendicular apontando para fora do contorno (o sentido de
      // percurso das seções é do topo para a quilha).
      const normal = new THREE.Vector2(-tangent.y, tangent.x)
      positions.push(section.x, point.y + normal.y * offset, point.x + normal.x * offset)
    }
  }

  for (let i = 0; i < sections.length - 1; i++) {
    for (let j = 0; j < span - 1; j++) {
      const a = i * span + j
      const b = i * span + j + 1
      const c = (i + 1) * span + j + 1
      const d = (i + 1) * span + j
      indices.push(a, b, c, a, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

/** Área com sinal do contorno: positiva se anti-horário no plano (z, y). */
function signedArea(points: THREE.Vector2[]) {
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const current = points[i]
    const next = points[(i + 1) % points.length]
    area += current.x * next.y - next.x * current.y
  }
  return area / 2
}

/** Amostra uma curva suave passando pelos pontos de controle informados. */
function sampleCurve(controls: THREE.Vector2[], samples: number) {
  const curve = new THREE.SplineCurve(controls)
  return curve.getSpacedPoints(samples - 1)
}

/**
 * Meia-seção de um casco: convés no topo, quina (chine) na maior largura e
 * quilha em V embaixo. O contorno completo é o espelho desta metade.
 */
export function hullSection(params: {
  halfWidth: number
  deckY: number
  chineY: number
  keelY: number
  /** 0 = convés reto, 1 = convés bem abaulado. */
  crown?: number
  half?: number
}) {
  const { halfWidth, deckY, chineY, keelY, crown = 0.35, half = 9 } = params
  const drop = deckY - chineY

  const controls = [
    new THREE.Vector2(0, deckY),
    new THREE.Vector2(halfWidth * 0.45, deckY - drop * crown * 0.28),
    new THREE.Vector2(halfWidth * 0.86, deckY - drop * crown * 0.95),
    new THREE.Vector2(halfWidth, chineY),
    new THREE.Vector2(halfWidth * 0.66, chineY + (keelY - chineY) * 0.5),
    new THREE.Vector2(halfWidth * 0.24, chineY + (keelY - chineY) * 0.9),
    new THREE.Vector2(0, keelY),
  ]

  const right = sampleCurve(controls, half)
  // Espelha, descartando os pontos exatamente sobre a linha de centro.
  const left = right
    .slice(1, right.length - 1)
    .reverse()
    .map((point) => new THREE.Vector2(-point.x, point.y))

  return [...right, ...left]
}

/**
 * Seção retangular arredondada (superelipse) — chassis, caçambas e capôs.
 * `power` alto aproxima de um retângulo; baixo, de uma elipse.
 */
export function boxSection(params: {
  halfWidth: number
  topY: number
  bottomY: number
  power?: number
  segments?: number
}) {
  const { halfWidth, topY, bottomY, power = 4, segments = 24 } = params
  const centerY = (topY + bottomY) / 2
  const halfHeight = (topY - bottomY) / 2
  const points: THREE.Vector2[] = []

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const exponent = 2 / power
    points.push(
      new THREE.Vector2(
        Math.sign(cos) * Math.abs(cos) ** exponent * halfWidth,
        centerY + Math.sign(sin) * Math.abs(sin) ** exponent * halfHeight,
      ),
    )
  }

  return points
}

/** Interpolação suave (smoothstep) entre dois valores. */
export function mix(a: number, b: number, t: number) {
  const clamped = Math.min(1, Math.max(0, t))
  return a + (b - a) * clamped
}

/** Curva em sino, para larguras que crescem e voltam a estreitar. */
export function bell(t: number, peak: number, width: number) {
  return Math.exp(-((t - peak) ** 2) / (2 * width * width))
}
