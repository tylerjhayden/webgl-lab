import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import type { Mesh } from 'three'

export default function Scene() {
  const meshRef = useRef<Mesh>(null)

  const { color, speed, scale, wireframe } = useControls('Hello R3F', {
    color: '#D97706',
    speed: { value: 1, min: 0, max: 5, step: 0.1 },
    scale: { value: 1, min: 0.2, max: 3, step: 0.1 },
    wireframe: false,
  })

  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += delta * speed * 0.5
    meshRef.current.rotation.y += delta * speed
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <mesh ref={meshRef} scale={scale} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} wireframe={wireframe} />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position-y={-1} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </>
  )
}
