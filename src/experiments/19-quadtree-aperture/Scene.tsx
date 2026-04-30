import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/topology.vert'
import fragmentShader from './shaders/quadtree.frag'

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

function QuadtreeQuad() {
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
    <div className="relative w-full h-full bg-[#ebe6dc]">
      {/* WebGL layer */}
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1]}
      >
        <QuadtreeQuad />
      </Canvas>

      {/* DOM hero overlay */}
      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl pointer-events-none">
          <div className="bg-white/15 backdrop-blur-lg border border-white/25 rounded-3xl px-12 py-10 text-center space-y-6 shadow-[0_8px_32px_rgba(180,170,200,0.15)]">
            <h1 className="font-sans font-extralight uppercase tracking-[0.18em] text-5xl text-[#1f1d1a] leading-tight">
              // Zoom into what matters.
            </h1>

            <p className="text-[#5a554d] text-lg leading-relaxed">
              Detail on demand. Context always.
            </p>

            <div className="flex items-center justify-center gap-3 pointer-events-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-white/30 backdrop-blur-md border border-white/40 rounded-lg px-4 py-2.5 text-[#1f1d1a] placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-white/80 transition-colors"
              />
              <button className="bg-white/30 backdrop-blur-md border border-white/50 text-[#1f1d1a] hover:bg-white/50 rounded-full px-5 py-2.5 text-xs font-light tracking-wider uppercase transition-colors whitespace-nowrap">
                Focus the lens
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
