import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/screen.vert'
import fragmentShader from './shaders/distortion.frag'

const PROJECTS = [
  { name: 'Meridian', category: 'Brand Identity' },
  { name: 'Voidscape', category: 'WebGL Experience' },
  { name: 'Nocturn', category: 'Product Design' },
  { name: 'Prismatic', category: 'Creative Direction' },
]

function DistortionQuad() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  )

  useFrame(({ clock, pointer }) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms

    u.uTime.value = clock.getElapsedTime()
    u.uResolution.value.set(size.width, size.height)

    const targetX = (pointer.x + 1) * 0.5
    const targetY = (pointer.y + 1) * 0.5
    mouseRef.current.x += (targetX - mouseRef.current.x) * 0.08
    mouseRef.current.y += (targetY - mouseRef.current.y) * 0.08
    u.uMouse.value.copy(mouseRef.current)
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

export default function Work() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section ref={containerRef} className="relative min-h-screen w-full">
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: false, antialias: false }}
        dpr={[1, 1.5]}
        eventSource={containerRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <DistortionQuad />
      </Canvas>

      <div className="relative z-[5] flex flex-col justify-center min-h-screen pointer-events-none">
        <div className="max-w-5xl mx-auto w-full px-8 md:px-16">
          <p
            className="text-sm tracking-[0.3em] uppercase mb-16"
            style={{ fontFamily: "'Space Mono', monospace", color: '#c8f065' }}
          >
            Selected Work
          </p>
          <div className="space-y-1">
            {PROJECTS.map((p) => (
              <div
                key={p.name}
                className="group flex items-baseline justify-between py-6 border-b pointer-events-auto cursor-pointer transition-colors"
                style={{ borderColor: '#1a1a25' }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = '#c8f065'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = '#1a1a25'
                }}
              >
                <h3
                  className="text-4xl md:text-6xl font-bold tracking-tight transition-colors group-hover:!text-[#c8f065]"
                  style={{ fontFamily: "'Syne', sans-serif", color: '#e2e8f0' }}
                >
                  {p.name}
                </h3>
                <span
                  className="text-sm tracking-wider hidden sm:inline"
                  style={{ fontFamily: "'Space Mono', monospace", color: '#5a5a6e' }}
                >
                  {p.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
