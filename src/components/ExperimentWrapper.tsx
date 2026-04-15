import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stats } from '@react-three/drei'

interface ExperimentWrapperProps {
  children: React.ReactNode
}

function Fallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#333" wireframe />
    </mesh>
  )
}

export default function ExperimentWrapper({ children }: ExperimentWrapperProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [3, 3, 3], fov: 50 }}
      gl={{ antialias: true }}
      className="!absolute inset-0"
    >
      <Suspense fallback={<Fallback />}>
        <Environment preset="city" background={false} />
        {children}
      </Suspense>
      <OrbitControls makeDefault />
      <Stats />
    </Canvas>
  )
}
