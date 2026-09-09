import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { loft, loftStrip, hullSection, boxSection, bell, mix, type Section } from './geometry'
import type { PaintProps } from './materials'

/* --------------------------------------------------------------------------
   Proporções reais de um Sea-Doo Spark: 3,05 m de comprimento por 1,17 m de
   boca — 1 unidade de cena ≈ 1 metro. Ele é curto e encorpado, e é justamente
   essa relação (e não o contorno) que faz a silhueta ser reconhecível.
   -------------------------------------------------------------------------- */
const BOW = 1.5
const STERN = -1.5
const HALF_POINTS = 15
const RING = HALF_POINTS * 2 - 2

/** Altura do piso: a quilha mais funda encosta em y = 0 depois do offset. */
const GROUND = 0.26

function tAtX(x: number) {
  return (x - STERN) / (BOW - STERN)
}

/** Boca do casco. Cheia até bem perto da proa, que fecha em ponta rombuda. */
function hullHalfWidth(t: number) {
  const body = 0.5 + 0.09 * bell(t, 0.45, 0.3)
  // Queda elíptica: proa cheia, não afilada como a de um barco.
  const bowCut = t < 0.82 ? 1 : Math.sqrt(Math.max(0, 1 - ((t - 0.82) / 0.18) ** 2))
  return body * bowCut + 0.012
}

/** Linha do costado, onde o casco encontra o para-choque e o convés. */
function hullTopY(t: number) {
  return mix(0.24, 0.46, t ** 1.7)
}

function chineY(t: number) {
  return mix(-0.02, 0.24, t ** 1.5)
}

function keelY(t: number) {
  return mix(-GROUND, 0.06, t ** 0.85)
}

/** Topo do convés: base de apoio do banco, do capô e do pedestal do guidão. */
function deckTopY(t: number) {
  return hullTopY(t) + 0.1
}

function sampleAlong(count: number, from: number, to: number) {
  return Array.from({ length: count }, (_, i) => {
    const u = count === 1 ? 0 : i / (count - 1)
    const x = mix(from, to, u)
    return { u, x, t: tAtX(x) }
  })
}

/* ------------------------------------------------------------------ Peças -- */

function hullSections(): Section[] {
  return sampleAlong(38, STERN, BOW).map(({ x, t }) => ({
    x,
    points: hullSection({
      halfWidth: hullHalfWidth(t),
      deckY: hullTopY(t),
      chineY: chineY(t),
      keelY: keelY(t),
      crown: 0.1,
      half: HALF_POINTS,
    }),
  }))
}

/** Para-choque de borracha contornando todo o costado — bem visível na foto. */
function rubrailSections(): Section[] {
  return sampleAlong(38, STERN + 0.01, BOW - 0.01).map(({ x, t }) => {
    const top = hullTopY(t) + 0.018
    return {
      x,
      points: boxSection({
        halfWidth: hullHalfWidth(t) * 1.035,
        topY: top,
        bottomY: top - 0.075,
        power: 2.4,
        segments: 20,
      }),
    }
  })
}

/** Convés colorido, acima do para-choque. */
function deckSections(): Section[] {
  return sampleAlong(34, STERN + 0.02, BOW - 0.02).map(({ x, t }) => {
    const bottom = hullTopY(t) + 0.005
    return {
      x,
      points: hullSection({
        // Mais largo embaixo e afunilando para cima: é esse estreitamento
        // que faz o convés ler como carroceria, e não como tampa.
        halfWidth: hullHalfWidth(t) * 0.985,
        deckY: bottom + 0.12,
        chineY: bottom + 0.015,
        keelY: bottom,
        crown: 0.72,
        half: HALF_POINTS,
      }),
    }
  })
}

/** Capô dianteiro: a tampa do porta-objetos, uma peça à parte na proa. */
function hoodSections(): Section[] {
  return sampleAlong(18, 0.62, 1.26).map(({ u, x, t }) => {
    const pinch = Math.sin(Math.min(1, Math.max(0, u)) * Math.PI) ** 0.32
    const bottom = deckTopY(t) - 0.03
    const top = bottom + 0.11 * pinch
    return {
      x,
      points: hullSection({
        halfWidth: 0.29 * pinch + 0.01,
        deckY: top,
        chineY: mix(bottom, top, 0.2),
        keelY: bottom,
        crown: 0.62,
        half: HALF_POINTS,
      }),
    }
  })
}

/** Pedestal do guidão, entre o capô e o banco. */
function podSections(): Section[] {
  return sampleAlong(14, 0.3, 0.78).map(({ u, x, t }) => {
    const pinch = Math.sin(Math.min(1, Math.max(0, u)) * Math.PI) ** 0.3
    const bottom = deckTopY(t) - 0.02
    return {
      x,
      points: boxSection({
        halfWidth: 0.18 * pinch + 0.01,
        topY: bottom + 0.24 * pinch,
        bottomY: bottom,
        power: 2.6,
        segments: 18,
      }),
    }
  })
}

function seatSections(): Section[] {
  return sampleAlong(18, -1.02, 0.34).map(({ u, x, t }) => {
    const pinch = Math.sin(Math.min(1, Math.max(0, u)) * Math.PI) ** 0.26
    const bottom = deckTopY(t) - 0.02
    const top = bottom + mix(0.2, 0.17, u) * pinch
    return {
      x,
      points: hullSection({
        halfWidth: 0.25 * pinch + 0.01,
        deckY: top,
        chineY: mix(bottom, top, 0.25),
        keelY: bottom,
        crown: 0.7,
        half: HALF_POINTS,
      }),
    }
  })
}

/** Poço de pé: canaleta escura rebaixada no convés, dos dois lados. */
function footwellSections(side: number): Section[] {
  return sampleAlong(16, -1.06, 0.42).map(({ u, x, t }) => {
    const fade = Math.sin(Math.min(1, Math.max(0, u)) * Math.PI) ** 0.22
    const outer = hullHalfWidth(t) * 0.985
    const center = side * (outer - 0.13)
    const top = deckTopY(t) - 0.012
    const points = boxSection({
      halfWidth: 0.11 * fade + 0.005,
      topY: top,
      bottomY: top - 0.07,
      power: 3,
      segments: 16,
    })
    return { x, points: points.map((p) => new THREE.Vector2(p.x + center, p.y)) }
  })
}

export function JetSki3D({ paint, accent, moving }: PaintProps & { moving: boolean }) {
  const hull = useMemo(hullSections, [])

  const hullGeometry = useMemo(() => loft(hull), [hull])
  const rubrailGeometry = useMemo(() => loft(rubrailSections()), [])
  const deckGeometry = useMemo(() => loft(deckSections()), [])
  const hoodGeometry = useMemo(() => loft(hoodSections()), [])
  const podGeometry = useMemo(() => loft(podSections()), [])
  const seatGeometry = useMemo(() => loft(seatSections()), [])
  const footwellLeft = useMemo(() => loft(footwellSections(-1)), [])
  const footwellRight = useMemo(() => loft(footwellSections(1)), [])

  // Painel de cor na parte de baixo do costado, só na metade de ré.
  const rearHalf = useMemo(() => hull.slice(0, 22), [hull])
  const panel = useMemo(() => loftStrip(rearHalf, 6, 8, 0.008), [rearHalf])
  const panelMirror = useMemo(() => loftStrip(rearHalf, RING - 8, RING - 6, 0.008), [rearHalf])

  // Friso de destaque logo abaixo do para-choque.
  const pinstripe = useMemo(() => loftStrip(hull, 3, 4, 0.01), [hull])
  const pinstripeMirror = useMemo(() => loftStrip(hull, RING - 4, RING - 3, 0.01), [hull])

  const barCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.4, 0.76, -0.33),
        new THREE.Vector3(0.53, 0.83, -0.17),
        new THREE.Vector3(0.58, 0.85, 0),
        new THREE.Vector3(0.53, 0.83, 0.17),
        new THREE.Vector3(0.4, 0.76, 0.33),
      ]),
    [],
  )

  const wake = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!wake.current) return
    wake.current.visible = moving
    if (!moving) return
    const time = state.clock.elapsedTime
    wake.current.children.forEach((child, index) => {
      const phase = (time * 0.9 + index * 0.33) % 1
      child.position.x = -1.56 - phase * 1.6
      child.scale.setScalar(0.4 + phase * 1.6)
      const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
      material.opacity = (1 - phase) * 0.3
    })
  })

  const gelcoat = {
    roughness: 0.3,
    metalness: 0.06,
    clearcoat: 0.45,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.35,
  }

  return (
    <group position={[0, GROUND, 0]}>
      {/* Casco, sempre escuro, como sai de fábrica */}
      <mesh geometry={hullGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial color="#0c0e12" {...gelcoat} />
      </mesh>

      {/* Painel de cor no costado */}
      <mesh geometry={panel}>
        <meshPhysicalMaterial {...paint} />
      </mesh>
      <mesh geometry={panelMirror}>
        <meshPhysicalMaterial {...paint} />
      </mesh>

      {/* Friso de destaque */}
      <mesh geometry={pinstripe}>
        <meshPhysicalMaterial color={accent} roughness={0.36} metalness={0.12} clearcoat={0.7} />
      </mesh>
      <mesh geometry={pinstripeMirror}>
        <meshPhysicalMaterial color={accent} roughness={0.36} metalness={0.12} clearcoat={0.7} />
      </mesh>

      {/* Para-choque de borracha */}
      <mesh geometry={rubrailGeometry} castShadow>
        <meshStandardMaterial color="#131519" roughness={0.94} metalness={0.02} />
      </mesh>

      {/* Convés e capô recebem a cor escolhida */}
      <mesh geometry={deckGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial {...paint} />
      </mesh>
      <mesh geometry={hoodGeometry} castShadow>
        <meshPhysicalMaterial color={accent} {...gelcoat} />
      </mesh>

      {/* Poços de pé, com piso antiderrapante */}
      <mesh geometry={footwellLeft}>
        <meshStandardMaterial color="#14171c" roughness={0.98} />
      </mesh>
      <mesh geometry={footwellRight}>
        <meshStandardMaterial color="#14171c" roughness={0.98} />
      </mesh>

      {/* Pedestal e banco */}
      <mesh geometry={podGeometry} castShadow>
        <meshStandardMaterial color="#101317" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh geometry={seatGeometry} castShadow>
        <meshPhysicalMaterial color={accent} roughness={0.66} metalness={0.04} clearcoat={0.35} />
      </mesh>

      {/* Guidão */}
      <mesh castShadow>
        <tubeGeometry args={[barCurve, 32, 0.026, 12, false]} />
        <meshStandardMaterial color="#23272f" roughness={0.42} metalness={0.8} />
      </mesh>
      {[-0.33, 0.33].map((z) => (
        <group key={z}>
          <mesh position={[0.4, 0.76, z]} rotation={[Math.PI / 2, 0, 0.16]}>
            <cylinderGeometry args={[0.038, 0.038, 0.15, 16]} />
            <meshStandardMaterial color="#0d0f13" roughness={0.96} />
          </mesh>
          <mesh position={[0.5, 0.94, z * 0.9]} rotation={[0, 0, 0.26]}>
            <cylinderGeometry args={[0.012, 0.012, 0.19, 10]} />
            <meshStandardMaterial color="#181c22" roughness={0.5} metalness={0.6} />
          </mesh>
          <mesh position={[0.54, 1.03, z * 0.88]} rotation={[0, -0.4, 0]}>
            <boxGeometry args={[0.04, 0.085, 0.14]} />
            <meshStandardMaterial color="#101318" roughness={0.38} metalness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Painel de instrumentos */}
      <mesh position={[0.63, 0.72, 0]} rotation={[0, 0, -0.42]}>
        <boxGeometry args={[0.14, 0.02, 0.2]} />
        <meshStandardMaterial color="#0a0c10" roughness={0.35} metalness={0.4} />
      </mesh>

      {/* Sponsons */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[-0.86, 0.12, side * 0.5]} rotation={[0, 0, 0.07]} castShadow>
          <boxGeometry args={[0.72, 0.075, 0.1]} />
          <meshStandardMaterial color="#0f1216" roughness={0.78} metalness={0.15} />
        </mesh>
      ))}

      {/* Plataforma de embarque e alça traseira */}
      <mesh position={[-1.28, 0.3, 0]} castShadow>
        <boxGeometry args={[0.42, 0.045, 0.66]} />
        <meshStandardMaterial color="#14171d" roughness={0.99} />
      </mesh>
      <mesh position={[-1.12, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 10, 24, Math.PI]} />
        <meshStandardMaterial color="#23272f" roughness={0.42} metalness={0.78} />
      </mesh>

      {/* Bocal do jato */}
      <mesh position={[-1.5, -0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.13, 0.18, 20]} />
        <meshStandardMaterial color="#343b45" roughness={0.34} metalness={0.9} />
      </mesh>

      <group ref={wake} visible={false}>
        {[0, 1, 2, 3].map((index) => (
          <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[-1.6, -GROUND + 0.02, 0]}>
            <ringGeometry args={[0.28, 0.4, 32]} />
            <meshBasicMaterial color="#cfe9ff" transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
