import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import trailVert from './shaders/trail.vert'
import trailFrag from './shaders/trail.frag'

const COUNT = 60

function Trail() {
  const pointsRef = useRef<THREE.Points>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  const chain = useMemo(() => {
    const arr: { x: number; y: number }[] = []
    for (let i = 0; i < COUNT; i++) arr.push({ x: 0.5, y: 0.5 })
    return arr
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const { positions, sizes, opacities } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const siz = new Float32Array(COUNT)
    const opa = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT
      pos[i * 3] = 0.5
      pos[i * 3 + 1] = 0.5
      pos[i * 3 + 2] = 0
      // Steeper size falloff: big lead, fast taper
      siz[i] = Math.pow(1.0 - t, 1.5)
      opa[i] = Math.pow(1.0 - t, 1.2)
    }
    return { positions: pos, sizes: siz, opacities: opa }
  }, [])

  const uniforms = useMemo(
    () => ({
      uPointScale: { value: 45.0 },
      uColor: { value: new THREE.Color('#c8f065') },
    }),
    [],
  )

  useFrame(() => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute

    chain[0].x = mouseRef.current.x
    chain[0].y = mouseRef.current.y

    for (let i = 1; i < COUNT; i++) {
      const ease = Math.max(0.38 - i * 0.005, 0.015)
      chain[i].x += (chain[i - 1].x - chain[i].x) * ease
      chain[i].y += (chain[i - 1].y - chain[i].y) * ease
    }

    for (let i = 0; i < COUNT; i++) {
      posAttr.setXY(i, chain[i].x, chain[i].y)
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={COUNT}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aOpacity"
          count={COUNT}
          array={opacities}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={trailVert}
        fragmentShader={trailFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function CursorTrail() {
  return (
    <div className="fixed inset-0 z-[9] pointer-events-none">
      <Canvas
        className="!absolute inset-0"
        style={{ pointerEvents: 'none' }}
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1.5]}
        orthographic
        camera={{
          left: 0, right: 1, top: 1, bottom: 0,
          near: 0.1, far: 10, position: [0, 0, 1],
        }}
      >
        <Trail />
      </Canvas>
    </div>
  )
}
