import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import vertexShader from './shaders/particles.vert'
import fragmentShader from './shaders/particles.frag'

const PARTICLE_COUNT = 5000

export default function Scene() {
  const pointsRef = useRef<THREE.Points>(null)
  const mouseRef = useRef(new THREE.Vector2(0, 0))
  const { viewport } = useThree()

  const { particleSize, mouseRadius, speed } = useControls('Particles', {
    particleSize: { value: 30, min: 5, max: 100, step: 1 },
    mouseRadius: { value: 0.3, min: 0.05, max: 1, step: 0.05 },
    speed: { value: 0.5, min: 0, max: 2, step: 0.1 },
  })

  const { positions, scales, randomness } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const scl = new Float32Array(PARTICLE_COUNT)
    const rnd = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Distribute in a sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.cbrt(Math.random()) * 4

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      scl[i] = 0.2 + Math.random() * 0.8
      rnd[i * 3] = 0.5 + Math.random() * 1.5
      rnd[i * 3 + 1] = 0.5 + Math.random() * 1.5
      rnd[i * 3 + 2] = 0.5 + Math.random() * 1.5
    }

    return { positions: pos, scales: scl, randomness: rnd }
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: particleSize },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseRadius: { value: mouseRadius },
    }),
    [],
  )

  useFrame(({ clock, pointer }) => {
    if (!pointsRef.current) return
    const material = pointsRef.current.material as THREE.ShaderMaterial

    material.uniforms.uTime.value = clock.getElapsedTime() * speed
    material.uniforms.uSize.value = particleSize
    material.uniforms.uMouseRadius.value = mouseRadius

    // Smooth mouse tracking
    mouseRef.current.lerp(pointer, 0.1)
    material.uniforms.uMouse.value.copy(mouseRef.current)
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aScale"
            count={PARTICLE_COUNT}
            array={scales}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aRandomness"
            count={PARTICLE_COUNT}
            array={randomness}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}
