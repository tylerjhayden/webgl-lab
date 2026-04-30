import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import vertexShader from './shaders/topology.vert'
import fragmentShader from './shaders/topology.frag'

const ATLAS_CHARS = ['∑', '∫', '√', 'λ', '∞', 'π', 'μ', 'Δ']
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
    <div ref={containerRef} className="relative w-full h-full bg-surface">
      <Canvas
        className="!absolute inset-0"
        gl={{ alpha: true, premultipliedAlpha: false, antialias: false }}
        dpr={[1, 1]}
        eventSource={containerRef as React.RefObject<HTMLElement>}
        eventPrefix="client"
      >
        <TopologyQuad />
      </Canvas>

      <div className="relative z-[5] flex flex-col items-center justify-center h-full pt-16 px-4 pointer-events-none">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="font-serif text-5xl font-bold text-text-primary leading-tight tracking-tight">
            Archive the
            <br />
            unwritten rules.
          </h1>

          <p className="text-text-secondary text-lg leading-relaxed">
            Preserve 10 years of engineering wisdom, permanently.
          </p>

          <div className="flex items-center justify-center gap-3 pointer-events-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-surface-raised/60 backdrop-blur-sm border border-border-subtle rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted text-sm w-64 focus:outline-none focus:border-accent transition-colors"
            />
            <button className="bg-accent hover:bg-accent-hover text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap">
              Get early access
            </button>
          </div>
        </div>
      </div>

      {/* Handwritten overlay with Caveat font */}
      <div className="absolute top-1/4 left-1/3 font-['Caveat',cursive] opacity-15 text-xl pointer-events-none">
        tribal
      </div>
      <div className="absolute top-1/3 right-1/4 font-['Caveat',cursive] opacity-15 text-xl pointer-events-none">
        unwritten
      </div>
      <div className="absolute bottom-1/3 left-1/4 font-['Caveat',cursive] opacity-15 text-xl pointer-events-none">
        10x
      </div>
      <div className="absolute bottom-1/4 right-1/3 font-['Caveat',cursive] opacity-15 text-xl pointer-events-none">
        legacy
      </div>
    </div>
  )
}
