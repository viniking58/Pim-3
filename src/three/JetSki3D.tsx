import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { loft, loftStrip, hullSection, boxSection, bell, mix, type Section } from './geometry'
import type { PaintProps } from './materials'

const BOW = 1.75
const STERN = -1.7
const HALF_POINTS = 13
const RING = HALF_POINTS * 2 - 2

/** Posição normalizada ao longo do comprimento: 0 na popa, 1 na proa. */
function tAtX(x: number) {
  return (x - STERN) / (BOW - STERN)
}

/* --------------------------------------------------------------------------
   Perfil do casco. Um jet ski moderno é montado em duas peças: o casco
   (sempre escuro) e o convés colorido que se encaixa por cima. Modelar assim
   é o que faz a silhueta ler como um Sea-Doo e não como um barco genérico.
   -------------------------------------------------------------------------- */

/** Linha do costado, onde o casco encontra o convés. Sobe muito na proa. */
function hullTopY(t: number) {
  return mix(0.28, 0.62, t ** 2) + Math.sin(t * Math.PI) * 0.035
}

function hullHalfWidth(t: number) {
  const body = 0.55 + 0.09 * Math.sin(Math.min(1, t / 0.5) * Math.PI * 0.5)
  const bow = t < 0.7 ? 1 : 1 - ((t - 0.7) / 0.3) ** 1.5
  return body * bow + 0.015
}

/** Topo do convés — base de apoio do console e do banco. */
function deckTopY(t: number) {
  return hullTopY(t) + 0.12
}

function hullSections(): Section[] {
  const sections: Section[] = []
  const count = 34

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    sections.push({
      x: mix(STERN, BOW, t),
      points: hullSection({
        halfWidth: hullHalfWidth(t),
        deckY: hullTopY(t),
        chineY: mix(0.04, 0.36, t ** 1.6),
        keelY: mix(-0.3, 0.12, t ** 0.9),
        // Coroamento baixo: costado quase reto até a quina viva.
        crown: 0.12,
        half: HALF_POINTS,
      }),
    })
  }

  return sections
}

/**
 * Painel superior colorido. Acompanha a boca do casco em vez de sobrar por
 * cima dele: casco e convés precisam ler como um corpo só, com a divisão de
 * cor caindo exatamente na linha do costado — a assinatura visual da marca.
 */
function deckSections(): Section[] {
  const sections: Section[] = []
  const count = 30

  for (let i = 0; i < count; i++) {
    const u = i / (count - 1)
    const x = mix(STERN + 0.16, BOW - 0.04, u)
    const t = tAtX(x)

    // Só um leve "ombro" na altura da proa, o resto acompanha o casco.
    const halfWidth = hullHalfWidth(t) * (1 + 0.07 * bell(t, 0.6, 0.22))

    const bottom = hullTopY(t) - 0.03
    const top = bottom + 0.15

    // Expoente alto = retângulo de cantos vivos: um painel, não uma bolha.
    sections.push({ x, points: boxSection({ halfWidth, topY: top, bottomY: bottom, power: 5, segments: 26 }) })
  }

  return sections
}

/** Console/capô: o volume que sobe à frente do banco e sustenta o guidão. */
function consoleSections(): Section[] {
  const sections: Section[] = []
  const count = 24

  for (let i = 0; i < count; i++) {
    const u = i / (count - 1)
    const x = mix(-0.02, 1.34, u)
    const pinch = Math.sin(Math.min(1, Math.max(0, u)) * Math.PI) ** 0.34
    const bottom = deckTopY(tAtX(x)) - 0.03
    const top = bottom + 0.36 * pinch

    sections.push({
      x,
      points: boxSection({
        halfWidth: 0.3 * pinch + 0.012,
        topY: top,
        bottomY: bottom,
        power: 3.2,
        segments: 24,
      }),
    })
  }

  return sections
}

/** Selim, na cor de destaque — o laranja do Spark de catálogo. */
function seatSections(): Section[] {
  const sections: Section[] = []
  const count = 20

  for (let i = 0; i < count; i++) {
    const u = i / (count - 1)
    const x = mix(-1.3, 0.16, u)
    const pinch = Math.sin(Math.min(1, Math.max(0, u)) * Math.PI) ** 0.28
    const bottom = deckTopY(tAtX(x)) - 0.02
    const top = bottom + mix(0.21, 0.17, u) * pinch

    sections.push({
      x,
      points: boxSection({
        halfWidth: 0.25 * pinch + 0.01,
        topY: top,
        bottomY: bottom,
        power: 2.4,
        segments: 22,
      }),
    })
  }

  return sections
}

export function JetSki3D({ paint, accent, moving }: PaintProps & { moving: boolean }) {
  const hull = useMemo(hullSections, [])
  const hullGeometry = useMemo(() => loft(hull), [hull])
  const deckGeometry = useMemo(() => loft(deckSections()), [])
  const consoleGeometry = useMemo(() => loft(consoleSections()), [])
  const seatGeometry = useMemo(() => loft(seatSections()), [])

  // Grafismo correndo pelo flanco do casco preto.
  const graphic = useMemo(() => loftStrip(hull, 3, 4, 0.012), [hull])
  const graphicMirror = useMemo(() => loftStrip(hull, RING - 4, RING - 3, 0.012), [hull])

  const barCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.66, 1.14, -0.4),
        new THREE.Vector3(0.8, 1.24, -0.2),
        new THREE.Vector3(0.86, 1.26, 0),
        new THREE.Vector3(0.8, 1.24, 0.2),
        new THREE.Vector3(0.66, 1.14, 0.4),
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
      child.position.x = -1.78 - phase * 1.7
      child.scale.setScalar(0.4 + phase * 1.6)
      const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
      material.opacity = (1 - phase) * 0.32
    })
  })

  return (
    // Sobe o conjunto para a quilha encostar no piso do showroom.
    <group position={[0, 0.32, 0]}>
      {/* Casco: sempre escuro, como sai de fábrica */}
      <mesh geometry={hullGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#0d0f14"
          roughness={0.46}
          metalness={0.08}
          clearcoat={0.5}
          clearcoatRoughness={0.32}
        />
      </mesh>

      <mesh geometry={graphic}>
        <meshPhysicalMaterial color={accent} roughness={0.42} metalness={0.15} clearcoat={0.6} />
      </mesh>
      <mesh geometry={graphicMirror}>
        <meshPhysicalMaterial color={accent} roughness={0.42} metalness={0.15} clearcoat={0.6} />
      </mesh>

      {/* Convés e console: as peças que recebem a cor escolhida */}
      <mesh geometry={deckGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial {...paint} />
      </mesh>
      <mesh geometry={consoleGeometry} castShadow>
        <meshPhysicalMaterial {...paint} />
      </mesh>

      {/* Selim */}
      <mesh geometry={seatGeometry} castShadow>
        <meshPhysicalMaterial color={accent} roughness={0.62} metalness={0.05} clearcoat={0.4} />
      </mesh>

      {/* Porta-luvas embutido no console */}
      <mesh position={[1.02, deckTopY(tAtX(1.02)) + 0.2, 0]} rotation={[0, 0, -0.24]}>
        <boxGeometry args={[0.34, 0.02, 0.36]} />
        <meshStandardMaterial color="#0f1218" roughness={0.85} />
      </mesh>

      {/* Torre e guidão */}
      <mesh position={[0.74, 1.0, 0]} rotation={[0, 0, -0.42]} castShadow>
        <boxGeometry args={[0.3, 0.14, 0.26]} />
        <meshStandardMaterial color="#14171d" roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh castShadow>
        <tubeGeometry args={[barCurve, 32, 0.03, 12, false]} />
        <meshStandardMaterial color="#2b3140" roughness={0.38} metalness={0.85} />
      </mesh>
      {[-0.4, 0.4].map((z) => (
        <group key={z}>
          {/* Manopla */}
          <mesh position={[0.66, 1.14, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.17, 16]} />
            <meshStandardMaterial color="#0e1015" roughness={0.95} />
          </mesh>
          {/* Retrovisor */}
          <mesh position={[0.82, 1.34, z * 0.92]} rotation={[0, 0, 0.3]}>
            <cylinderGeometry args={[0.014, 0.014, 0.22, 10]} />
            <meshStandardMaterial color="#1b1f27" roughness={0.5} metalness={0.6} />
          </mesh>
          <mesh position={[0.86, 1.45, z * 0.9]} rotation={[0, -0.35, 0]}>
            <boxGeometry args={[0.05, 0.1, 0.16]} />
            <meshStandardMaterial color="#12151b" roughness={0.4} metalness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Para-brisa */}
      <mesh position={[1.02, 1.06, 0]} rotation={[0, 0, -0.62]}>
        <boxGeometry args={[0.26, 0.012, 0.34]} />
        <meshPhysicalMaterial
          color="#8fd8ff"
          transmission={0.9}
          thickness={0.2}
          roughness={0.08}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Sponsons: as abas de estabilidade nos flancos da popa */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[-1.02, 0.2, side * 0.56]}
          rotation={[0, 0, 0.06]}
          castShadow
        >
          <boxGeometry args={[0.86, 0.09, 0.12]} />
          <meshStandardMaterial color="#101318" roughness={0.72} metalness={0.2} />
        </mesh>
      ))}

      {/* Plataforma de embarque e alça traseira */}
      <mesh position={[-1.46, 0.3, 0]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.78]} />
        <meshStandardMaterial color="#14181f" roughness={0.98} />
      </mesh>
      <mesh position={[-1.3, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.11, 0.022, 10, 24, Math.PI]} />
        <meshStandardMaterial color="#2b3140" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Bocal do jato */}
      <mesh position={[-1.7, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.15, 0.2, 20]} />
        <meshStandardMaterial color="#3a414d" roughness={0.32} metalness={0.9} />
      </mesh>

      {/* Espuma da esteira */}
      <group ref={wake} visible={false}>
        {[0, 1, 2, 3].map((index) => (
          <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[-1.8, -0.3, 0]}>
            <ringGeometry args={[0.3, 0.42, 32]} />
            <meshBasicMaterial color="#cfe9ff" transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
