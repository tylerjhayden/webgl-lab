import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/topology.vert'
import fragmentShader from './shaders/topology.frag'

const ATLAS_CHARS = ['÷', '×', '±', '≈', '∞', '+', '=', '-']
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

  const paperGrain = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.20  0 0 0 0 0.18  0 0 0 0 0.12  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
  )}")`

  const quadRule = `repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 23px,
      rgba(42, 38, 32, 0.05) 23px,
      rgba(42, 38, 32, 0.05) 24px
    ),
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 23px,
      rgba(42, 38, 32, 0.05) 23px,
      rgba(42, 38, 32, 0.05) 24px
    )`

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-surface"
      style={
        {
          '--color-surface': '#ede4cf',
          '--color-text-primary': '#2a2620',
          '--color-text-secondary': '#5a544a',
          '--color-text-muted': '#8a8478',
          '--color-border-subtle': 'rgba(42, 38, 32, 0.20)',
        } as React.CSSProperties
      }
    >
      {/* Quad-rule grid — engineer's notebook */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: quadRule,
          zIndex: 1,
        }}
      />

      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1]}
        eventSource={containerRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <TopologyQuad />
      </Canvas>

      {/* Paper grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: paperGrain,
          opacity: 0.07,
          mixBlendMode: 'multiply',
          zIndex: 2,
        }}
      />

      {/* Marginal annotation */}
      <div
        className="absolute bottom-8 right-10 pointer-events-none"
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: '1.4rem',
          color: '#5c4230',
          opacity: 0.55,
          transform: 'rotate(-3deg)',
          zIndex: 3,
        }}
      >
        fig. 1
      </div>

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1
            className="text-5xl text-text-primary leading-tight tracking-tight"
            style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontStyle: 'italic',
              fontWeight: 600,
            }}
          >
            Every decision.
            <br />
            Fully connected.
          </h1>

          <p
            className="text-text-secondary text-lg leading-relaxed"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400 }}
          >
            Map the why across your stack.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="rounded-sm px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none transition-colors"
              style={{
                background: 'rgba(255, 250, 238, 0.7)',
                border: '1px solid rgba(42, 38, 32, 0.3)',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            />
            <button
              className="rounded-sm px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                background: '#2a2620',
                color: '#ede4cf',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Get early access
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
