import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useControls } from 'leva'
import type { Mesh } from 'three'

export default function Scene() {
  const meshRef = useRef<Mesh>(null)

  const { speed, distort, color, emissiveIntensity, metalness, iridescence, bloomIntensity } =
    useControls('Morphing Blob', {
      speed: { value: 3, min: 0.5, max: 10, step: 0.5 },
      distort: { value: 0.5, min: 0, max: 1, step: 0.01 },
      color: '#6366f1',
      emissiveIntensity: { value: 0.8, min: 0, max: 3, step: 0.1 },
      metalness: { value: 0.9, min: 0, max: 1, step: 0.05 },
      iridescence: { value: 1, min: 0, max: 1, step: 0.05 },
      bloomIntensity: { value: 1.2, min: 0, max: 5, step: 0.1 },
    })

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.2
  })

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[-3, 4, 2]} intensity={1.5} />

      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 64]} />
        <MeshDistortMaterial
          speed={speed}
          distort={distort}
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={metalness}
          roughness={0.15}
          iridescence={iridescence}
          iridescenceIOR={1.3}
          clearcoat={1}
          clearcoatRoughness={0.1}
          toneMapped={false}
        />
      </mesh>

      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}
