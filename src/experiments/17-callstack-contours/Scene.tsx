import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/topology.vert'
import fragmentShader from './shaders/contours.frag'

// Box-drawing glyphs read as topographic isolines — light → heavy
const ATLAS_CHARS = ['─', '━', '═', '║', '╬', '╣', '╩', '╦']
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
  ctx.font = `${CHAR_SIZE * 0.85}px monospace`
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

function ContourQuad() {
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
  const [email, setEmail] = useState('')

  return (
    <div className="relative w-full h-full bg-[#f4f1e8] overflow-hidden">
      {/* WebGL layer */}
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1]}
      >
        <ContourQuad />
      </Canvas>

      {/* Paper-grain overlay — subtle SVG turbulence multiplied into the page */}
      <div
        aria-hidden
        className="absolute inset-0 z-[2] pointer-events-none mix-blend-multiply opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Giant frame-depth anchor numeral — sits behind the headline */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[3]">
        <span className="font-mono font-bold text-[#2a2620]/[0.06] text-[18rem] leading-none tracking-tighter select-none">
          0x7F
        </span>
      </div>

      {/* DOM hero overlay */}
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1
            className="text-6xl font-bold text-[#2a2620] leading-[1.05] tracking-tight"
            style={{ fontFamily: '"Crimson Pro", serif' }}
          >
            frame #14: lost context
          </h1>

          <p className="font-sans text-[#5e574d] text-lg leading-relaxed">
            Trace decisions back to the engineer who made them.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-white/60 backdrop-blur-sm border border-[#d4cdbe] rounded-lg px-4 py-2.5 text-[#2a2620] placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-[#738c61] transition-colors"
            />
            <button className="bg-[#738c61] hover:bg-[#849c72] text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
              Recover the frame
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
