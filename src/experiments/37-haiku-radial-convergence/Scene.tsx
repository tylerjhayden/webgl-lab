import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/topology.vert'
import fragmentShader from './shaders/topology.frag'

const ATLAS_CHARS = ['◦', '•', '◐', '◑', '●', '○', '◎', '⊙']
const CHAR_SIZE = 64
const ATLAS_WIDTH = CHAR_SIZE * ATLAS_CHARS.length

function createFontAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_WIDTH
  canvas.height = CHAR_SIZE
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, ATLAS_WIDTH, CHAR_SIZE)

  ctx.fillStyle = 'white'
  ctx.font = `${CHAR_SIZE * 0.8}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < ATLAS_CHARS.length; i++) {
    ctx.fillText(ATLAS_CHARS[i], i * CHAR_SIZE + CHAR_SIZE / 2, CHAR_SIZE / 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
}

function TopologyQuad() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  const atlas = useMemo(() => createFontAtlas(), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uAtlas: { value: atlas },
      uAtlasReady: { value: 1.0 },
    }),
    [atlas],
  )

  useEffect(() => () => atlas.dispose(), [atlas])

  useFrame(({ clock }) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms

    u.uTime.value = clock.getElapsedTime()
    u.uResolution.value.set(size.width, size.height)
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
  const [email, setEmail] = useState('')

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-surface overflow-hidden"
      style={
        {
          '--color-surface': '#0d0b10',
          '--color-text-primary': '#f0ecf5',
          '--color-text-secondary': '#bdb5c6',
          '--color-text-muted': '#7a7186',
        } as React.CSSProperties
      }
    >
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1]}
        eventSource={containerRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <TopologyQuad />
      </Canvas>

      {/* Caveat handwritten overlay — floats softly per memory: time-driven only, no pointer */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: '22%',
          left: '14%',
          fontFamily: "'Caveat', cursive",
          fontSize: '2.2rem',
          color: '#f5d68a',
          opacity: 0.12,
          transform: 'rotate(-6deg)',
          zIndex: 3,
        }}
      >
        light
      </div>
      <div
        className="absolute pointer-events-none select-none"
        style={{
          bottom: '24%',
          right: '16%',
          fontFamily: "'Caveat', cursive",
          fontSize: '2.6rem',
          color: '#e8b8c8',
          opacity: 0.12,
          transform: 'rotate(4deg)',
          zIndex: 3,
        }}
      >
        fluid
      </div>
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: '62%',
          left: '22%',
          fontFamily: "'Caveat', cursive",
          fontSize: '1.8rem',
          color: '#c8b8e8',
          opacity: 0.12,
          transform: 'rotate(-3deg)',
          zIndex: 3,
        }}
      >
        edge
      </div>

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1
            className="text-5xl text-text-primary leading-tight"
            style={{
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontWeight: 300,
              letterSpacing: '0.08em',
            }}
          >
            Every choice.
            <br />
            One source.
          </h1>

          <p
            className="text-text-secondary text-lg leading-relaxed tracking-wide"
            style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 400 }}
          >
            The decision protocol for AI software development.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none transition-colors"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.10)',
                fontFamily: "'Manrope', system-ui, sans-serif",
              }}
            />
            <button
              className="relative overflow-hidden font-medium px-5 py-2.5 rounded-lg text-sm whitespace-nowrap transition-all"
              style={{
                background:
                  'linear-gradient(135deg, #fde2a7 0%, #f5c2c7 50%, #d4c5e8 100%)',
                color: '#1a1418',
                backdropFilter: 'blur(8px)',
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontWeight: 500,
              }}
            >
              <span
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)',
                  mixBlendMode: 'overlay',
                }}
              />
              <span className="relative">Get early access</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
