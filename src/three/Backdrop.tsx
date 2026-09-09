import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei'
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import { useReducedMotion, type MotionValue } from 'motion/react'
import * as THREE from 'three'
import './backdrop.css'

/**
 * Cena WebGL persistente atrás do site inteiro.
 *
 * A diferença entre "ter 3D numa seção" e um site que parece fluido é esta:
 * existe uma única cena viva do topo ao rodapé, e o scroll dirige a câmera
 * dentro dela em vez de trocar de bloco. O conteúdo flutua por cima.
 */

type BackdropProps = {
  /** Progresso do scroll da página inteira, de 0 a 1. */
  progress: MotionValue<number>
  /** Desliga o loop enquanto o configurador (outra cena WebGL) está em tela. */
  active: boolean
}

export function Backdrop({ progress, active }: BackdropProps) {
  const reduced = useReducedMotion()

  return (
    <div className="backdrop" aria-hidden="true">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [0, 0.4, 9], fov: 40 }}
      >
        <fog attach="fog" args={["#07080b", 6, 24]} />

        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 6, 4]} intensity={2.2} color="#ffffff" />
        <spotLight position={[-6, 2, -5]} angle={0.9} penumbra={1} intensity={120} color="#00e5ff" />
        <spotLight position={[6, -2, -4]} angle={0.9} penumbra={1} intensity={70} color="#ff2d18" />

        <Suspense fallback={null}>
          <Environment resolution={128}>
            <Lightformer form="rect" intensity={5} position={[0, 5, -3]} rotation-x={Math.PI / 2} scale={[10, 0.6, 1]} color="#ffffff" />
            <Lightformer form="rect" intensity={3} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[4, 5, 1]} color="#00e5ff" />
            <Lightformer form="rect" intensity={2.4} position={[5, 1, 2]} rotation-y={-Math.PI / 2} scale={[4, 5, 1]} color="#ff2d18" />
          </Environment>

          <ScrollRig progress={progress} reduced={Boolean(reduced)}>
            <group position={[2.1, 0, -1.2]}>
              <Monolith />
            </group>
            <Motes />
          </ScrollRig>

          {/*
            Pós-processamento é o que separa "uns objetos 3D na tela" de uma
            imagem com acabamento: o bloom espalha as luzes, a aberração
            cromática quebra as bordas como uma lente real e o grão costura
            tudo com o grão do próprio site.
          */}
          {!reduced && (
            <EffectComposer multisampling={0} enableNormalPass={false}>
              <Bloom
                intensity={0.9}
                luminanceThreshold={0.55}
                luminanceSmoothing={0.35}
                kernelSize={KernelSize.LARGE}
                mipmapBlur
              />
              <ChromaticAberration
                offset={new THREE.Vector2(0.0009, 0.0012)}
                radialModulation
                modulationOffset={0.35}
                blendFunction={BlendFunction.NORMAL}
              />
              <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.32} />
              <Vignette eskil={false} offset={0.24} darkness={0.86} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>

      <div className="backdrop__veil" />
    </div>
  )
}

/**
 * Traduz o progresso do scroll em movimento de câmera. A câmera mergulha em
 * direção ao objeto e desce, enquanto o conjunto gira — é o que costura as
 * seções numa viagem só, em vez de blocos empilhados.
 */
function ScrollRig({
  progress,
  reduced,
  children,
}: {
  progress: MotionValue<number>
  reduced: boolean
  children: React.ReactNode
}) {
  const group = useRef<THREE.Group>(null)
  const camera = useThree((state) => state.camera)
  const pointer = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    const p = reduced ? 0 : progress.get()
    const damp = 1 - Math.pow(0.001, delta) // suavização independente de FPS

    // Trilho da câmera: aproxima, desce e inclina ao longo da página.
    const target = new THREE.Vector3(
      Math.sin(p * Math.PI * 0.6) * 1.6,
      0.4 - p * 2.6,
      9 - p * 5.4,
    )

    // Paralaxe leve do ponteiro, para a cena responder mesmo parado.
    pointer.current.x += (state.pointer.x - pointer.current.x) * damp * 0.6
    pointer.current.y += (state.pointer.y - pointer.current.y) * damp * 0.6
    target.x += pointer.current.x * 0.5
    target.y += pointer.current.y * 0.3

    camera.position.lerp(target, damp)
    camera.lookAt(0, -p * 1.4, 0)

    if (group.current) {
      group.current.rotation.y = p * Math.PI * 1.8 + state.clock.elapsedTime * 0.04
      group.current.rotation.x = Math.sin(p * Math.PI) * 0.3
      const scale = 1 + p * 0.5
      group.current.scale.setScalar(scale)
    }
  })

  return <group ref={group}>{children}</group>
}

/** Núcleo facetado em vidro: o objeto que a câmera percorre. */
function Monolith() {
  const shards = useMemo(
    () => [
      { position: [0, 0, 0], scale: 1.5, detail: 0, rotation: [0.3, 0.2, 0.1] },
      { position: [1.9, 0.7, -1.4], scale: 0.62, detail: 0, rotation: [0.9, 0.4, 0.2] },
      { position: [-2.1, -0.6, -1.1], scale: 0.78, detail: 1, rotation: [0.2, 1.1, 0.5] },
      { position: [0.7, -1.7, 1.2], scale: 0.45, detail: 0, rotation: [1.2, 0.3, 0.8] },
      { position: [-1.4, 1.6, 0.9], scale: 0.4, detail: 0, rotation: [0.6, 0.8, 0.3] },
    ],
    [],
  )

  return (
    <group>
      {shards.map((shard, index) => (
        <mesh
          key={index}
          position={shard.position as [number, number, number]}
          rotation={shard.rotation as [number, number, number]}
          scale={shard.scale}
        >
          <icosahedronGeometry args={[1, shard.detail]} />
          <MeshTransmissionMaterial
            samples={4}
            resolution={256}
            thickness={0.9}
            roughness={0.1}
            anisotropy={0.4}
            chromaticAberration={0.35}
            distortion={0.3}
            distortionScale={0.4}
            temporalDistortion={0.1}
            iridescence={1}
            iridescenceIOR={1.6}
            iridescenceThicknessRange={[100, 900]}
            color="#7d8ba3"
            background={new THREE.Color('#07080b')}
          />
        </mesh>
      ))}

      {/* Núcleo opaco, para o vidro ter o que refratar */}
      <mesh scale={0.42}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ff2d18" roughness={0.28} metalness={0.9} emissive="#3d0904" />
      </mesh>
    </group>
  )
}

/** Poeira em suspensão: dá escala e profundidade ao vazio. */
function Motes() {
  const points = useRef<THREE.Points>(null)

  const geometry = useMemo(() => {
    const count = 900
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Distribuição em casca esférica, para nunca ficar denso no centro.
      const radius = 4 + Math.random() * 9
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.cos(phi)
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return buffer
  }, [])

  useFrame((state, delta) => {
    if (!points.current) return
    points.current.rotation.y += delta * 0.02
    points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1
  })

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.028}
        sizeAttenuation
        color="#9fb4cc"
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  )
}
