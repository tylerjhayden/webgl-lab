import { useRef } from 'react'
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

  return (
    <group ref={groupRef}>
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 2
        const z = Math.sin(angle) * 2
        const hue = i / 8
        const color = new THREE.Color().setHSL(hue, 0.8, 0.5)

        return (
          <mesh key={i} position={[x, Math.sin(angle) * 0.5, z]}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        )
      })}
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
        emissive="#6366f1"
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
          offset={new THREE.Vector2(chromaticOffset, chromaticOffset)}
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
