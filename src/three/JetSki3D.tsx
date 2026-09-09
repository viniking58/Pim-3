import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { loft, loftStrip, hullSection, mix, type Section } from './geometry'
import type { PaintProps } from './materials'

const STATIONS = 26
// Meia-seção com resolução alta: é ela que dá controle fino sobre onde
// exatamente a faixa de grafismo corre no flanco.
const HALF_POINTS = 13
const RING = HALF_POINTS * 2 - 2

/** Perfil longitudinal do casco: da popa (t=0) à proa (t=1). */
function buildSections(): Section[] {
  const sections: Section[] = []

  for (let i = 0; i < STATIONS; i++) {
    const t = i / (STATIONS - 1)
    // Popa cheia, meia-nau larga, proa afilada e levantada.
    const taper = t < 0.72 ? 1 : 1 - ((t - 0.72) / 0.28) ** 1.7
    const halfWidth = mix(0.52, 0.62, Math.sin(Math.min(1, t / 0.45) * Math.PI * 0.5)) * taper + 0.02
    const rise = t ** 2.4
    const deckY = mix(0.28, 0.56, rise) + Math.sin(t * Math.PI) * 0.04
    const chineY = mix(0.02, 0.26, rise)
    const keelY = mix(-0.3, 0.06, rise ** 0.8)

    sections.push({
      x: mix(-1.7, 1.72, t),
      // crown baixo mantém o convés praticamente plano até a quina —
      // é o que diferencia um casco de moto aquática de um tubo.
      points: hullSection({ halfWidth, deckY, chineY, keelY, crown: 0.12, half: HALF_POINTS }),
    })
  }

  return sections
}

/**
 * Volume do banco e do console, apoiado sobre o convés: sobe da traseira até
 * a torre do guidão, com a silhueta de sela típica de um jet ski esportivo.
 */
function buildDeck(): Section[] {
  const sections: Section[] = []
  const count = 22

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    const x = mix(-1.24, 1.02, t)
    // "Morre" nas duas pontas para se fundir ao convés.
    const pinch = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI) ** 0.4
    const halfWidth = mix(0.08, 0.33, pinch)
    // Base acompanhando a linha do convés do casco.
    const bottom = mix(0.3, 0.46, t ** 1.6)
    // Sela: mais baixa no banco, subindo para o console.
    const saddle = t < 0.62 ? mix(0.24, 0.3, t / 0.62) : mix(0.3, 0.56, (t - 0.62) / 0.38)
    const top = bottom + saddle * pinch

    sections.push({
      x,
      points: hullSection({
        halfWidth,
        deckY: top,
        chineY: mix(bottom, top, 0.55),
        keelY: bottom - 0.04,
        crown: 0.3,
        half: HALF_POINTS,
      }),
    })
  }

  return sections
}

export function JetSki3D({ paint, accent, moving }: PaintProps & { moving: boolean }) {
  const hullSections = useMemo(buildSections, [])
  const hullGeometry = useMemo(() => loft(hullSections), [hullSections])
  const deckGeometry = useMemo(() => loft(buildDeck()), [])

  // Grafismo correndo pelo flanco, logo acima da quina do casco.
  const graphicGeometry = useMemo(
    () => loftStrip(hullSections, 4, 6, 0.01),
    [hullSections],
  )
  const graphicMirror = useMemo(
    () => loftStrip(hullSections, RING - 6, RING - 4, 0.01),
    [hullSections],
  )

  const barCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.72, 0.88, -0.34),
        new THREE.Vector3(0.86, 0.96, -0.18),
        new THREE.Vector3(0.91, 0.98, 0),
        new THREE.Vector3(0.86, 0.96, 0.18),
        new THREE.Vector3(0.72, 0.88, 0.34),
      ]),
    [],
  )

  const wake = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!wake.current) return
    const time = state.clock.elapsedTime
    wake.current.visible = moving
    if (moving) {
      // Sulco de espuma pulsando atrás da popa.
      wake.current.children.forEach((child, index) => {
        const phase = (time * 0.9 + index * 0.33) % 1
        child.position.x = -1.75 - phase * 1.6
        child.scale.setScalar(0.4 + phase * 1.5)
        const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
        material.opacity = (1 - phase) * 0.32
      })
    }
  })

  return (
    // Sobe o conjunto para a quilha encostar no piso do showroom.
    <group position={[0, 0.34, 0]}>
      <mesh geometry={hullGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial {...paint} />
      </mesh>

      <mesh geometry={graphicGeometry}>
        <meshPhysicalMaterial color={accent} roughness={0.24} metalness={0.35} clearcoat={1} />
      </mesh>
      <mesh geometry={graphicMirror}>
        <meshPhysicalMaterial color={accent} roughness={0.24} metalness={0.35} clearcoat={1} />
      </mesh>

      <mesh geometry={deckGeometry} castShadow>
        <meshStandardMaterial color="#232833" roughness={0.66} metalness={0.18} />
      </mesh>

      {/* Almofada do banco */}
      <mesh position={[-0.5, 0.63, 0]} rotation={[0, 0, -0.03]} castShadow>
        <boxGeometry args={[1.2, 0.09, 0.46]} />
        <meshStandardMaterial color="#0f1218" roughness={0.96} />
      </mesh>

      {/* Estribos laterais */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[-1.0, 0.26, side * 0.5]} castShadow>
          <boxGeometry args={[1.0, 0.05, 0.24]} />
          <meshStandardMaterial color="#14181f" roughness={0.9} />
        </mesh>
      ))}

      {/* Coluna e guidão */}
      <mesh position={[0.8, 0.8, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.34, 0.14, 0.3]} />
        <meshStandardMaterial color="#14171d" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh castShadow>
        <tubeGeometry args={[barCurve, 24, 0.028, 10, false]} />
        <meshStandardMaterial color="#2b3140" roughness={0.4} metalness={0.8} />
      </mesh>
      {[-0.34, 0.34].map((z) => (
        <mesh key={z} position={[0.73, 0.88, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.042, 0.042, 0.16, 14]} />
          <meshStandardMaterial color="#0e1015" roughness={0.95} />
        </mesh>
      ))}

      {/* Para-brisa */}
      <mesh position={[0.98, 0.92, 0]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[0.28, 0.012, 0.4]} />
        <meshPhysicalMaterial
          color="#8fd8ff"
          transmission={0.9}
          thickness={0.2}
          roughness={0.08}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Bocal do jato, na popa */}
      <mesh position={[-1.72, 0.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.16, 0.2, 18]} />
        <meshStandardMaterial color="#3a414d" roughness={0.35} metalness={0.9} />
      </mesh>

      {/* Espuma da esteira */}
      <group ref={wake} visible={false}>
        {[0, 1, 2, 3].map((index) => (
          <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[-1.8, -0.24, 0]}>
            <ringGeometry args={[0.3, 0.42, 32]} />
            <meshBasicMaterial color="#cfe9ff" transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
