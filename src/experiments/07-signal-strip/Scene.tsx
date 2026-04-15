import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/signal.vert'
import fragmentShader from './shaders/signal.frag'

const METRICS = [
  { value: '10M+', label: 'API requests' },
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '<50ms', label: 'P99 latency' },
  { value: '2,000+', label: 'Teams worldwide' },
]

function SignalQuad() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
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
        transparent
        depthWrite={false}
      />
    </ScreenQuad>
  )
}

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative w-full h-full bg-surface">
      {/* WebGL layer */}
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1.5]}
        eventSource={containerRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <SignalQuad />
      </Canvas>

      {/* DOM metrics overlay */}
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-4xl w-full space-y-10">
          <h2 className="text-center text-2xl font-semibold text-text-primary tracking-tight">
            Trusted by teams that ship
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pointer-events-auto">
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className="bg-surface-raised/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6 text-center"
              >
                <div className="font-mono text-3xl font-bold text-text-primary">
                  {metric.value}
                </div>
                <div className="text-text-muted text-sm mt-1">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
