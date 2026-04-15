import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/screen.vert'
import fragmentShader from './shaders/distortion.frag'

const PROJECTS = [
  { name: 'Meridian', category: 'Brand Identity', year: '2026' },
  { name: 'Voidscape', category: 'WebGL Experience', year: '2025' },
  { name: 'Nocturn', category: 'Product Design', year: '2025' },
  { name: 'Prismatic', category: 'Creative Direction', year: '2024' },
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
    <section id="work" ref={containerRef} className="relative min-h-screen w-full">
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: false, antialias: false }}
        dpr={[1, 1.5]}
        eventSource={containerRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <DistortionQuad />
      </Canvas>

      <div className="relative z-[5] flex flex-col justify-center min-h-screen py-24 pointer-events-none">
        <div className="max-w-6xl mx-auto w-full px-8 md:px-12">
          {/* Section label */}
          <div className="flex items-center gap-4 mb-16">
            <span
              className="text-[11px] tracking-[0.4em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace", color: '#c8f065' }}
            >
              <span style={{ color: '#c8f065' }}>02</span>
              <span className="mx-2" style={{ color: '#2a2a3a' }}>/</span>
              Selected Work
            </span>
            <div className="flex-1 h-px" style={{ background: '#1a1a28' }} />
          </div>

          {/* Project rows */}
          <div>
            {PROJECTS.map((p, i) => (
              <div key={p.name}>
                <div
                  className="group flex items-baseline gap-4 md:gap-8 py-6 md:py-8 pointer-events-auto cursor-pointer"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.querySelector<HTMLElement>('[data-name]')!.style.color = '#c8f065'
                    el.querySelector<HTMLElement>('[data-idx]')!.style.color = '#c8f065'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.querySelector<HTMLElement>('[data-name]')!.style.color = '#e2e8f0'
                    el.querySelector<HTMLElement>('[data-idx]')!.style.color = '#3a3a4e'
                  }}
                >
                  {/* Index */}
                  <span
                    data-idx
                    className="text-[11px] tracking-wider tabular-nums transition-colors duration-300"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      color: '#3a3a4e',
                      minWidth: '2.5ch',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Name */}
                  <h3
                    data-name
                    className="text-3xl md:text-5xl lg:text-[3.5rem] font-bold tracking-[-0.02em] transition-colors duration-300"
                    style={{ fontFamily: "'Syne', sans-serif", color: '#e2e8f0' }}
                  >
                    {p.name}
                  </h3>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Category */}
                  <span
                    className="text-[11px] tracking-[0.15em] uppercase hidden sm:inline"
                    style={{ fontFamily: "'Space Mono', monospace", color: '#4a4a5e' }}
                  >
                    {p.category}
                  </span>

                  {/* Year */}
                  <span
                    className="text-[11px] tracking-wider hidden md:inline"
                    style={{ fontFamily: "'Space Mono', monospace", color: '#2a2a3a' }}
                  >
                    {p.year}
                  </span>

                  {/* Arrow */}
                  <span
                    className="text-sm opacity-0 transition-all duration-300 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 hidden sm:inline"
                    style={{ color: '#c8f065' }}
                  >
                    &rarr;
                  </span>
                </div>

                {/* Separator */}
                <div className="h-px" style={{ background: '#1a1a28' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
