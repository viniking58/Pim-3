import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { Stage3D, type EnvId } from './Stage3D'
import { JetSki3D } from './JetSki3D'
import { Utv3D } from './Utv3D'
import { Atv3D } from './Atv3D'
import { GltfBoundary, GltfVehicle, type GltfSlots } from './GltfVehicle'
import { buildPaint, type FinishId } from './materials'

export type ModelId = 'jetski' | 'utv' | 'utility' | 'atv'

/** Peças opcionais que os acessórios acendem ou apagam na cena. */
export type VisualParts = {
  mirrors?: boolean
  windshield?: boolean
  lightbar?: boolean
  roof?: boolean
  rack?: boolean
}

export type SceneConfig = {
  model: ModelId
  color: string
  finish: FinishId
  accent: string
  env: EnvId
  moving: boolean
  autoRotate: boolean
  /** Ligadas pelos acessórios escolhidos no configurador. */
  parts?: VisualParts
  /**
   * Caminho de um .glb para este modelo. Quando presente, o arquivo real
   * substitui a geometria procedural — mesmo palco, mesmas opções de cor.
   */
  asset?: string
  slots?: GltfSlots
}

/**
 * Ajusta a distância da câmera ao formato do quadro: num celular em pé o
 * enquadramento é estreito, e sem afastar a câmera o veículo sai da tela.
 */
function ResponsiveCamera() {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height)
    const distance = aspect < 0.9 ? 9 : aspect < 1.35 ? 7.4 : 6.3
    // Ângulo de foto de produto: baixo o bastante para mostrar o costado.
    const direction = new THREE.Vector3(0.68, 0.3, 0.67).normalize()
    camera.position.copy(direction.multiplyScalar(distance))
    camera.lookAt(0, 0.66, 0)
    camera.updateProjectionMatrix()
  }, [camera, size])

  return null
}

/** Plataforma giratória: gira sozinha e "flutua" de leve no modo movimento. */
function Turntable({ config }: { config: SceneConfig }) {
  const group = useRef<THREE.Group>(null)
  const paint = buildPaint(config.color, config.finish)

  // Geometria autoral: é o que aparece sem arquivo .glb configurado, e
  // também a reserva caso o arquivo falhe ao carregar.
  const procedural = (
    <>
      {config.model === 'jetski' && (
        <JetSki3D paint={paint} accent={config.accent} moving={config.moving} parts={config.parts} />
      )}
      {config.model === 'utv' && (
        <Utv3D paint={paint} accent={config.accent} moving={config.moving} parts={config.parts} />
      )}
      {config.model === 'utility' && (
        <Utv3D paint={paint} accent={config.accent} moving={config.moving} utility parts={config.parts} />
      )}
      {config.model === 'atv' && (
        <Atv3D paint={paint} accent={config.accent} moving={config.moving} parts={config.parts} />
      )}
    </>
  )

  useFrame((state, delta) => {
    if (!group.current) return
    if (config.autoRotate) group.current.rotation.y += delta * 0.24
    group.current.position.y = config.moving
      ? Math.sin(state.clock.elapsedTime * 3.1) * 0.018
      : 0
  })

  return (
    <group ref={group}>
      {config.asset ? (
        <GltfBoundary fallback={procedural}>
          <GltfVehicle
            url={config.asset}
            paint={paint}
            accent={config.accent}
            moving={config.moving}
            {...config.slots}
          />
        </GltfBoundary>
      ) : (
        procedural
      )}
    </group>
  )
}

/**
 * Cena WebGL do configurador. O zoom por scroll fica desligado de propósito:
 * a roda do mouse continua rolando a página, como no configurador da Porsche.
 */
export function VehicleScene({ config, active = true }: { config: SceneConfig; active?: boolean }) {
  return (
    <Canvas
      shadows
      // Congela o loop de render quando a seção sai da tela: nada de gastar
      // GPU (e bateria) desenhando um palco que ninguém está vendo.
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 2]}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, preserveDrawingBuffer: false }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.05
      }}
    >
      <PerspectiveCamera makeDefault position={[5.1, 2.9, 5.6]} fov={34} />
      <ResponsiveCamera />
      <Suspense fallback={null}>
        <Stage3D env={config.env} moving={config.moving} />
        <Turntable config={config} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI * 0.16}
        maxPolarAngle={Math.PI * 0.49}
        target={[0, 0.66, 0]}
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.65}
      />
    </Canvas>
  )
}
