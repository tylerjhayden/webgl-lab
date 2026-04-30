import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import type { Mesh, Group } from 'three'
import * as THREE from 'three'

function GlowingSpheres() {
  const groupRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.3
  })

  const spheres = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const color = new THREE.Color().setHSL(i / 8, 0.8, 0.5)
        return {
          position: [Math.cos(angle) * 2, Math.sin(angle) * 0.5, Math.sin(angle) * 2] as const,
          color,
        }
      }),
    [],
  )

  return (
    <group ref={groupRef}>
      {spheres.map((s, i) => (
        <mesh key={i} position={s.position}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function CenterPiece() {
  const meshRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.5
    meshRef.current.rotation.z = clock.getElapsedTime() * 0.3
  })

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[0.8, 0.3, 128, 32]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#FF6B35"
        emissiveIntensity={0.5}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  )
}

export default function Scene() {
  const { bloomIntensity, bloomThreshold, chromaticOffset, vignetteIntensity } = useControls(
    'Post-Processing',
    {
      bloomIntensity: { value: 1.5, min: 0, max: 5, step: 0.1 },
      bloomThreshold: { value: 0.6, min: 0, max: 1, step: 0.05 },
      chromaticOffset: { value: 0.005, min: 0, max: 0.02, step: 0.001 },
      vignetteIntensity: { value: 0.5, min: 0, max: 1, step: 0.05 },
    },
  )

  const chromaticOffset_v2 = useMemo(
    () => new THREE.Vector2(chromaticOffset, chromaticOffset),
    [chromaticOffset],
  )

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={1} />

      <CenterPiece />
      <GlowingSpheres />

      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={chromaticOffset_v2}
        />
        <Vignette
          blendFunction={BlendFunction.NORMAL}
          darkness={vignetteIntensity}
          offset={0.3}
        />
      </EffectComposer>
    </>
  )
}
