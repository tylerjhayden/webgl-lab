import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import ShaderQuad from '../ShaderQuad'
import fragmentShader from '../shaders/void-grid.frag'

const THEME = {
  '--color-accent': '#C97A3D',
  '--color-accent-hover': '#A86530',
} as React.CSSProperties

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const pointerUvRef = useRef(new THREE.Vector2(0.5, 0.5))

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1 - (e.clientY - rect.top) / rect.height
      pointerUvRef.current.set(x, y)
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full h-screen bg-surface" style={THEME}>
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1.5]}
      >
        <ShaderQuad fragmentShader={fragmentShader} pointerUvRef={pointerUvRef} />
      </Canvas>

      <div className="relative z-[5] flex flex-col items-center justify-center h-full px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="font-mono text-5xl font-bold text-text-primary leading-tight tracking-tight">
            Deploy at the speed
            <br />
            of thought.
          </h1>

          <p className="text-text-secondary text-lg leading-relaxed">
            Infrastructure that disappears.
            <br />
            So your code doesn&rsquo;t have to.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto">
            <button className="bg-accent hover:bg-accent-hover text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
              Start building
            </button>
            <button className="border border-border-subtle text-text-secondary hover:text-text-primary font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
              Read docs
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
