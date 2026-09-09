import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { loft, boxSection, mix, type Section } from './geometry'
import { Wheel3D } from './Wheel3D'
import type { PaintProps } from './materials'
import type { VisualParts } from './VehicleScene'

const WHEEL_RADIUS = 0.52
const WHEEL_WIDTH = 0.34
const TRACK = 0.86
const WHEELBASE = 1.32

/** Tub central: assoalho, laterais e capô inclinado. */
function buildBody(utility: boolean): Section[] {
  const sections: Section[] = []
  const count = 22
  const cabinTop = utility ? 1.02 : 0.94

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const x = mix(-1.62, 1.62, t)
    // Cabine larga no meio, afinando no rabo e no bico.
    const shoulder = Math.sin(Math.min(1, Math.max(0, (t - 0.04) / 0.92)) * Math.PI) ** 0.35
    const halfWidth = mix(0.42, 0.8, shoulder)
    // Assoalho acima do solo: o vão livre é o que define a cara de off-road.
    const bottomY = 0.3 + (1 - shoulder) * 0.06
    // A frente cai para virar capô; a traseira acomoda o motor.
    const topY =
      t > 0.66
        ? mix(cabinTop, 0.66, (t - 0.66) / 0.34)
        : mix(utility ? 0.98 : 0.84, cabinTop, t / 0.66)

    sections.push({ x, points: boxSection({ halfWidth, topY, bottomY, power: 3.4, segments: 22 }) })
  }

  return sections
}

/** Gaiola tubular: dois arcos laterais ligados por travessas. */
function cageCurves(utility: boolean) {
  const roofFront = utility ? 0.74 : 0.5
  const roofRear = utility ? -0.6 : -0.48
  const height = utility ? 1.84 : 1.72

  const side = (z: number) =>
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.2, 0.62, z),
      new THREE.Vector3(-1.02, 1.3, z),
      new THREE.Vector3(roofRear, height, z),
      new THREE.Vector3(roofFront, height, z),
      new THREE.Vector3(1.0, utility ? 1.3 : 1.14, z),
      new THREE.Vector3(1.16, 0.7, z),
    ])

  const cross = (x: number, y: number) =>
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, y, -0.7),
      new THREE.Vector3(x, y + 0.03, 0),
      new THREE.Vector3(x, y, 0.7),
    ])

  return {
    sides: [side(-0.7), side(0.7)],
    crosses: [cross(roofRear, height), cross(roofFront, height), cross(-1.16, 0.98)],
    height,
    roofFront,
  }
}

export function Utv3D({
  paint,
  accent,
  moving,
  utility = false,
  parts = {},
}: PaintProps & { moving: boolean; utility?: boolean; parts?: VisualParts }) {
  const bodyGeometry = useMemo(() => loft(buildBody(utility)), [utility])
  const { sides, crosses, height, roofFront } = useMemo(() => cageCurves(utility), [utility])
  const wheels = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!wheels.current) return
    if (moving) wheels.current.children.forEach((wheel) => (wheel.rotation.z -= delta * 6))
  })

  const wheelPositions: [number, number, number][] = [
    [WHEELBASE, WHEEL_RADIUS, TRACK],
    [WHEELBASE, WHEEL_RADIUS, -TRACK],
    [-WHEELBASE, WHEEL_RADIUS, TRACK],
    [-WHEELBASE, WHEEL_RADIUS, -TRACK],
  ]

  return (
    <group>
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial {...paint} />
      </mesh>

      {/* Painéis de porta na cor de destaque */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[-0.08, 0.72, side * 0.79]} castShadow>
          <boxGeometry args={[1.5, 0.34, 0.05]} />
          <meshPhysicalMaterial color={accent} roughness={0.3} metalness={0.4} clearcoat={0.8} />
        </mesh>
      ))}

      {/* Caçamba da versão utilitária */}
      {utility && (
        <group position={[-1.05, 1.24, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.05, 0.4, 1.5]} />
            <meshStandardMaterial color="#171a21" roughness={0.85} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0.21, 0]}>
            <boxGeometry args={[1.09, 0.05, 1.54]} />
            <meshStandardMaterial color="#2c313b" roughness={0.6} metalness={0.5} />
          </mesh>
        </group>
      )}

      {/* Teto rígido: de série no utilitário, acessório no esportivo */}
      {(utility || parts.roof) && (
        <mesh position={[0.07, height - 0.02, 0]} castShadow>
          <boxGeometry args={[1.5, 0.05, 1.42]} />
          <meshPhysicalMaterial {...paint} />
        </mesh>
      )}

      {/* Gaiola */}
      {[...sides, ...crosses].map((curve, index) => (
        <mesh key={index} castShadow>
          <tubeGeometry args={[curve, 48, 0.045, 12, false]} />
          <meshStandardMaterial color="#39404d" roughness={0.34} metalness={0.85} />
        </mesh>
      ))}

      {/* Bancos concha */}
      {[-0.42, 0.42].map((z) => (
        <group key={z} position={[-0.15, 1.04, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.44, 0.12, 0.42]} />
            <meshStandardMaterial color="#101319" roughness={0.95} />
          </mesh>
          <mesh position={[-0.2, 0.28, 0]} rotation={[0, 0, 0.16]} castShadow>
            <boxGeometry args={[0.12, 0.56, 0.42]} />
            <meshStandardMaterial color="#101319" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Volante */}
      <mesh position={[0.52, 1.24, 0.42]} rotation={[0, 0, 1.1]}>
        <torusGeometry args={[0.16, 0.028, 10, 28]} />
        <meshStandardMaterial color="#14171d" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Barra de LEDs (acessório) e faróis */}
      {parts.lightbar && (
        <mesh position={[roofFront, height + 0.09, 0]}>
          <boxGeometry args={[0.1, 0.08, 1.05]} />
          <meshStandardMaterial color="#e8f2ff" emissive="#cfe4ff" emissiveIntensity={1.5} />
        </mesh>
      )}
      {[-0.42, 0.42].map((z) => (
        <mesh key={z} position={[1.58, 0.74, z]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.06, 20]} />
          <meshStandardMaterial color="#dce9ff" emissive="#a9c9ff" emissiveIntensity={1.2} />
        </mesh>
      ))}

      {/* Braços de suspensão */}
      {wheelPositions.map(([x, , z]) => (
        <mesh key={`arm-${x}-${z}`} position={[x, WHEEL_RADIUS, z * 0.62]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, Math.abs(z) * 0.86, 10]} />
          <meshStandardMaterial color="#2a303b" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}

      <group ref={wheels}>
        {wheelPositions.map((position) => (
          <group key={position.join()} position={position}>
            <Wheel3D position={[0, 0, 0]} radius={WHEEL_RADIUS} width={WHEEL_WIDTH} accent={accent} />
          </group>
        ))}
      </group>
    </group>
  )
}
