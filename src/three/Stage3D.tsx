import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

export type EnvId = 'catalog' | 'studio' | 'sunset' | 'night'

type Preset = {
  key: THREE.ColorRepresentation
  fill: THREE.ColorRepresentation
  rim: THREE.ColorRepresentation
  ambient: number
  floor: THREE.ColorRepresentation
  fog: THREE.ColorRepresentation
  /** Opacidade da sombra de contato — num ciclorama branco ela é bem suave. */
  shadow: number
}

export const ENV_PRESETS: Record<EnvId, Preset> = {
  // Ciclorama branco: o mesmo enquadramento das fotos de catálogo da fábrica.
  catalog: { key: '#ffffff', fill: '#f4f7fc', rim: '#ffffff', ambient: 1.05, floor: '#eef1f6', fog: '#f2f4f8', shadow: 0.4 },
  studio: { key: '#ffffff', fill: '#dfe6f2', rim: '#eef3fb', ambient: 0.6, floor: '#0c0e13', fog: '#08090c', shadow: 0.72 },
  sunset: { key: '#ffe2bd', fill: '#ffab86', rim: '#ff6a3d', ambient: 0.5, floor: '#150d0c', fog: '#180d0a', shadow: 0.68 },
  night: { key: '#c8dcff', fill: '#4a6a9e', rim: '#ff4a33', ambient: 0.34, floor: '#05070c', fog: '#04050a', shadow: 0.6 },
}

/**
 * Iluminação de estúdio de fotografia automotiva: uma softbox principal, um
 * rebatedor de preenchimento e uma faixa de contraluz que desenha a silhueta.
 * O mapa de ambiente é gerado em memória — nada é baixado da rede.
 */
export function Stage3D({ env, moving }: { env: EnvId; moving: boolean }) {
  const preset = ENV_PRESETS[env]
  const streaks = useRef<THREE.Group>(null)
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    // Ciclorama branco pede menos exposição para os claros não estourarem.
    gl.toneMappingExposure = env === 'catalog' ? 0.74 : 1.05
  }, [gl, env])

  const streakPositions = useMemo(
    () => Array.from({ length: 14 }, (_, index) => ({ z: (index / 13 - 0.5) * 6, offset: Math.random() })),
    [],
  )

  useFrame((state, delta) => {
    if (!streaks.current) return
    streaks.current.visible = moving
    if (!moving) return
    for (const child of streaks.current.children) {
      child.position.x -= delta * 9
      if (child.position.x < -7) child.position.x = 7
    }
    streaks.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02
  })

  return (
    <>
      <color attach="background" args={[preset.fog as string]} />
      <fog attach="fog" args={[preset.fog as string, env === 'catalog' ? 12 : 7.5, env === 'catalog' ? 30 : 17]} />

      <ambientLight intensity={preset.ambient} />
      {/* Rebatedor de chão: sem ele o flanco inferior da lataria fecha em
          preto e a cor escolhida some — o mesmo truque de um estúdio real. */}
      <hemisphereLight args={[preset.key, '#3a4150', env === 'night' ? 0.45 : 0.85]} />
      <directionalLight
        position={[4.5, 7, 4]}
        intensity={env === 'night' ? 1.4 : env === 'catalog' ? 3.1 : 2.6}
        color={preset.key}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      >
        <orthographicCamera attach="shadow-camera" args={[-5, 5, 5, -5, 0.1, 20]} />
      </directionalLight>
      <directionalLight position={[-6, 3, -3]} intensity={env === 'catalog' ? 2 : 1.1} color={preset.fill} />
      <spotLight position={[-3, 4.5, -6]} angle={0.7} penumbra={1} intensity={12} color={preset.rim} />

      {/* Softboxes refletidas na lataria */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={env === 'night' ? 1.2 : env === 'catalog' ? 5.5 : 3.4} position={[0, 5, -2]} scale={[9, 3, 1]} color={preset.key} />
        <Lightformer form="rect" intensity={2} position={[-5, 2, 2]} scale={[4, 5, 1]} rotation-y={Math.PI / 2} color={preset.fill} />
        <Lightformer form="rect" intensity={2.4} position={[5, 2, 2]} scale={[4, 5, 1]} rotation-y={-Math.PI / 2} color={preset.rim} />
        <Lightformer form="circle" intensity={env === 'night' ? 1.4 : env === 'catalog' ? 4.5 : 2.6} position={[0, -2.4, 0]} scale={8} rotation-x={Math.PI / 2} color={env === 'catalog' ? '#dfe4ec' : '#7d879a'} />
        <Lightformer form="rect" intensity={1.8} position={[3, 1, 5]} scale={[5, 4, 1]} color={preset.fill} />
      </Environment>

      {/* Piso do showroom */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <circleGeometry args={[13, 64]} />
        <meshStandardMaterial
          color={preset.floor}
          roughness={env === 'catalog' ? 0.94 : 0.72}
          metalness={env === 'catalog' ? 0.02 : 0.16}
        />
      </mesh>

      <ContactShadows
        position={[0, 0.002, 0]}
        opacity={preset.shadow}
        scale={11}
        blur={env === 'catalog' ? 3.2 : 2.4}
        far={4.5}
        resolution={512}
        color={env === 'catalog' ? '#8b93a3' : '#000000'}
      />

      {/* Rastros de velocidade no modo "em movimento" */}
      <group ref={streaks} visible={false}>
        {streakPositions.map((streak, index) => (
          <mesh
            key={index}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[streak.offset * 14 - 7, 0.004, streak.z]}
          >
            <planeGeometry args={[2.4, 0.028]} />
            <meshBasicMaterial color={preset.rim} transparent opacity={0.35} />
          </mesh>
        ))}
      </group>
    </>
  )
}
