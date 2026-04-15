import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import vertexShader from './shaders/gradient.vert'
import fragmentShader from './shaders/gradient.frag'

export default function Scene() {
  const meshRef = useRef<THREE.Mesh>(null)

  const { colorA, colorB, amplitude, speed } = useControls('Shader Gradient', {
    colorA: '#6366f1',
    colorB: '#ec4899',
    amplitude: { value: 0.3, min: 0, max: 1, step: 0.01 },
    speed: { value: 1, min: 0, max: 3, step: 0.1 },
  })

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uAmplitude: { value: amplitude },
    }),
    [],
  )

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const material = meshRef.current.material as THREE.ShaderMaterial
    material.uniforms.uTime.value = clock.getElapsedTime() * speed
    material.uniforms.uColorA.value.set(colorA)
    material.uniforms.uColorB.value.set(colorB)
    material.uniforms.uAmplitude.value = amplitude
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <mesh ref={meshRef} rotation-x={-Math.PI * 0.3}>
        <planeGeometry args={[4, 4, 64, 64]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}
