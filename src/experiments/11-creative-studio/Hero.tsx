import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/screen.vert'
import fragmentShader from './shaders/displacement.frag'

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

    const targetX = (pointer.x + 1) * 0.5
    const targetY = (pointer.y + 1) * 0.5
    mouseRef.current.x += (targetX - mouseRef.current.x) * 0.08
    mouseRef.current.y += (targetY - mouseRef.current.y) * 0.08
    u.uMouse.value.copy(mouseRef.current)

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
      <style>{`
        @keyframes heroFade {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-reveal {
          opacity: 0;
          animation: heroFade 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-line {
          transform-origin: left;
          animation: lineGrow 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform: scaleX(0);
        }
        @keyframes lineGrow {
          to { transform: scaleX(1); }
        }
      `}</style>

      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: false, antialias: false }}
        dpr={[1, 1.5]}
        eventSource={containerRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <DisplacementQuad />
      </Canvas>

      <div className="relative z-[5] flex flex-col h-full pointer-events-none select-none">
        {/* Top chrome */}
        <div
          className="flex justify-between items-start px-8 md:px-12 pt-8 md:pt-10 hero-reveal"
          style={{ animationDelay: '0.6s' }}
        >
          <p
            className="text-[11px] tracking-[0.4em] uppercase"
            style={{ fontFamily: "'Space Mono', monospace", color: '#4a4a5e' }}
          >
            <span style={{ color: '#c8f065' }}>01</span>
            <span className="mx-2" style={{ color: '#2a2a3a' }}>/</span>
            Creative Studio
          </p>
          <p
            className="text-[11px] tracking-[0.3em] uppercase hidden md:block"
            style={{ fontFamily: "'Space Mono', monospace", color: '#2a2a3a' }}
          >
            &copy; 2026
          </p>
        </div>

        {/* Main heading — centered mass */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="text-center">
            <span
              className="block text-[clamp(2.5rem,9vw,8rem)] font-extrabold leading-[0.92] tracking-[-0.03em] hero-reveal"
              style={{ color: '#e8ecf4', animationDelay: '0.1s' }}
            >
              We build
            </span>
            <span
              className="block text-[clamp(2.5rem,9vw,8rem)] font-extrabold leading-[0.92] tracking-[-0.03em] hero-reveal"
              style={{ color: '#e8ecf4', animationDelay: '0.2s' }}
            >
              digital
            </span>
            <span
              className="block text-[clamp(2.5rem,9vw,8rem)] font-extrabold leading-[0.92] tracking-[-0.03em] hero-reveal"
              style={{ color: '#c8f065', animationDelay: '0.3s' }}
            >
              worlds.
            </span>
          </h1>
          <p
            className="mt-8 text-center text-[13px] md:text-sm leading-[1.8] max-w-md hero-reveal"
            style={{ fontFamily: "'Space Mono', monospace", color: '#5a6370', animationDelay: '0.45s' }}
          >
            Design, motion, and code &mdash; forged into
            <br />
            experiences that move people.
          </p>
        </div>

        {/* Bottom bar */}
        <div
          className="px-8 md:px-12 pb-8 md:pb-10 hero-reveal"
          style={{ animationDelay: '0.7s' }}
        >
          <div
            className="hero-line h-px mb-5"
            style={{ background: '#1a1a28', animationDelay: '0.75s' }}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6 pointer-events-auto">
              <a
                href="#work"
                className="group flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase transition-all"
                style={{ fontFamily: "'Syne', sans-serif", color: '#c8f065' }}
              >
                View Work
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>
              <button
                className="text-[11px] font-bold tracking-[0.2em] uppercase transition-colors hover:!text-[#e8ecf4]"
                style={{ fontFamily: "'Syne', sans-serif", color: '#4a4a5e' }}
              >
                Contact
              </button>
            </div>
            <p
              className="text-[10px] tracking-[0.4em] uppercase hidden md:flex items-center gap-3"
              style={{ fontFamily: "'Space Mono', monospace", color: '#2a2a3a' }}
            >
              <span className="inline-block w-5 h-px" style={{ background: '#2a2a3a' }} />
              Scroll
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
