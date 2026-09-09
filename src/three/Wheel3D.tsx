import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

type Wheel3DProps = {
  position: [number, number, number]
  radius: number
  width: number
  /** Cor do aro e do cubo. */
  accent: string
  /** Quantidade de tacos na banda de rodagem. */
  lugs?: number
  spokes?: number
}

/**
 * Roda off-road completa: pneu com tacos em duas fileiras, aro com raios e
 * cubo central. O grupo inteiro gira no eixo Z quando o veículo "anda".
 */
export function Wheel3D({ position, radius, width, accent, lugs = 22, spokes = 6 }: Wheel3DProps) {
  const tread = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    const lugSize = new THREE.Vector3(radius * 0.2, radius * 0.13, width * 0.3)

    for (let i = 0; i < lugs; i++) {
      const angle = (i / lugs) * Math.PI * 2
      for (const side of [-1, 1]) {
        // Fileiras alternadas, como um pneu de barro de verdade.
        const stagger = side > 0 ? Math.PI / lugs : 0
        const box = new THREE.BoxGeometry(lugSize.x, lugSize.y, lugSize.z)
        const matrix = new THREE.Matrix4()
          .makeTranslation(0, radius * 0.96, side * width * 0.26)
          .multiply(new THREE.Matrix4().makeRotationZ(0))
        const rotate = new THREE.Matrix4().makeRotationZ(angle + stagger)
        box.applyMatrix4(matrix)
        box.applyMatrix4(rotate)
        parts.push(box)
      }
    }

    return mergeGeometries(parts, false)!
  }, [radius, width, lugs])

  const spokeGeometry = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    for (let i = 0; i < spokes; i++) {
      const angle = (i / spokes) * Math.PI * 2
      const box = new THREE.BoxGeometry(radius * 0.15, radius * 0.54, width * 0.2)
      box.applyMatrix4(new THREE.Matrix4().makeTranslation(0, radius * 0.3, 0))
      box.applyMatrix4(new THREE.Matrix4().makeRotationZ(angle))
      parts.push(box)
    }
    return mergeGeometries(parts, false)!
  }, [radius, width, spokes])

  return (
    <group position={position} rotation={[0, 0, 0]}>
      {/* Banda de rodagem: tubo aberto, para o aro aparecer por dentro. */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, width, 40, 1, true]} />
        <meshStandardMaterial color="#24272f" roughness={0.9} metalness={0.04} side={THREE.DoubleSide} />
      </mesh>

      {/* Flancos: anéis entre a banda e o aro */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, 0, (side * width) / 2]}>
          <ringGeometry args={[radius * 0.61, radius, 40]} />
          <meshStandardMaterial
            color="#1a1d24"
            roughness={0.96}
            metalness={0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      <mesh geometry={tread} castShadow>
        <meshStandardMaterial color="#0f1116" roughness={0.88} />
      </mesh>

      {/* Aro */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.615, radius * 0.615, width * 0.94, 32]} />
        <meshStandardMaterial color="#2a2f39" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Raios: duplicados nas duas faces para aparecerem de qualquer ângulo */}
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={spokeGeometry} position={[0, 0, (side * width) / 2.6]}>
          <meshStandardMaterial color={accent} roughness={0.26} metalness={0.78} />
        </mesh>
      ))}

      {/* Cubo e porcas */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.21, radius * 0.21, width * 1.02, 20]} />
        <meshStandardMaterial color={accent} roughness={0.2} metalness={0.92} />
      </mesh>
    </group>
  )
}
