import { Component, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MeshPhysicalMaterialParameters } from 'three'

export type GltfSlots = {
  /** Trechos de nome de material que recebem a cor de pintura. */
  paintSlots?: string[]
  /** Trechos de nome de material que recebem a cor de rodas e detalhes. */
  accentSlots?: string[]
  /** Trechos de nome de nó que devem girar no modo "em movimento". */
  wheelSlots?: string[]
}

type GltfVehicleProps = GltfSlots & {
  url: string
  paint: MeshPhysicalMaterialParameters
  accent: string
  moving: boolean
  /** Comprimento alvo, em unidades de cena, para o modelo ocupar o palco. */
  targetLength?: number
}

const DEFAULT_PAINT_SLOTS = ['paint', 'body', 'carroceria', 'pintura', 'deck', 'shell']
const DEFAULT_ACCENT_SLOTS = ['accent', 'trim', 'rim', 'wheel', 'detalhe', 'aro', 'seat']
const DEFAULT_WHEEL_SLOTS = ['wheel', 'roda', 'tire', 'pneu']

function matches(name: string, needles: string[]) {
  const lower = name.toLowerCase()
  return needles.some((needle) => lower.includes(needle.toLowerCase()))
}

/**
 * Renderiza um modelo 3D real (.glb) no mesmo palco dos modelos procedurais:
 * mesma iluminação, mesma plataforma giratória e as mesmas opções de cor.
 *
 * O arquivo é centralizado, apoiado no piso e reescalado automaticamente, de
 * modo que qualquer modelo — em qualquer unidade e origem — entre enquadrado.
 */
/**
 * Se o arquivo não carregar (URL errada, rede fora, CSP bloqueando a origem),
 * o palco cai para a geometria procedural em vez de ficar vazio.
 */
export class GltfBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[configurador] modelo .glb não pôde ser carregado:', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function GltfVehicle({
  url,
  paint,
  accent,
  moving,
  paintSlots = DEFAULT_PAINT_SLOTS,
  accentSlots = DEFAULT_ACCENT_SLOTS,
  wheelSlots = DEFAULT_WHEEL_SLOTS,
  targetLength = 3.4,
}: GltfVehicleProps) {
  // Decodificador Draco auto-hospedado em /draco/: o padrão do drei vem de um
  // CDN externo, que a CSP do site bloqueia. Modelos de fabricante quase
  // sempre chegam comprimidos, então isso não é opcional.
  const { scene } = useGLTF(url, '/draco/')

  /*
   * Materiais metálicos: quando o modelo do fabricante já traz mapas, eles
   * são preservados; o que trocamos é só a cor base e o par
   * roughness/metalness dos slots configuráveis.
   */

  // Clonamos: o cache do useGLTF é compartilhado e não pode ser mutado.
  const model = useMemo(() => scene.clone(true), [scene])
  const wheels = useRef<{ node: THREE.Object3D; axis: 'x' | 'y' | 'z' }[]>([])

  useLayoutEffect(() => {
    wheels.current = []

    model.traverse((node) => {
      if (matches(node.name, wheelSlots)) {
        const box = new THREE.Box3().setFromObject(node)
        const size = box.getSize(new THREE.Vector3())
        // O eixo do cubo é sempre a menor dimensão da roda.
        const axis = size.x < size.y && size.x < size.z ? 'x' : size.z < size.y ? 'z' : 'y'
        wheels.current.push({ node, axis })
      }

      if (!(node instanceof THREE.Mesh)) return
      node.castShadow = true
      node.receiveShadow = true

      const apply = (material: THREE.Material) => {
        const name = material.name ?? ''
        const isPaint = matches(name, paintSlots)
        const isAccent = !isPaint && matches(name, accentSlots)
        if (!isPaint && !isAccent) return material

        // Material próprio por instância, preservando texturas do arquivo.
        const next = material.clone() as THREE.MeshStandardMaterial
        if (isPaint) {
          next.color = new THREE.Color(paint.color as THREE.ColorRepresentation)
          if (typeof paint.roughness === 'number') next.roughness = paint.roughness
          if (typeof paint.metalness === 'number') next.metalness = paint.metalness
        } else {
          next.color = new THREE.Color(accent)
        }
        return next
      }

      node.material = Array.isArray(node.material)
        ? node.material.map(apply)
        : apply(node.material)
    })

    // Centraliza no eixo, apoia no piso e normaliza a escala.
    model.position.set(0, 0, 0)
    model.scale.setScalar(1)
    model.updateWorldMatrix(true, true)

    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const longest = Math.max(size.x, size.z)
    if (longest > 0) model.scale.setScalar(targetLength / longest)

    model.updateWorldMatrix(true, true)
    const scaled = new THREE.Box3().setFromObject(model)
    const center = scaled.getCenter(new THREE.Vector3())
    model.position.set(-center.x, -scaled.min.y, -center.z)
  }, [model, paint, accent, paintSlots, accentSlots, wheelSlots, targetLength])

  useFrame((_, delta) => {
    if (!moving) return
    for (const wheel of wheels.current) {
      wheel.node.rotation[wheel.axis] -= delta * 6
    }
  })

  return <primitive object={model} />
}
