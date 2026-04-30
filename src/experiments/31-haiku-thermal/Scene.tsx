import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/topology.vert'
import fragmentShader from './shaders/topology.frag'

const ATLAS_CHARS = ['·', '.', '-', '+', '×', '#', '@', '█']
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
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.22  0 0 0 0 0.16  0 0 0 0 0.10  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`,
  )}")`

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-surface"
      style={
        {
          '--color-surface': '#e8dcc4',
          '--color-text-primary': '#382818',
          '--color-text-secondary': '#604a36',
          '--color-text-muted': '#8a7558',
          '--color-border-subtle': 'rgba(56, 40, 24, 0.22)',
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

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div
          className="relative max-w-2xl text-center space-y-6"
          style={{
            background: 'rgba(244, 236, 214, 0.88)',
            padding: '3rem 3.5rem',
            border: '1px solid rgba(184, 107, 66, 0.55)',
            outline: '1px solid rgba(184, 107, 66, 0.55)',
            outlineOffset: '5px',
          }}
        >
          {/* Cartographic registration ticks */}
          <span
            className="absolute select-none"
            style={{ top: '-12px', left: '-12px', color: '#b86b42', fontSize: '14px', lineHeight: 1 }}
          >
            +
          </span>
          <span
            className="absolute select-none"
            style={{ top: '-12px', right: '-12px', color: '#b86b42', fontSize: '14px', lineHeight: 1 }}
          >
            +
          </span>
          <span
            className="absolute select-none"
            style={{ bottom: '-12px', left: '-12px', color: '#b86b42', fontSize: '14px', lineHeight: 1 }}
          >
            +
          </span>
          <span
            className="absolute select-none"
            style={{ bottom: '-12px', right: '-12px', color: '#b86b42', fontSize: '14px', lineHeight: 1 }}
          >
            +
          </span>

          <h1
            className="text-5xl text-text-primary leading-tight tracking-tight"
            style={{
              fontFamily: "'Fraunces', 'Times New Roman', serif",
              fontStyle: 'italic',
              fontWeight: 600,
              fontVariationSettings: "'opsz' 96",
            }}
          >
            Where the
            <br />
            hot decisions live.
          </h1>

          <p
            className="text-text-secondary text-lg leading-relaxed"
            style={{ fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 400 }}
          >
            Trade-offs, captured before they cool.
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
                border: '1px solid rgba(56, 40, 24, 0.3)',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            />
            <button
              className="rounded-sm px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors"
              style={{
                background: '#382818',
                color: '#f0e8d8',
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
