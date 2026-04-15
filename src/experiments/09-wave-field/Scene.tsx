import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'

const tempObject = new THREE.Object3D()
const tempColor = new THREE.Color()

export default function Scene() {
  const { amplitude, frequency, speed, count, metalness } = useControls('Wave Field', {
    amplitude: { value: 1.5, min: 0.1, max: 4, step: 0.1 },
    frequency: { value: 0.3, min: 0.05, max: 1, step: 0.01 },
    speed: { value: 1.5, min: 0.1, max: 5, step: 0.1 },
    count: { value: 50, min: 10, max: 80, step: 1 },
    metalness: { value: 0.6, min: 0, max: 1, step: 0.05 },
  })

  const meshRef = useRef<THREE.InstancedMesh>(null)
  const total = count * count

  const colorArray = useMemo(() => new Float32Array(total * 3), [total])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return

    const t = clock.getElapsedTime()
    const half = count / 2
    let idx = 0

    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        const x = (xi - half) * 0.4
        const z = (zi - half) * 0.4

        const y =
          amplitude * Math.sin(x * frequency + t * speed) * Math.cos(z * frequency + t * speed * 0.7)

        tempObject.position.set(x, y, z)
        tempObject.scale.set(1, 0.5 + Math.abs(y) * 0.5, 1)
        tempObject.updateMatrix()
        mesh.setMatrixAt(idx, tempObject.matrix)

        // HSL: blue(0.6) at low → green(0.35) at mid → pink(0.85) at high
        const normalizedY = (y / amplitude + 1) / 2
        tempColor.setHSL(0.6 - normalizedY * 0.25 + normalizedY * normalizedY * 0.5, 0.8, 0.5)
        tempColor.toArray(colorArray, idx * 3)

        idx++
      }
    }

    mesh.instanceMatrix.needsUpdate = true
    mesh.geometry.attributes.color.needsUpdate = true
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />

      <instancedMesh key={count} ref={meshRef} args={[undefined, undefined, total]}>
        <boxGeometry args={[0.3, 0.3, 0.3]}>
          <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
        </boxGeometry>
        <meshStandardMaterial vertexColors metalness={metalness} roughness={0.4} />
      </instancedMesh>
    </>
  )
}
