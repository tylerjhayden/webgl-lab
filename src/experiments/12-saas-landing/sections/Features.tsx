import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import ShaderQuad from '../ShaderQuad'
import fragmentShader from '../shaders/aurora.frag'

const CARD_BASE = 'bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-6'

const FEATURES = [
  {
    icon: '>',
    title: 'Instant Deploys',
    description: 'Push to main. Live in seconds. Zero-downtime rollouts with automatic rollback.',
    wide: false,
  },
  {
    icon: '[]',
    title: 'Edge Functions',
    description: 'Run compute at the edge. Sub-10ms cold starts. 300+ locations worldwide.',
    wide: false,
  },
  {
    icon: '#',
    title: 'Real-time Analytics',
    description:
      'Monitor everything from request latency to error rates. Custom dashboards, instant alerts, zero config.',
    wide: true,
  },
  {
    icon: '~',
    title: 'Security',
    description: 'SOC 2 Type II. End-to-end encryption. Automatic vulnerability scanning on every deploy.',
    wide: false,
  },
  {
    icon: '@',
    title: 'Teams',
    description: 'Role-based access, audit logs, SSO. Built for teams that ship fast and sleep well.',
    wide: false,
  },
]

export default function Features() {
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
    <section ref={sectionRef} className="relative w-full py-24 bg-surface">
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1.5]}
      >
        <ShaderQuad fragmentShader={fragmentShader} pointerUvRef={pointerUvRef} />
      </Canvas>

      <div className="relative z-[5] max-w-4xl mx-auto px-6 pointer-events-none">
        <h2 className="text-3xl font-semibold text-text-primary text-center mb-12">
          Everything you need
        </h2>

        <div className="grid grid-cols-2 gap-4 pointer-events-auto">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`${CARD_BASE}${f.wide ? ' col-span-2' : ''}`}
            >
              <span className="font-mono text-accent text-lg">{f.icon}</span>
              <h3 className="font-mono text-lg font-medium text-text-primary mt-3 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
