import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshTransmissionMaterial } from '@react-three/drei'
import { useControls } from 'leva'
import type { Group } from 'three'
import * as THREE from 'three'

const SHAPE_COUNT = 12
const ORBIT_RADIUS = 2.5

const GEOMETRIES = [
  <icosahedronGeometry args={[1, 0]} />,
  <boxGeometry args={[1, 1, 1]} />,
  <octahedronGeometry args={[1, 0]} />,
]

function FloatingShapes() {
  const groupRef = useRef<Group>(null)

  const shapes = useMemo(
    () =>
      Array.from({ length: SHAPE_COUNT }, (_, i) => {
        const angle = (i / SHAPE_COUNT) * Math.PI * 2
        const color = new THREE.Color().setHSL(i / SHAPE_COUNT, 0.8, 0.55)
        return {
          position: [
            Math.cos(angle) * ORBIT_RADIUS,
            Math.sin(angle * 2) * 0.8,
            Math.sin(angle) * ORBIT_RADIUS,
          ] as [number, number, number],
          color,
          geometry: i % GEOMETRIES.length,
          scale: 0.25 + Math.random() * 0.15,
        }
      }),
    [],
  )

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.15
  })

  return (
    <group ref={groupRef}>
      {shapes.map((s, i) => (
        <Float key={i} speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
          <mesh position={s.position} scale={s.scale}>
            {GEOMETRIES[s.geometry]}
            <meshStandardMaterial color={s.color} metalness={0.4} roughness={0.3} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

export default function Scene() {
  const config = useControls('Transmission', {
    transmission: { value: 1, min: 0, max: 1, step: 0.01 },
    thickness: { value: 0.5, min: 0, max: 2, step: 0.05 },
    roughness: { value: 0.1, min: 0, max: 1, step: 0.01 },
    chromaticAberration: { value: 0.4, min: 0, max: 1, step: 0.01 },
    distortion: { value: 0.5, min: 0, max: 2, step: 0.05 },
    distortionScale: { value: 0.3, min: 0, max: 1, step: 0.01 },
    temporalDistortion: { value: 0.2, min: 0, max: 1, step: 0.01 },
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight position={[0, 8, 0]} intensity={1.5} angle={0.5} penumbra={0.5} />

      <FloatingShapes />

      <mesh>
        <torusKnotGeometry args={[1, 0.35, 128, 32]} />
        <MeshTransmissionMaterial
          samples={4}
          resolution={512}
          transmission={config.transmission}
          thickness={config.thickness}
          roughness={config.roughness}
          chromaticAberration={config.chromaticAberration}
          distortion={config.distortion}
          distortionScale={config.distortionScale}
          temporalDistortion={config.temporalDistortion}
        />
      </mesh>
    </>
  )
}
