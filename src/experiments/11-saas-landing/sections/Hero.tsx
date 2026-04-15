import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from '../shaders/passthrough.vert'
import fragmentShader from '../shaders/displacement.frag'

function DisplacementQuad() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const prevMouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const velocityRef = useRef(new THREE.Vector2(0, 0))
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseVelocity: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  )

  useFrame(({ clock, pointer }) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms

    u.uTime.value = clock.getElapsedTime()
    u.uResolution.value.set(size.width, size.height)

    // Smooth mouse (experiment 06 pattern)
    const targetX = (pointer.x + 1) * 0.5
    const targetY = (pointer.y + 1) * 0.5
    mouseRef.current.x += (targetX - mouseRef.current.x) * 0.08
    mouseRef.current.y += (targetY - mouseRef.current.y) * 0.08
    u.uMouse.value.copy(mouseRef.current)

    // Velocity = frame delta
    velocityRef.current.set(
      mouseRef.current.x - prevMouseRef.current.x,
      mouseRef.current.y - prevMouseRef.current.y,
    )
    u.uMouseVelocity.value.copy(velocityRef.current)
    prevMouseRef.current.copy(mouseRef.current)
  })

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </ScreenQuad>
  )
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section ref={containerRef} className="relative h-screen w-full">
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: false, antialias: false }}
        dpr={[1, 1.5]}
        eventSource={containerRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <DisplacementQuad />
      </Canvas>

      <div className="relative z-[5] flex flex-col justify-end h-full p-8 md:p-16 pointer-events-none">
        <p
          className="text-sm tracking-[0.3em] uppercase mb-6"
          style={{ fontFamily: "'Space Mono', monospace", color: '#c8f065' }}
        >
          Creative Studio
        </p>
        <h1
          className="text-6xl md:text-8xl font-extrabold leading-[0.95] tracking-tight mb-6"
          style={{ fontFamily: "'Syne', sans-serif", color: '#e2e8f0' }}
        >
          We build<br />digital worlds
        </h1>
        <p
          className="text-lg max-w-md mb-8"
          style={{ fontFamily: "'Space Mono', monospace", color: '#94a3b8' }}
        >
          Design, motion, and code — forged into
          experiences that move people.
        </p>
        <div className="flex gap-4 pointer-events-auto">
          <button
            className="px-6 py-3 text-sm font-bold tracking-wider uppercase transition-colors hover:brightness-110"
            style={{ fontFamily: "'Syne', sans-serif", background: '#c8f065', color: '#06060a' }}
          >
            View Work
          </button>
          <button
            className="px-6 py-3 text-sm font-bold tracking-wider uppercase border transition-colors"
            style={{ fontFamily: "'Syne', sans-serif", borderColor: '#2a2a3a', color: '#e2e8f0' }}
          >
            Contact
          </button>
        </div>
      </div>
    </section>
  )
}
