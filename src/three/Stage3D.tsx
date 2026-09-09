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
  catalog: { key: '#ffffff', fill: '#f4f7fc', rim: '#ffffff', ambient: 0.5, floor: '#eef1f6', fog: '#f2f4f8', shadow: 0.4 },
  // Estúdio escuro: preto profundo, luz-chave branca dura e recorte ciano
  // desenhando a silhueta. Ambiente baixo de propósito — é o contraste que
  // faz a lataria metálica ter o que refletir.
  studio: { key: '#ffffff', fill: '#5c6675', rim: '#00e5ff', ambient: 0.16, floor: '#0a0a0a', fog: '#0a0a0a', shadow: 0.85 },
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
    gl.toneMappingExposure = env === 'catalog' ? 0.74 : env === 'studio' ? 1.15 : 1.05
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
      <hemisphereLight
        args={[preset.key, '#1a1d24', env === 'night' ? 0.45 : env === 'catalog' ? 0.5 : 0.22]}
      />
      <directionalLight
        position={[4.5, 7, 4]}
        intensity={env === 'night' ? 1.4 : env === 'catalog' ? 1.9 : 4.2}
        color={preset.key}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      >
        <orthographicCamera attach="shadow-camera" args={[-3.4, 3.4, 3.4, -3.4, 0.1, 20]} />
      </directionalLight>
      <directionalLight position={[-6, 3, -3]} intensity={env === 'catalog' ? 1.1 : 0.5} color={preset.fill} />
      <spotLight
        position={[-3.5, 3.4, -6]}
        angle={0.8}
        penumbra={1}
        intensity={env === 'studio' ? 90 : 12}
        color={preset.rim}
      />
      {env === 'studio' && (
        <spotLight position={[4.5, 2.4, -5.5]} angle={0.85} penumbra={1} intensity={55} color={preset.rim} />
      )}

      {/* Softboxes refletidas na lataria */}
      <Environment resolution={256}>
        {/* Duas faixas estreitas no lugar de uma softbox larga: numa
            superfície lisa virada para cima, um retângulo grande é espelhado
            inteiro e lava a cor. Em faixa, ele vira um risco de brilho. */}
        <Lightformer
          form="rect"
          intensity={env === 'night' ? 2 : env === 'catalog' ? 5 : 9}
          position={[0, 5, -1.7]}
          rotation-x={Math.PI / 2}
          scale={[10, 0.55, 1]}
          color={preset.key}
        />
        <Lightformer
          form="rect"
          intensity={env === 'night' ? 1.4 : env === 'catalog' ? 3.4 : 4}
          position={[0, 5, 1.4]}
          rotation-x={Math.PI / 2}
          scale={[10, 0.4, 1]}
          color={preset.key}
        />
        <Lightformer form="rect" intensity={env === 'studio' ? 0.9 : 2} position={[-5, 2, 2]} scale={[4, 5, 1]} rotation-y={Math.PI / 2} color={preset.fill} />
        <Lightformer form="rect" intensity={env === 'studio' ? 3.2 : 2.4} position={[5, 2, 2]} scale={[4, 5, 1]} rotation-y={-Math.PI / 2} color={preset.rim} />
        <Lightformer
          form="circle"
          intensity={env === 'night' ? 1.4 : env === 'catalog' ? 4.5 : 1.1}
          position={[0, -2.4, 0]}
          scale={8}
          rotation-x={Math.PI / 2}
          color={env === 'catalog' ? '#dfe4ec' : '#39414f'}
        />
        <Lightformer form="rect" intensity={env === 'studio' ? 0.7 : 1.8} position={[3, 1, 5]} scale={[5, 4, 1]} color={preset.fill} />
      </Environment>

      {/* Piso do showroom */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <circleGeometry args={[13, 64]} />
        <meshStandardMaterial
          color={preset.floor}
          roughness={env === 'catalog' ? 0.94 : 0.72}
          metalness={env === 'catalog' ? 0.02 : 0.16}
          emissive={preset.floor}
          emissiveIntensity={env === 'catalog' ? 0.62 : 0}
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
