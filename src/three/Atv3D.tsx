import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { loft, boxSection, hullSection, mix, type Section } from './geometry'
import { Wheel3D } from './Wheel3D'
import type { PaintProps } from './materials'
import type { VisualParts } from './VehicleScene'

const WHEEL_RADIUS = 0.46
const WHEEL_WIDTH = 0.26
const TRACK = 0.62
const WHEELBASE = 1.12

/** Chassi central estreito, com tanque subindo à frente do banco. */
function buildChassis(): Section[] {
  const sections: Section[] = []
  const count = 20

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const x = mix(-1.42, 1.42, t)
    const waist = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI) ** 0.4
    const halfWidth = mix(0.2, 0.42, waist)
    // Tanque alto à frente do banco, caindo para o bagageiro dianteiro.
    const topY = t > 0.58 ? mix(1.0, 0.8, (t - 0.58) / 0.42) : mix(0.82, 1.0, t / 0.58)
    const bottomY = 0.4 + (1 - waist) * 0.08

    sections.push({ x, points: boxSection({ halfWidth, topY, bottomY, power: 2.6, segments: 20 }) })
  }

  return sections
}

/** Para-lamas: meia-casca lofted acompanhando o arco da roda. */
function buildFender(centerX: number): Section[] {
  const sections: Section[] = []
  const count = 14

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const angle = mix(Math.PI * 0.94, Math.PI * 0.06, t)
    const x = centerX + Math.cos(angle) * WHEEL_RADIUS * 1.28
    // O arco acompanha a roda: centro na altura do eixo, raio um pouco maior.
    const lift = WHEEL_RADIUS + Math.sin(angle) * WHEEL_RADIUS * 1.12

    sections.push({
      x,
      points: hullSection({
        halfWidth: TRACK + WHEEL_WIDTH * 0.72,
        deckY: lift + 0.16,
        chineY: lift + 0.02,
        keelY: lift - 0.1,
        crown: 0.85,
        half: 7,
      }),
    })
  }

  return sections
}

export function Atv3D({
  paint,
  accent,
  moving,
  parts = {},
}: PaintProps & { moving: boolean; parts?: VisualParts }) {
  const chassis = useMemo(() => loft(buildChassis()), [])
  const frontFender = useMemo(() => loft(buildFender(WHEELBASE)), [])
  const rearFender = useMemo(() => loft(buildFender(-WHEELBASE)), [])
  const wheels = useRef<THREE.Group>(null)

  const barCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.5, 1.42, -0.42),
        new THREE.Vector3(0.58, 1.52, -0.2),
        new THREE.Vector3(0.6, 1.54, 0),
        new THREE.Vector3(0.58, 1.52, 0.2),
        new THREE.Vector3(0.5, 1.42, 0.42),
      ]),
    [],
  )

  useFrame((_, delta) => {
    if (!wheels.current) return
    if (moving) wheels.current.children.forEach((wheel) => (wheel.rotation.z -= delta * 6.5))
  })

  const wheelPositions: [number, number, number][] = [
    [WHEELBASE, WHEEL_RADIUS, TRACK],
    [WHEELBASE, WHEEL_RADIUS, -TRACK],
    [-WHEELBASE, WHEEL_RADIUS, TRACK],
    [-WHEELBASE, WHEEL_RADIUS, -TRACK],
  ]

  return (
    <group>
      <mesh geometry={chassis} castShadow receiveShadow>
        <meshPhysicalMaterial {...paint} />
      </mesh>

      <mesh geometry={frontFender} castShadow>
        <meshPhysicalMaterial {...paint} />
      </mesh>
      <mesh geometry={rearFender} castShadow>
        <meshPhysicalMaterial {...paint} />
      </mesh>

      {/* Frisos de destaque sobre os para-lamas */}
      {[WHEELBASE, -WHEELBASE].map((x) => (
        <mesh key={x} position={[x, WHEEL_RADIUS, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[WHEEL_RADIUS * 1.02, 0.022, 8, 28, Math.PI]} />
          <meshPhysicalMaterial color={accent} roughness={0.28} metalness={0.5} clearcoat={1} />
        </mesh>
      ))}

      {/* Banco */}
      <mesh position={[-0.34, 1.08, 0]} castShadow>
        <boxGeometry args={[1.0, 0.16, 0.44]} />
        <meshStandardMaterial color="#0f1218" roughness={0.95} />
      </mesh>
      <mesh position={[-0.9, 1.2, 0]} rotation={[0, 0, 0.34]} castShadow>
        <boxGeometry args={[0.32, 0.12, 0.42]} />
        <meshStandardMaterial color="#0f1218" roughness={0.95} />
      </mesh>

      {/* Coluna e guidão */}
      <mesh position={[0.46, 1.2, 0]} rotation={[0, 0, -0.22]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.44, 12]} />
        <meshStandardMaterial color="#2a303b" roughness={0.45} metalness={0.8} />
      </mesh>
      <mesh castShadow>
        <tubeGeometry args={[barCurve, 24, 0.026, 10, false]} />
        <meshStandardMaterial color="#39404d" roughness={0.36} metalness={0.85} />
      </mesh>
      {[-0.42, 0.42].map((z) => (
        <mesh key={z} position={[0.5, 1.42, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.14, 12]} />
          <meshStandardMaterial color="#0e1015" roughness={0.95} />
        </mesh>
      ))}

      {/* Bagageiros tubulares (acessório) */}
      {(parts.rack ?? true) && [1.16, -1.16].map((x) => (
        <group key={x} position={[x, 1.14, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.04, 0.7]} />
            <meshStandardMaterial color="#333a46" roughness={0.5} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Farol */}
      <mesh position={[1.26, 1.04, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.08, 20]} />
        <meshStandardMaterial color="#dce9ff" emissive="#a9c9ff" emissiveIntensity={1.3} />
      </mesh>

      {/* Escapamento */}
      <mesh position={[-0.6, 0.78, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.8, 16]} />
        <meshStandardMaterial color="#4a5260" roughness={0.32} metalness={0.9} />
      </mesh>

      <group ref={wheels}>
        {wheelPositions.map((position) => (
          <group key={position.join()} position={position}>
            <Wheel3D
              position={[0, 0, 0]}
              radius={WHEEL_RADIUS}
              width={WHEEL_WIDTH}
              accent={accent}
              lugs={18}
              spokes={5}
            />
          </group>
        ))}
      </group>
    </group>
  )
}
