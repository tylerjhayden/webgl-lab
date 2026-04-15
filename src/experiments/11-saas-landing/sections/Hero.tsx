import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import ShaderQuad from '../ShaderQuad'
import fragmentShader from '../shaders/void-grid.frag'

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null)

  return (
    <section ref={sectionRef} className="relative w-full h-screen bg-surface">
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1.5]}
        eventSource={sectionRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <ShaderQuad fragmentShader={fragmentShader} />
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
