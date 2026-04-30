import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/topology.vert'
import fragmentShader from './shaders/gravity.frag'

// Atlas index → arrow pointing TOWARD heading. Index derived from
// floor((atan2(dy,dx) + PI) / (2*PI) * 8): 0 ≈ -π → ←, 4 ≈ 0 → →, 6 ≈ +π/2 → ↑.
const ATLAS_CHARS = ['←', '↙', '↓', '↘', '→', '↗', '↑', '↖']
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
  ctx.font = `${CHAR_SIZE * 0.7}px monospace`
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

interface GravityQuadProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  h1Ref: React.RefObject<HTMLHeadingElement | null>
}

function GravityQuad({ containerRef, h1Ref }: GravityQuadProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  const atlas = useMemo(() => createFontAtlas(), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uAtlas: { value: atlas },
      uAtlasReady: { value: 1.0 },
      uHeadingCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uHeadingHalfSize: { value: new THREE.Vector2(0.18, 0.06) },
    }),
    [atlas],
  )

  useFrame(({ clock }) => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms
    u.uTime.value = clock.getElapsedTime()
    u.uResolution.value.set(size.width, size.height)
  })

  // Heading bbox only changes on layout (resize, font-load, content swap) — not per
  // frame. Computing it in useFrame forces a sync layout flush every tick at 60Hz.
  useEffect(() => {
    const updateBbox = () => {
      if (!materialRef.current || !h1Ref.current || !containerRef.current) return
      const rect = h1Ref.current.getBoundingClientRect()
      const canvasRect = containerRef.current.getBoundingClientRect()
      if (canvasRect.width === 0 || canvasRect.height === 0) return

      const cx = (rect.left + rect.width / 2 - canvasRect.left) / canvasRect.width
      // Flip Y to UV space (0 bottom, 1 top)
      const cy = 1.0 - (rect.top + rect.height / 2 - canvasRect.top) / canvasRect.height
      const hw = rect.width / 2 / canvasRect.width
      const hh = rect.height / 2 / canvasRect.height

      const u = materialRef.current.uniforms
      u.uHeadingCenter.value.set(cx, cy)
      u.uHeadingHalfSize.value.set(hw, hh)
    }

    updateBbox()

    const h1 = h1Ref.current
    const container = containerRef.current
    if (!h1 || !container) return

    const observer = new ResizeObserver(updateBbox)
    observer.observe(h1)
    observer.observe(container)
    return () => observer.disconnect()
  }, [containerRef, h1Ref])

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
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const [email, setEmail] = useState('')

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#f4f1e8] overflow-hidden">
      {/* WebGL layer */}
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1]}
      >
        <GravityQuad containerRef={containerRef} h1Ref={h1Ref} />
      </Canvas>

      {/* Paper-grain overlay */}
      <div
        aria-hidden
        className="absolute inset-0 z-[2] pointer-events-none mix-blend-multiply opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Anchor mark — typographic pilcrow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[3]">
        <span
          className="font-bold text-[#2a2620]/[0.06] text-[18rem] leading-none select-none"
          style={{ fontFamily: '"Lora", serif' }}
        >
          ¶
        </span>
      </div>

      {/* DOM hero overlay */}
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1
            ref={h1Ref}
            className="text-6xl font-bold text-[#2a2620] leading-[1.05] tracking-tight inline-block"
            style={{ fontFamily: '"Lora", serif' }}
          >
            answers find their gravity.
          </h1>

          <p className="font-sans text-[#5e574d] text-lg leading-relaxed">
            Set a question on the page; the right people drift toward it like iron filings.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-white/60 backdrop-blur-sm border border-[#d4cdbe] rounded-lg px-4 py-2.5 text-[#2a2620] placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-[#5a6e3f] transition-colors"
            />
            <button className="bg-[#5a6e3f] hover:bg-[#6c8049] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
              Pull the answers
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
